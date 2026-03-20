# Budget Tracker

A secure, full-stack personal finance application built to track daily expenses and incomes. This project demonstrates a complete Client-Server architecture with robust security, user authentication, and real-time data visualization.

## Key Features

* **Secure User Authentication:** Full registration and login system using **JWT (JSON Web Tokens)** and **bcryptjs** for password hashing. Each user has their own isolated financial workspace.
* **Real-Time Visualization:** Interactive doughnut charts powered by **Chart.js** that dynamically update as transactions are added or removed.
* **Production-Ready Security:** API endpoints are protected against XSS attacks and HTTP header vulnerabilities using **Helmet**. Brute-force and DDoS protections are implemented via **express-rate-limit**.
* **CSV Export:** Users can download their complete transaction history as a `.csv` file directly from the browser using pure Vanilla JS.
* **Single Page Application (SPA):** Seamless UI transitions between authentication and the main dashboard without page reloads.
* **Responsive Design:** Clean, modern, and mobile-friendly interface built with CSS Grid and Flexbox.

## Tech Stack

**Frontend:**
* HTML5 / CSS3 (CSS Variables, Grid, Flexbox)
* Vanilla JavaScript (ES6+, Fetch API, Blob API)
* Chart.js (Data visualization)

**Backend:**
* Node.js & Express.js
* SQLite3 (Relational Database)
* JWT & Bcryptjs (Auth & Crypto)
* Helmet & Express-Rate-Limit (Security)
* Dotenv (Environment variable management)

## API Endpoints Overview

* `POST /auth/register` - Create a new user account
* `POST /auth/login` - Authenticate user and return JWT
* `GET /expenses` - Get all transactions for the logged-in user (Requires JWT)
* `POST /expenses` - Add a new transaction (Requires JWT)
* `PUT /expenses/:id` - Update a specific transaction (Requires JWT)
* `DELETE /expenses/:id` - Delete a specific transaction (Requires JWT)

## What I Learned
Building this project solidified my understanding of RESTful API design, relational database management with SQLite, and modern web security practices. Implementing JWT authentication from scratch taught me how to securely manage user sessions in a stateless environment.

## Getting Started (Local Development)

Follow these steps to run the project locally on your machine.

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/kacpibara/Budget-Planner-API.git
cd Budget-Planner-API
\`\`\`

### 2. Install Backend Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed, then run:
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables setup
Create a `.env` file in the root directory and add your secret keys:
\`\`\`env
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here
\`\`\`

### 4. Start the Server
\`\`\`bash
node app.js
# or 'node server.js' depending on your entry file name
\`\`\`
*The server will start on `http://localhost:3000` and automatically create the SQLite database (`budget.db`).*

### 5. Open the Frontend
Since the frontend uses Vanilla JS and standard HTML, you can simply open the `index.html` file in your favorite browser, or use an extension like **Live Server** in VS Code.

---
