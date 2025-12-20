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