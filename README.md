Student Activity Portal

A full-stack web application designed to manage student activities, events, and participation. The platform supports Admin, Faculty, and Student roles, providing a seamless interface for event management, user tracking, and engagement analytics.

Features
  Platform Roles
  
  Admin

    Manage users (students and faculty).

    Create, edit, and delete events.

    Assign faculty to events.

    Configure platform-wide settings.

  Faculty

    View assigned events.

    Conduct events and track participation.

    Manage student attendance for their events.

  Student

    Browse and register for events.

    Track participation and engagement.

    Access personalized dashboard for event history.

  UI Highlights

    Responsive design using Tailwind CSS.

    Role-specific cards with gradient backgrounds and icons.

    Hover animations for interactive UI elements.

    Integration with React Icons for visual clarity.

  Tech Stack

    Frontend: React, Tailwind CSS, React Icons

    Backend: Java (Spring Boot)

    Database: MySQL

    Version Control: Git, GitHub

Installation

Clone the repository:

    git clone https://github.com/DevaseeshKumar/Student-Activity-Portal.git


Navigate to the project directory:

    cd Student-Activity-Portal


Backend Setup

    Configure MySQL database and import SQL schema.

    Update database credentials in Spring Boot configuration.

Frontend Setup

    Navigate to the frontend folder (if separate) and install dependencies:

    cd frontend

    npm install

    npm run dev

Backend Server

Run the Spring Boot application:

    cd backend

    ./mvnw spring-boot:run

   Project Structure
    Student-Activity-Portal/
    |
    ├─ backend/          # Spring Boot backend
    |
    ├─ frontend/         # React frontend
    |
    └─ README.md         # Project documentation

   License

    This project is licensed under the MIT License – see LICENSE
    for details.
