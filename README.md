Personal Finance Dashboard

A full stack web application designed to help users track expenses, manage budgets, and visualize financial data through an interactive dashboard.

Live Application http://personalfinancialdashboard.co.uk/

Overview

Managing personal finances is often difficult due to fragmented tools, lack of insights, and complex interfaces. This project provides a centralized platform that enables users to record transactions, set budgets, and analyze financial data in a simple and structured way.

Features

Authentication Secure user registration and login using JSON Web Tokens and password hashing.

Transaction Management Users can add, edit, and delete financial transactions and categorize them as income or expenses.

Dashboard Analytics Displays total income, expenses, and balance along with graphical representations of financial data.

Budget Management Users can set monthly budgets for categories and track spending with alerts at predefined thresholds.

CSV Import and Export Supports exporting transaction data and importing bulk records using CSV files.

Reports Provides date-based filtering and financial summaries for better analysis.

Technology Stack

Frontend React.js Tailwind CSS Recharts

Backend Node.js Express.js

Database MongoDB Atlas

Authentication JSON Web Tokens bcrypt

Deployment Frontend deployed on Vercel Backend deployed on Render

System Architecture

The application follows a client server architecture. The React frontend communicates with the backend API built using Express.js. The backend processes requests and interacts with the MongoDB database for data storage and retrieval.

Project Structure

personal-finance-dashboard/

frontend/ Contains React components, pages, and services

backend/ Contains models, routes, controllers, and middleware

.env Environment configuration

package.json Project dependencies and scripts

README.md Project documentation

Installation and Setup

Clone the repository

git clone https://github.com/your-username/personal-finance-dashboard.git

cd personal-finance-dashboard

Backend setup

cd backend npm install

Create a .env file with the following variables

PORT=5000 MONGO_URI=your_mongodb_connection JWT_SECRET=your_secret_key

Run the backend server

npm run dev

Frontend setup

cd frontend npm install npm start

API Endpoints

Authentication POST /api/auth/register POST /api/auth/login

Transactions GET /api/transactions POST /api/transactions PUT /api/transactions/:id DELETE /api/transactions/:id

Budgets GET /api/budgets POST /api/budgets

Security

The application implements secure authentication using JSON Web Tokens and stores passwords using hashing techniques. Protected routes ensure that only authenticated users can access sensitive data. Environment variables are used to protect configuration details.

Testing

The application was tested using API testing tools and manual user testing. Functional testing was conducted for all major features including authentication, transaction management, budgeting, and reporting.

Challenges

Key challenges included database connectivity, authentication handling, and ensuring smooth frontend and backend integration. These were resolved through proper configuration, middleware implementation, and iterative testing.

Future Enhancements

Future improvements may include integration with banking APIs, implementation of predictive analytics, support for multiple users, and development of a mobile application.
