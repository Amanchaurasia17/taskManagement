# Task Management System

A full-stack, responsive Task Management System built with **Next.js 15 (App Router)** and **Node.js, Express, & Prisma**.

## Overview

This project provides a robust solution for tracking and managing personal tasks securely. Each user can register, log in to an individual dashboard, and perform complete CRUD operations on their tasks.

### Highlights
- **Full-Stack Application**: Node.js backend handles secure data & auth via JSON Web Tokens (Access/Refresh strategy).
- **Relational Database**: Uses Prisma ORM with SQLite for streamlined and portable development.
- **Dynamic Frontend**: A custom-designed Next.js Web App boasting a premium dark-mode aesthetic utilizing purely Vanilla CSS (CSS Modules) without external utility classes.
- **Modern Security Check**: All endpoints enforce standard HTTP security practices and bcrypt password hashing.

---

## Features

### 1. User Security (Authentication)
- Fully implemented Login, Registration, and automated Logout behavior.
- **JWT Protection**:
  - `Access Token`: Short-lived (15 minutes) token for accessing protected backend routes.
  - `Refresh Token`: Long-lived (7 days) token securely persisted and exchanged seamlessly by the frontend utility wrapper `fetchWithAuth()`.
- Passwords dynamically hashed using **bcrypt**.

### 2. Task Management (CRUD API)
- Tasks are strictly bound natively to the Logged-in User via relational Foreign Keys.
- Supports complete CRUD operations with optimized routing:
  - Create tasks with optional descriptions.
  - Toggle between `PENDING` and `COMPLETED`.
  - Filter by statuses.
  - View paginated metrics automatically.
  - Search specifically by titles.

### 3. Responsive Next.js Frontend
- **Design Excellence**: Utilizing beautifully styled CSS modules focused on typography (`Inter`), glassmorphism, fluid interactive hovers, and strict layout alignment.
- Action status triggers immediate, non-intrusive Toast Notifications on the bottom-right of the window.

---

## Tech Stack

| **Frontend** 🌐 | **Backend** ⚙️ | **Database** 💾 |
|-------------|------------|-------------|
| Next.js App Router | Node.js | SQLite |
| TypeScript | Express | Prisma ORM |
| Vanilla CSS Modules | TypeScript | |
| Fetch API Wrapper | JWT & bcrypt | |

---

## Quick Start (Running Locally)

### 1. Project Setup
Ensure you have `Node.js` installed. Clone the repository and install the dependencies for both layers.

### 2. Backend Initialization
```bash
cd backend
npm install
# Migrate the Prisma Database Schema
npx prisma migrate dev --name init
# Run the development server
npm run dev

# The API runs securely at http://localhost:3001
```


### 3. Frontend Initialization
```bash
cd frontend
npm install
npm run dev
# The Web App runs locally at http://localhost:3000
```

*Note: Once both instances are mounted, access your browser at `http://localhost:3000` to register your first user and check out the Task Management dashboard.*

---

## API Endpoints Reference

### **Authentication (`/auth`)**
- `POST /auth/register` - Create a new user (Email & password).
- `POST /auth/login` - Authenticate an existing user (Returns `accessToken` and `refreshToken`).
- `POST /auth/refresh` - Request a new active JWT.
- `POST /auth/logout` - Sign out endpoint.

### **Tasks (`/tasks`)** *(Requires Bearer Access Token)*
- `GET /tasks` - Retrieve a batched list of all current tasks. (Query Flags `?page=1&limit=5&status=PENDING&search=Title`)
- `POST /tasks` - Add a new task item.
- `GET /tasks/:id` - Read deeply nested task info.
- `PATCH /tasks/:id` - Modify task content (title/description).
- `DELETE /tasks/:id` - Securely drop a task constraint.
- `PATCH /tasks/:id/toggle` - Immediate boolean toggling of status state.

--- 

