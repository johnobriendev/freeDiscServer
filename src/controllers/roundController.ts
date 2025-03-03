// src/controllers/roundController.ts

import { Request, Response, NextFunction } from 'express';

export const createRound = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, date = new Date(), playerNames = [], participantIds = [] } = req.body;
    const ownerId = req.user!.id;

    // Check if course exists
    const existingCourse = await req.prisma.course.findUnique({
      where: { id: courseId },
      include: { holes: true }
    });

    if (!existingCourse) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Create round with owner as a player
    const round = await req.prisma.round.create({
      data: {
        courseId,
        ownerId,
        date: new Date(date),
        // Add owner to participants
        participants: {
          connect: [{ id: ownerId }]
        },
        // Create players from names array and add owner as a player
        players: {
          create: [
            // Add owner as a player
            {
              name: `${req.user!.firstName || ''} ${req.user!.lastName || ''}`.trim() || req.user!.email,
              userId: ownerId
            },
            // Add named players without user accounts
            ...playerNames.map(name => ({ name })),
            // Add participants as players
            ...participantIds.map(id => ({
              name: '', // Will be filled in the next step
              userId: id
            }))
          ]
        }
      },
      include: {
        players: true,
        participants: true,
        course: {
          include: {
            holes: {
              orderBy: {
                holeNumber: 'asc'
              }
            }
          }
        }
      }
    });

    // Update player names for participants
    for (const player of round.players) {
      if (player.userId && player.userId !== ownerId && !player.name) {
        const user = await req.prisma.user.findUnique({
          where: { id: player.userId }
        });
        
        if (user) {
          await req.prisma.player.update({
            where: { id: player.id },
            data: {
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
            }
          });
        }
      }
    }

    // Initialize scores for all players and holes
    //const scorePromises = [];
    const scorePromises: Promise<any>[] = [];

    for (const player of round.players) {
      for (const hole of round.course.holes) {
        scorePromises.push(
          req.prisma.score.create({
            data: {
              playerId: player.id,
              holeId: hole.id,
              strokes: 0 // Default score, will be updated during play
            }
          })
        );
      }
    }

    await Promise.all(scorePromises);

    // Get the updated round with all information
    const updatedRound = await req.prisma.round.findUnique({
      where: { id: round.id },
      include: {
        players: {
          include: {
            scores: {
              include: {
                hole: true
              }
            }
          }
        },
        participants: true,
        course: {
          include: {
            holes: {
              orderBy: {
                holeNumber: 'asc'
              }
            }
          }
        }
      }
    });

    res.status(201).json(updatedRound);
  } catch (error) {
    next(error);
  }
};

export const getRounds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const rounds = await req.prisma.round.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { participants: { some: { id: userId } } }
        ]
      },
      include: {
        course: true,
        players: true,
        participants: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(rounds);
  } catch (error) {
    next(error);
  }
};

export const getRoundById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const round = await req.prisma.round.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            scores: {
              include: {
                hole: true
              }
            }
          }
        },
        participants: true,
        course: {
          include: {
            holes: {
              orderBy: {
                holeNumber: 'asc'
              }
            }
          }
        }
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

    res.json(round);
  } catch (error) {
    next(error);
  }
};

export const updateRoundStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    const round = await req.prisma.round.findUnique({
      where: { id },
      include: {
        participants: true
      }
    });

    if (!round) {
      res.status(404).json({ message: 'Round not found' });
      return;
    }

    // Check if user is owner or participant
    if (round.ownerId !== userId && !round.participants.some(p => p.id === userId)) {
      res.status(403).json({ message: 'Not authorized to update this round' });
      return;
    }

    const updatedRound = await req.prisma.round.update({
      where: { id },
      data: { status },
      include: {
        players: {
          include: {
            scores: {
              include: {
                hole: true
              }
            }
          }
        },
        participants: true,
        course: {
          include: {
            holes: true
          }
        }
      }
    });

    res.json(updatedRound);
  } catch (error) {
    next(error);
  }
};

export const addPlayerToRound = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roundId } = req.params;
    const { name, userId } = req.body;
    const currentUserId = req.user!.id;

    // Check if round exists
    const round = await req.prisma.round.findUnique({
      where: { id: roundId },
      include: {
        participants: true,
        course: {
          include: {
            holes: true
          }
        }
      }
    });

    if (!round) {
      res.status(404).json({ message: 'Round not found' });
      return;
    }

    // Check if user is owner or participant
    if (round.ownerId !== currentUserId && !round.participants.some(p => p.id === currentUserId)) {
      res.status(403).json({ message: 'Not authorized to update this round' });
      return;
    }

    // If userId is provided, check if user exists
    let playerName = name;
    if (userId) {
      const user = await req.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      playerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

      // Add user to participants if not already a participant
      if (!round.participants.some(p => p.id === userId)) {
        await req.prisma.round.update({
          where: { id: roundId },
          data: {
            participants: {
              connect: [{ id: userId }]
            }
          }
        });
      }
    }

    // Create player
    const player = await req.prisma.player.create({
      data: {
        name: playerName,
        roundId,
        userId
      }
    });

    // Initialize scores for the player for all holes
    const scorePromises = round.course.holes.map(hole => 
      req.prisma.score.create({
        data: {
          playerId: player.id,
          holeId: hole.id,
          strokes: 0
        }
      })
    );

    await Promise.all(scorePromises);

    // Get the updated player with scores
    const updatedPlayer = await req.prisma.player.findUnique({
      where: { id: player.id },
      include: {
        scores: {
          include: {
            hole: true
          }
        }
      }
    });

    res.status(201).json(updatedPlayer);
  } catch (error) {
    next(error);
  }
};

export const updateScore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roundId, playerId, holeId } = req.params;
    const { strokes } = req.body;
    const currentUserId = req.user!.id;

    // Check if round exists
    const round = await req.prisma.round.findUnique({
      where: { id: roundId },
      include: {
        participants: true
      }
    });

    if (!round) {
      res.status(404).json({ message: 'Round not found' });
      return;
    }

    // Check if user is owner or participant
    if (round.ownerId !== currentUserId && !round.participants.some(p => p.id === currentUserId)) {
      res.status(403).json({ message: 'Not authorized to update this round' });
      return;
    }

    // Check if player exists and belongs to the round
    const player = await req.prisma.player.findFirst({
      where: {
        id: playerId,
        roundId
      }
    });

    if (!player) {
      res.status(404).json({ message: 'Player not found in this round' });
      return;
    }

    // Find score entry
    const score = await req.prisma.score.findFirst({
      where: {
        playerId,
        holeId
      }
    });

    if (!score) {
      // Create score if it doesn't exist
      const newScore = await req.prisma.score.create({
        data: {
          playerId,
          holeId,
          strokes: parseInt(strokes as string)
        }
      });
      res.json(newScore);
      return;
    }

    // Update score
    const updatedScore = await req.prisma.score.update({
      where: {
        id: score.id
      },
      data: {
        strokes: parseInt(strokes as string)
      }
    });

    res.json(updatedScore);
  } catch (error) {
    next(error);
  }
};