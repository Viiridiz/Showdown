# Showdown: Real-Time Pokémon Team Builder

Showdown is a full-stack web application that allows Pokémon trainers to draft, share, and rate competitive Pokémon teams. It features real-time updates using WebSockets so users can instantly see when new teams are drafted, track live upvotes, and see how many trainers are currently online.

## Tech Stack
* **Frontend:** React, TypeScript, React Router, Vite, Socket.io-client
* **Backend:** Node.js, Express.js, Socket.io
* **Database:** MongoDB & Mongoose
* **Authentication:** JSON Web Tokens (JWT) & bcrypt
* **Deployment:** Render (Backend API & Static Frontend)
* **CI/CD:** GitHub Actions (Automated build, test, and Render deployment hooks)

## Key Features
* **Authentication:** Secure user registration and login.
* **Full CRUD functionality:** Draft teams and add, edit, or release up to 6 Pokémon per team with individual stats, EVs, and items via the PokéAPI.
* **Real-Time Data (WebSockets):** Live online user count, instant upvote toggling across all clients, and global pop-up alerts when new teams are drafted.
* **Validation & Constraints:** Strict enforcement of the 510 EV stat limit and 6-Pokémon roster cap.
* **Read-Only Previews:** Browse and inspect the exact EV spreads and movesets of teams built by other trainers.

## Setup Instructions

### Prerequisites
* **Node.js:** version `20.0.0` or higher (Required for Vite).
* **MongoDB:** A free MongoDB Atlas cluster or local instance.

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/Viiridiz/Showdown
cd showdown
\`\`\`

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and start the server.
\`\`\`bash
cd backend
npm install
\`\`\`
* Create a `.env` file in the `backend` folder (reference the `.env.example` file for required variables).
\`\`\`bash
npm run dev # or npm start
\`\`\`

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite development server.
\`\`\`bash
cd frontend
npm install
\`\`\`
* Create a `.env` file in the `frontend` folder (reference `.env.example`).
\`\`\`bash
npm run dev
\`\`\`

## Deployment & CI/CD Architecture
This application is fully deployed on [Render](https://showdown-fe.onrender.com), Backend (https://showdown-8lgy.onrender.com)
* The Express backend is hosted as a Web Service.
* The React frontend is built and hosted as a Static Site.

**(CI/CD):**
This repository utilizes a GitHub Actions pipeline (`.github/workflows/deploy.yml`). Upon every push to the `master` branch, a Node.js runner:
1. Installs backend and frontend dependencies.
2. Runs a production build of the Vite frontend (`npm run build`) to check for compilation errors.
3. If all checks pass, securely triggers Render Deploy Hooks to update the live production environments automatically.