# TurfNation

A web-based turf booking and management platform built using the MERN stack.

## Team Members - Group 7, Section 8

- Azharul Habib (22241009)
- Jaky Ahmed Chowdhury (22201616) - Sprint Leader
- Mohammad Shadmaan Saquib (22299323)
- Faria Mahamud Prity (22299486)

## Project Overview

TurfNation is a management system designed to help sports venues, mini-stadiums, and turfs organize their operations. The platform allows users to check availability, book time slots, view weather conditions, participate in tournaments, and track their activity statistics. Turf owners can manage bookings, schedules, and communicate with users through announcements.

## Features

### User Features
- User registration and authentication
- Browse and search available turfs by location and sport type
- Real-time slot availability checking
- Online booking with instant confirmation
- QR code generation for booking verification
- Weather forecast integration for scheduled bookings
- Tournament creation and participation
- Personal statistics tracking and rewards system

### Turf Owner Features
- Booking management dashboard
- Schedule overview with calendar view
- Announcement system for user notifications
- Turf condition status updates
- Revenue and booking analytics

## Technology Stack

**Backend**
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing

**Frontend**
- React.js
- Axios for API requests
- React Router for navigation

**Additional Libraries**
- QRCode for receipt generation
- Morgan for HTTP request logging
- CORS for cross-origin resource sharing

## Project Structure

```
CSE470-Turfnation-Project/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── rewardsController.js
│   │   ├── tournamentController.js
│   │   ├── turfController.js
│   │   └── weatherController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Rewards.js
│   │   ├── Tournament.js
│   │   ├── Turf.js
│   │   ├── User.js
│   │   └── Weather.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── rewardsRoutes.js
│   │   ├── tournamentRoutes.js
│   │   ├── turfRoutes.js
│   │   └── weatherRoutes.js
│   ├── utils/
│   │   ├── helpers.js
│   │   └── weatherService.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
└── README.md
```
## Installation and Setup

### Prerequisites
- Node.js version 14 or higher
- MongoDB Atlas account
- npm package manager

### Backend Setup

1. Clone the repository
```bash
it clone https://github.com/Jaky-Chow02/CSE470-TurfNation-Project
cd CSE470-TurfNation-Project/backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
WEATHER_API_KEY=mock_weather
USE_MOCK_WEATHER=true
```

4. Start the server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## API Documentation

### Authentication Endpoints

**POST** `/api/auth/register`
- Register a new user account
- Body: `{ name, email, password, phone, role }`

**POST** `/api/auth/login`
- Authenticate user and receive JWT token
- Body: `{ email, password }`

**GET** `/api/auth/me`
- Retrieve current user information
- Requires authentication

**PUT** `/api/auth/profile`
- Update user profile information
- Requires authentication

**PUT** `/api/auth/change-password`
- Change user password
- Requires authentication

### Turf Endpoints

**GET** `/api/turfs`
- Retrieve all active turfs
- Query parameters: `city`, `sport`, `search`, `page`, `limit`

**GET** `/api/turfs/:id`
- Get details of a specific turf

**POST** `/api/turfs`
- Create a new turf listing
- Requires turf owner authentication

**PUT** `/api/turfs/:id`
- Update turf information
- Requires turf owner authentication

**DELETE** `/api/turfs/:id`
- Deactivate a turf listing
- Requires turf owner authentication

**GET** `/api/turfs/:id/availability`
- Check available time slots for a specific date
- Query parameters: `date`

**POST** `/api/turfs/:id/announcement`
- Post an announcement for turf users
- Requires turf owner authentication

### Booking Endpoints

**POST** `/api/bookings`
- Create a new booking
- Body: `{ turf, date, startTime, endTime, sport, notes }`
- Requires authentication

**GET** `/api/bookings/my-bookings`
- Retrieve all bookings for the authenticated user
- Query parameters: `status`, `page`, `limit`

**GET** `/api/bookings/:id`
- Get specific booking details
- Requires authentication

**PUT** `/api/bookings/:id/cancel`
- Cancel an existing booking
- Body: `{ reason }`
- Requires authentication

**PUT** `/api/bookings/:id/reschedule`
- Reschedule a booking to a different time
- Body: `{ date, startTime, endTime }`
- Requires authentication

**GET** `/api/bookings/turf/:turfId`
- Get all bookings for a specific turf
- Requires turf owner authentication

### Tournament Endpoints

**GET** `/api/tournaments`
- List all tournaments
- Query parameters: `sport`, `status`, `page`, `limit`

**GET** `/api/tournaments/:id`
- Get tournament details including participants

**POST** `/api/tournaments`
- Create a new tournament
- Requires authentication

**POST** `/api/tournaments/:id/join`
- Join a tournament with a team
- Body: `{ teamName, players }`
- Requires authentication

**PUT** `/api/tournaments/:id`
- Update tournament information
- Requires creator authentication

### Weather Endpoints

**GET** `/api/weather/current`
- Get current weather conditions
- Query parameters: `city`

**GET** `/api/weather/forecast`
- Get 5-day weather forecast
- Query parameters: `city`

### Rewards Endpoints

**GET** `/api/rewards/me`
- Get user's rewards and statistics
- Requires authentication

**GET** `/api/rewards/leaderboard`
- View global leaderboard rankings
- Query parameters: `limit`

**POST** `/api/rewards/badges`
- Award a badge to user
- Requires authentication

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Obtain the token by logging in through `/api/auth/login`.

## Database Schema

### User Model
Stores user credentials, profile information, role designation, and activity statistics.

### Turf Model
Contains turf details including location, available sports, pricing, operating hours, and current condition status.

### Booking Model
Records booking information with user and turf references, time slots, payment details, QR codes, and weather data.

### Tournament Model
Manages tournament data including participants, match schedules, rules, and status tracking.

### Weather Model
Caches weather information for locations with temperature, conditions, and suitability assessments.

### Rewards Model
Tracks user points, achievement levels, earned badges, milestones, and leaderboard rankings.

## Development Workflow

The project follows an agile development approach with four main sprints:

1. Backend infrastructure and database models
2. Authentication and turf management APIs
3. Booking system with QR code generation
4. Tournament and rewards modules with weather integration

## Testing

API endpoints can be tested using:
- Postman for comprehensive API testing
- Thunder Client VS Code extension
- cURL commands for quick tests

Example test request:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Known Limitations

- Payment processing currently uses mock transactions
- Email notification system is not yet implemented
- Frontend user interface is under development

## Future Scope

- Integration with real payment gateways
- Email and SMS notification services
- Advanced analytics dashboard for administrators
- Mobile application development
- Social networking features for players
- Live match scoring capabilities
- Equipment rental management

## Contributors
- 22241009 - AZHARUL HABIB 
- 22201616 - JAKY AHMED CHOWDHURY 
- 22299323 - MOHAMMAD SHADMAAN SAQUIB 
- 22299486 - FARIA MAHAMUD PRITY 

This project was developed as part of the coursework for BRAC University, Computer Science Department.

## License

MIT License

Copyright (c) 2024 TurfNation Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and to sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.