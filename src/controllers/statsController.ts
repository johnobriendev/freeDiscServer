// src/controllers/statsController.ts

import '../types';
import { Request, Response, NextFunction } from 'express';

// Define types for our statistics
interface BestRound {
  date: Date;
  courseName: string;
  score: number;
  par: number;
  relativeToPar: number;
}

interface CourseStats {
  courseName: string;
  rounds: number;
  averagePerHole: string | number;
  relativeToPar: number;
}

interface HoleScore {
  holeNumber: number;
  par: number;
  strokes: number;
  relativeToPar: number;
  scoreName: string;
}

export const getPlayerStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    // Get all completed rounds where the user was a player
    const playerRounds = await req.prisma.player.findMany({
      where: {
        userId,
        round: {
          status: 'COMPLETED'
        }
      },
      include: {
        round: {
          include: {
            course: true
          }
        },
        scores: {
          include: {
            hole: true
          }
        }
      }
    });

    if (playerRounds.length === 0) {
      return res.json({
        message: 'No completed rounds found',
        stats: {
          totalRounds: 0,
          coursesPlayed: 0,
          averageScore: 0,
          bestRound: null
        }
      });
    }

    // Calculate total rounds played
    const totalRounds = playerRounds.length;

    // Calculate unique courses played
    const courseIds = new Set(playerRounds.map(pr => pr.round.courseId));
    const coursesPlayed = courseIds.size;

    // Calculate average score across all rounds
    let totalStrokes = 0;
    let totalHoles = 0;
    
    playerRounds.forEach(pr => {
      pr.scores.forEach(score => {
        if (score.strokes > 0) { // Only count holes that have been scored
          totalStrokes += score.strokes;
          totalHoles += 1;
        }
      });
    });

    const averageScore = totalHoles > 0 ? (totalStrokes / totalHoles).toFixed(2) : 0;

    // Find best round (lowest strokes relative to par)
    let bestRound: BestRound | null = null;
    let bestPerformance = Infinity;

    for (const pr of playerRounds) {
      let roundStrokes = 0;
      let roundPar = 0;
      let holesPlayed = 0;

      pr.scores.forEach(score => {
        if (score.strokes > 0) {
          roundStrokes += score.strokes;
          roundPar += score.hole.par;
          holesPlayed++;
        }
      });

      if (holesPlayed > 0) {
        const performance = roundStrokes - roundPar;
        if (performance < bestPerformance) {
          bestPerformance = performance;
          bestRound = {
            date: pr.round.date,
            courseName: pr.round.course.name,
            score: roundStrokes,
            par: roundPar,
            relativeToPar: performance
          };
        }
      }
    }

    // Calculate per-course statistics
    const courseStats: CourseStats[] = [];
    
    for (const courseId of courseIds) {
      const courseRounds = playerRounds.filter(pr => pr.round.courseId === courseId);
      const courseName = courseRounds[0].round.course.name;
      let courseStrokes = 0;
      let coursePar = 0;
      let courseHoles = 0;
      
      courseRounds.forEach(cr => {
        cr.scores.forEach(score => {
          if (score.strokes > 0) {
            courseStrokes += score.strokes;
            coursePar += score.hole.par;
            courseHoles++;
          }
        });
      });
      
      const averagePerHole = courseHoles > 0 ? (courseStrokes / courseHoles).toFixed(2) : 0;
      const relativeToPar = courseHoles > 0 ? (courseStrokes - coursePar) : 0;
      
      courseStats.push({
        courseName,
        rounds: courseRounds.length,
        averagePerHole,
        relativeToPar
      });
    }

    res.json({
      totalRounds,
      coursesPlayed,
      averageScore,
      bestRound,
      courseStats
    });
  } catch (error) {
    next(error);
  }
};

export const getRoundStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roundId } = req.params;
    const userId = req.user!.id;

    // Get the round with all player scores
    const round = await req.prisma.round.findUnique({
      where: { id: roundId },
      include: {
        course: {
          include: {
            holes: {
              orderBy: {
                holeNumber: 'asc'
              }
            }
          }
        },
        players: {
          include: {
            scores: {
              include: {
                hole: true
              }
            }
          }
        },
        participants: true
      }
    });
    

    if (!round) {
      res.status(404).json({ message: 'Round not found' });
      return;
    }

    // Check if user is owner or participant
    if (round.ownerId !== userId && !round.participants.some(p => p.id === userId)) {
      res.status(403).json({ message: 'Not authorized to view this round' });
      return;
    }

    // Calculate statistics for each player
    const playerStats = round.players.map(player => {
      let totalStrokes = 0;
      let totalPar = 0;
      const holeScores: HoleScore[] = [];

      // Group scores by hole and calculate stats
      round.course.holes.forEach(hole => {
        const score = player.scores.find(s => s.hole.id === hole.id);
        
        if (score && score.strokes > 0) {
          totalStrokes += score.strokes;
          totalPar += hole.par;
          
          // Determine score name (birdie, par, bogey, etc.)
          let scoreName = '';
          const relativeToPar = score.strokes - hole.par;
          
          if (relativeToPar === -3) scoreName = 'Albatross';
          else if (relativeToPar === -2) scoreName = 'Eagle';
          else if (relativeToPar === -1) scoreName = 'Birdie';
          else if (relativeToPar === 0) scoreName = 'Par';
          else if (relativeToPar === 1) scoreName = 'Bogey';
          else if (relativeToPar === 2) scoreName = 'Double Bogey';
          else if (relativeToPar === 3) scoreName = 'Triple Bogey';
          else if (relativeToPar < 0) scoreName = `${Math.abs(relativeToPar)} Under Par`;
          else scoreName = `${relativeToPar} Over Par`;
          
          holeScores.push({
            holeNumber: hole.holeNumber,
            par: hole.par,
            strokes: score.strokes,
            relativeToPar,
            scoreName
          });
        }
      });

      // Count score types
      const scoreTypes = {
        birdiesOrBetter: holeScores.filter(s => s.relativeToPar < 0).length,
        pars: holeScores.filter(s => s.relativeToPar === 0).length,
        bogeys: holeScores.filter(s => s.relativeToPar === 1).length,
        doubleBogeyOrWorse: holeScores.filter(s => s.relativeToPar > 1).length
      };

      return {
        player: {
          id: player.id,
          name: player.name,
          userId: player.userId
        },
        totalScore: totalStrokes,
        relativeToPar: totalStrokes - totalPar,
        scoreTypes,
        holeScores
      };
    });

    // Sort players by score
    playerStats.sort((a, b) => a.totalScore - b.totalScore);

    res.json({
      roundInfo: {
        id: round.id,
        date: round.date,
        status: round.status,
        course: {
          id: round.course.id,
          name: round.course.name
        }
      },
      playerStats
    });
  } catch (error) {
    next(error);
  }
};