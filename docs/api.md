# Golf Scorecard API Documentation

## Base URL

All endpoints are prefixed with: `http://localhost:5000/api`

In production, this would be your deployed API URL.

## Authentication

Most endpoints require authentication using a JWT token.

### Headers for Authenticated Requests

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Authentication Endpoints

### Register a New User

Creates a new user account and returns a JWT token.
* **URL**: /auth/register
* **Method**: POST
* **Authentication**: None
* **Request Body**:

```json
{ "email": "user@example.com", "password": "password123", "firstName": "John", "lastName": "Doe" }
```
* **Success Response**:
   * **Code**: `201 Created`
   * **Content**:

```json
{ "message": "User registered successfully", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...", "user": { "id": "123e4567-e89b-12d3-a456-426614174000", "email": "user@example.com", "firstName": "John", "lastName": "Doe" } }
```
* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid input
   * **Code**: `409 Conflict` - Email already exists

### Login

Authenticates a user and returns a JWT token.
* **URL**: `/auth/login`
* **Method**: `POST`
* **Authentication**: None
* **Request Body**:

```json
{ "email": "user@example.com", "password": "password123" }
```
* **Success Response**:
   * **Code**: `200 OK`
   * **Content**:

```json
{ "message": "Login successful", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...", "user": { "id": "123e4567-e89b-12d3-a456-426614174000", "email": "user@example.com", "firstName": "John", "lastName": "Doe" } }
```
* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid input
   * **Code**: `401 Unauthorized` - Invalid credentials

### Get User Profile

Retrieves the authenticated user's profile.

* **URL**: `/auth/profile`
* **Method**: `GET`
* **Authentication**: Required
* **Success Response**:
   * **Code**: `200 OK`
   * **Content**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2023-05-20T15:30:45.123Z"
}
```

* **Error Responses**:
   * **Code**: `401 Unauthorized` - Missing or invalid token

## User Management Endpoints

### Get User Profile with Stats

Retrieves the user's profile with additional statistics.

* **URL**: `/users/profile`
* **Method**: `GET`
* **Authentication**: Required
* **Success Response**:
   * **Code**: `200 OK`
   * **Content**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2023-05-20T15:30:45.123Z",
  "stats": {
    "coursesCreated": 5,
    "roundsCreated": 12,
    "roundsParticipated": 18,
    "totalRounds": 20
  }
}
```

* **Error Responses**:
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `404 Not Found` - User not found

### Update User Profile

Updates the user's profile information.

* **URL**: `/users/profile`
* **Method**: `PATCH`
* **Authentication**: Required
* **Request Body**:

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com"
}
```

* **Success Response**:
   * **Code**: `200 OK`
   * **Content**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.smith@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "createdAt": "2023-05-20T15:30:45.123Z"
}
```

* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid input
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `409 Conflict` - Email already in use

### Update Password

Updates the user's password.

* **URL**: `/users/password`
* **Method**: `PATCH`
* **Authentication**: Required
* **Request Body**:

```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

* **Success Response**:
   * **Code**: `200 OK`
   * **Content**:

```json
{
  "message": "Password updated successfully"
}
```

* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid input
   * **Code**: `401 Unauthorized` - Current password is incorrect

## Course Endpoints

### Create a Course

Creates a new golf course with holes.

* **URL**: `/courses`
* **Method**: `POST`
* **Authentication**: Required
* **Request Body**:

```json
{
  "name": "Pine Hills Disc Golf",
  "location": "Pine Hills Park",
  "description": "A challenging 18-hole course with varied terrain",
  "holeCount": 18,
  "holeLengths": [280, 350, 420, 275, 310, 380, 290, 320, 365, 285, 340, 400, 330, 295, 370, 425, 315, 360]
}
```

* **Success Response**:
   * **Code**: `201 Created`
   * **Content**: Full course object with holes

* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid input
   * **Code**: `401 Unauthorized` - Missing or invalid token

### Get All Courses

Retrieves all courses.

* **URL**: `/courses`
* **Method**: `GET`
* **Authentication**: Required
* **Success Response**:
   * **Code**: `200 OK`
   * **Content**: Array of course objects with holes

* **Error Responses**:
   * **Code**: `401 Unauthorized` - Missing or invalid token

### Get Course by ID

Retrieves a specific course by ID.

* **URL**: `/courses/:id`
* **Method**: `GET`
* **Authentication**: Required
* **URL Parameters**: id - Course ID
* **Success Response**:
   * **Code**: `200 OK`
   * **Content**: Course object with holes

* **Error Responses**:
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `404 Not Found` - Course not found

### Update Course

Updates a course's information.

* **URL**: `/courses/:id`
* **Method**: `PATCH`
* **Authentication**: Required
* **URL Parameters**: id - Course ID
* **Request Body**:

```json
{
  "name": "Updated Course Name",
  "description": "Updated course description"
}
```

* **Success Response**:
   * **Code**: `200 OK`
   * **Content**: Updated course object with holes

* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid input
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `403 Forbidden` - Not authorized to update this course
   * **Code**: `404 Not Found` - Course not found

### Delete Course

Deletes a course and all associated holes.

* **URL**: `/courses/:id`
* **Method**: `DELETE`
* **Authentication**: Required
* **URL Parameters**: id - Course ID
* **Success Response**:
   * **Code**: `200 OK`
   * **Content**:

```json
{
  "message": "Course deleted successfully"
}
```

* **Error Responses**:
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `403 Forbidden` - Not authorized to delete this course
   * **Code**: `404 Not Found` - Course not found

### Update Hole

Updates information for a specific hole on a course.

* **URL**: `/courses/:courseId/holes/:holeNumber`
* **Method**: `PATCH`
* **Authentication**: Required
* **URL Parameters**:
   * courseId - Course ID
   * holeNumber - Hole number

* **Request Body**:

```json
{
  "par": 3,
  "lengthFeet": 275
}
```

* **Success Response**:
   * **Code**: `200 OK`
   * **Content**: Updated hole object

* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid input
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `403 Forbidden` - Not authorized to update this course
   * **Code**: `404 Not Found` - Course or hole not found

### Search Courses

Searches and filters courses.

* **URL**: `/courses/search`
* **Method**: `GET`
* **Query Parameters**:
   * search (optional) - Search term for name or location
   * minHoles (optional) - Minimum number of holes
   * maxHoles (optional) - Maximum number of holes
   * createdBy (optional) - User ID of course creator
   * sortBy (optional) - Field to sort by (name, location, holeCount, createdAt)
   * sortOrder (optional) - Sort direction (asc, desc)

* **Success Response**:
   * **Code**: `200 OK`
   * **Content**:

```json
{
  "count": 2,
  "courses": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Pine Hills Disc Golf",
      "location": "Pine Hills Park",
      "description": "A challenging 18-hole course",
      "holeCount": 18,
      "createdAt": "2023-05-20T15:30:45.123Z",
      "updatedAt": "2023-05-20T15:30:45.123Z",
      "ownerId": "098f6bcd-4621-3373-8ade-4e832627b4f6",
      "holes": [...],
      "rounds": 5,
      "averagePar": 3.2,
      "totalLength": 5670
    },
    ...
  ]
}
```

* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid query parameters

## Round Endpoints

### Create a Round

Creates a new round on a course.

* **URL**: `/rounds`
* **Method**: `POST`
* **Authentication**: Required
* **Request Body**:

```json
{
  "courseId": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2023-06-15T14:00:00Z", // Optional, defaults to current time
  "playerNames": ["John", "Sarah"], // Optional, guest players
  "participantIds": ["098f6bcd-4621-3373-8ade-4e832627b4f6"] // Optional, registered users
}
```

* **Success Response**:
   * **Code**: `201 Created`
   * **Content**: Full round object with players and initialized scores

* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid input
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `404 Not Found` - Course not found

### Get All Rounds

Retrieves all rounds for the authenticated user.

* **URL**: `/rounds`
* **Method**: `GET`
* **Authentication**: Required
* **Success Response**:
   * **Code**: `200 OK`
   * **Content**: Array of round objects

* **Error Responses**:
   * **Code**: `401 Unauthorized` - Missing or invalid token

### Get Round by ID

Retrieves a specific round with detailed information.

* **URL**: `/rounds/:id`
* **Method**: `GET`
* **Authentication**: Required
* **URL Parameters**: id - Round ID
* **Success Response**:
   * **Code**: `200 OK`
   * **Content**: Round object with players, scores, and course information

* **Error Responses**:
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `403 Forbidden` - Not authorized to view this round
   * **Code**: `404 Not Found` - Round not found

### Update Round Status

Updates the status of a round.

* **URL**: `/rounds/:id/status`
* **Method**: `PATCH`
* **Authentication**: Required
* **URL Parameters**: id - Round ID
* **Request Body**:

```json
{
  "status": "COMPLETED" // Options: IN_PROGRESS, COMPLETED, CANCELED
}
```

* **Success Response**:
   * **Code**: `200 OK`
   * **Content**: Updated round object

* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid status
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `403 Forbidden` - Not authorized to update this round
   * **Code**: `404 Not Found` - Round not found

### Add Player to Round

Adds a new player to an existing round.

* **URL**: `/rounds/:roundId/players`
* **Method**: `POST`
* **Authentication**: Required
* **URL Parameters**: roundId - Round ID
* **Request Body**:

```json
{
  "name": "Mike", // For guest players
  "userId": "098f6bcd-4621-3373-8ade-4e832627b4f6" // Optional, for registered users
}
```

* **Success Response**:
   * **Code**: `201 Created`
   * **Content**: New player object with initialized scores

* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid input
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `403 Forbidden` - Not authorized to update this round
   * **Code**: `404 Not Found` - Round or user not found

### Update Score

Updates a player's score for a specific hole.

* **URL**: `/rounds/:roundId/players/:playerId/holes/:holeId/score`
* **Method**: `PATCH`
* **Authentication**: Required
* **URL Parameters**:
   * roundId - Round ID
   * playerId - Player ID
   * holeId - Hole ID

* **Request Body**:

```json
{
  "strokes": 3
}
```

* **Success Response**:
   * **Code**: `200 OK`
   * **Content**: Updated score object

* **Error Responses**:
   * **Code**: `400 Bad Request` - Invalid strokes value
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `403 Forbidden` - Not authorized to update this round
   * **Code**: `404 Not Found` - Round, player, or hole not found

## Statistics Endpoints

### Get Player Statistics

Retrieves statistics for the authenticated player.

* **URL**: `/stats/player`
* **Method**: `GET`
* **Authentication**: Required
* **Success Response**:
   * **Code**: `200 OK`
   * **Content**:

```json
{
  "totalRounds": 20,
  "coursesPlayed": 8,
  "averageScore": "3.5",
  "bestRound": {
    "date": "2023-06-10T14:30:00Z",
    "courseName": "Pine Hills Disc Golf",
    "score": 54,
    "par": 58,
    "relativeToPar": -4
  },
  "courseStats": [
    {
      "courseName": "Pine Hills Disc Golf",
      "rounds": 5,
      "averagePerHole": "3.2",
      "relativeToPar": -8
    },
    ...
  ]
}
```

* **Error Responses**:
   * **Code**: `401 Unauthorized` - Missing or invalid token

### Get Round Statistics

Retrieves detailed statistics for a specific round.

* **URL**: `/stats/rounds/:roundId`
* **Method**: `GET`
* **Authentication**: Required
* **URL Parameters**: roundId - Round ID
* **Success Response**:
   * **Code**: `200 OK`
   * **Content**:

```json
{
  "roundInfo": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "date": "2023-06-15T14:00:00Z",
    "status": "COMPLETED",
    "course": {
      "id": "098f6bcd-4621-3373-8ade-4e832627b4f6",
      "name": "Pine Hills Disc Golf"
    }
  },
  "playerStats": [
    {
      "player": {
        "id": "abcdef12-3456-7890-abcd-ef1234567890",
        "name": "John Doe",
        "userId": "uvwxyz98-7654-3210-uvwx-yz9876543210"
      },
      "totalScore": 54,
      "relativeToPar": -4,
      "scoreTypes": {
        "birdiesOrBetter": 5,
        "pars": 10,
        "bogeys": 3,
        "doubleBogeyOrWorse": 0
      },
      "holeScores": [
        {
          "holeNumber": 1,
          "par": 3,
          "strokes": 3,
          "relativeToPar": 0,
          "scoreName": "Par"
        },
        ...
      ]
    },
    ...
  ]
}
```

* **Error Responses**:
   * **Code**: `401 Unauthorized` - Missing or invalid token
   * **Code**: `403 Forbidden` - Not authorized to view this round
   * **Code**: `404 Not Found` - Round not found

## HTTP Status Codes

The API uses the following HTTP status codes:

- 200 OK - The request was successful
- 201 Created - A new resource was successfully created
- 400 Bad Request - The request could not be understood or was missing required parameters
- 401 Unauthorized - Authentication failed or user lacks necessary permissions
- 403 Forbidden - User is authenticated but does not have access to the requested resource
- 404 Not Found - Resource not found
- 409 Conflict - Request could not be completed due to a conflict with the current state of the resource
- 500 Internal Server Error - An unexpected error occurred on the server