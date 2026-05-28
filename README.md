# 🧵 The Atelier

**A full-stack tailoring platform that brings the tailoring experience online — connecting customers, tailors, and admins through one unified system.**

---

## The Problem

Tailoring is still deeply offline and fragmented. Customers struggle to communicate measurements and preferences. Tailors manage orders manually. There's rarely a single system tying the whole process together — so that's what this tries to be.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Auth | JWT + Role-Based Access Control |
| Architecture | MVC (Model-View-Controller) |
| Deployment | Vercel |

---

## Features

### 🔐 Authentication & Roles
- JWT-based authentication with role-based access control
- Three distinct user roles: **Customer**, **Tailor**, and **Admin**
- Dynamic signup flow that adapts based on selected role

### 👔 Customer Flow
- Browse and connect with verified tailors
- Submit measurements, preferences, and order details
- Track order status through a dedicated dashboard
- Leave reviews and ratings for tailors

### ✂️ Tailor Flow
- Dedicated tailor dashboard to manage incoming orders
- Aadhaar OCR integration for identity verification during onboarding
- Profile management and service listings

### 🛠️ Admin Flow
- Unified admin panel with elevated permissions
- Manage platform users, verify tailors, and oversee orders

### 🎨 UI/UX
- Fully responsive across devices
- Smooth transitions and micro-interactions via Framer Motion
- Clean, consistent design language throughout all dashboards

---

## Project Structure

```
the-atelier/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Auth and global state
│   │   └── utils/            # Helper functions
│   └── public/
│
├── server/                   # Express backend (MVC)
│   ├── controllers/          # Request handlers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── middleware/            # Auth, error handling, etc.
│   └── utils/                # Server-side utilities
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/the-atelier.git
cd the-atelier

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `/server` directory:

```env
PORT=2000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Create a `.env` file in the `/client` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Running Locally

```bash
# Start the backend (from /server)
npm run dev

# Start the frontend (from /client)
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/tailors` | List all verified tailors |
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/reviews` | Submit a review |
| GET | `/api/admin/users` | Admin: list all users |

> Full API documentation coming soon.

---

## Deployment

The platform is deployed on **Vercel**. To deploy your own instance:

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Configure environment variables in the Vercel dashboard.
4. Deploy.

---

## What I Learned

This was the most technically and conceptually demanding project I've built so far. A few things that stood out:

**Separation of concerns matters.** Using MVC architecture on the backend paid off repeatedly as the codebase grew. Having clear boundaries between models, controllers, and routes made debugging and extending features far less painful.

**"Simple" features aren't simple.** A signup page alone involves validation logic, state handling, error feedback, responsiveness, animations, accessibility, and backend communication — and making all of it feel seamless takes real care.

**Role-based systems require upfront thinking.** Designing for three different user types early forced architectural decisions that would've been painful to retrofit later.

---

## Roadmap

- [ ] Real-time order status updates via WebSockets
- [ ] In-app messaging between customers and tailors
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Enhanced admin analytics dashboard
- [ ] Email/SMS notifications

---

## Author

Built with a lot of trial, error, and coffee. Feedback and contributions are welcome.
