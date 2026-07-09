# TaskFlow 🚀

A production-quality, Trello-inspired project management application built with React 19, TypeScript, Node.js, Express, and MongoDB.

![TaskFlow](https://img.shields.io/badge/TaskFlow-v1.0.0-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs)

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with token-based auth
- 📋 **Kanban Boards** — Create, edit, and delete boards with custom colors
- 📝 **Lists & Cards** — Full CRUD for lists and task cards
- 🖱️ **Drag & Drop** — Smooth card reordering across lists via dnd-kit
- 🎯 **Priorities** — Low / Medium / High / Urgent labels
- 📅 **Due Dates** — Calendar picker with overdue highlighting
- 🔍 **Search** — Filter cards by title in real-time
- 🌙 **Dark Mode** — System-aware dark/light mode toggle
- 🔔 **Toast Notifications** — Success/error feedback on all actions
- 📱 **Responsive** — Mobile-first design with collapsible sidebar

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 6 | Build tool |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3 | Styling |
| dnd-kit | latest | Drag & drop |
| React Router | 6 | Routing |
| Axios | latest | HTTP client |
| react-hot-toast | latest | Notifications |
| lucide-react | latest | Icons |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 | Runtime |
| Express | 4 | Web framework |
| MongoDB Atlas | — | Database |
| Mongoose | 8 | ODM |
| JSON Web Token | 9 | Authentication |
| bcryptjs | 2 | Password hashing |
| TypeScript | 5 | Type safety |

## 📁 Project Structure

```
TaskFlow/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── app.ts          # Express app
│   │   └── server.ts       # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # React contexts (Auth, Theme)
    │   ├── layouts/        # Page layouts
    │   ├── pages/          # Route pages
    │   ├── services/       # API service layer
    │   ├── types/          # TypeScript types
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works great)
- npm or yarn

### 1. Clone and install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy and fill in your values:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskflow
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** — the defaults work out of the box:
```bash
cd frontend
cp .env.example .env
```

### 3. Start the development servers

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → App running at http://localhost:5173
```

### 4. Open the app

Navigate to **http://localhost:5173** and create your first account!

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |

### Boards
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/boards` | Get all boards |
| POST | `/api/boards` | Create a board |
| PUT | `/api/boards/:id` | Update a board |
| DELETE | `/api/boards/:id` | Delete a board (cascade) |

### Lists
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/lists?boardId=:id` | Get all lists for a board |
| POST | `/api/lists` | Create a list |
| PUT | `/api/lists/:id` | Update/rename a list |
| DELETE | `/api/lists/:id` | Delete a list (cascade) |

### Cards
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cards?boardId=:id` | Get all cards for a board |
| POST | `/api/cards` | Create a card |
| PUT | `/api/cards/reorder` | Batch reorder cards (drag & drop) |
| PUT | `/api/cards/:id` | Update a card |
| DELETE | `/api/cards/:id` | Delete a card |

## 🗄️ Database Models

### User
```typescript
{ name: string, email: string, password: string (hashed), avatar?: string }
```

### Board
```typescript
{ title: string, description?: string, color: string, owner: ObjectId }
```

### List
```typescript
{ title: string, boardId: ObjectId, order: number }
```

### Card
```typescript
{ title: string, description?: string, priority: 'low'|'medium'|'high'|'urgent', dueDate?: Date, listId: ObjectId, boardId: ObjectId, order: number }
```

## 🔒 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with configurable expiry
- All board/list/card endpoints verify ownership
- Cascade deletes prevent orphaned records
- CORS restricted to frontend origin

## 📝 License

MIT — feel free to use this project as a template or learning resource.

---

Built with ❤️ using React 19, TypeScript, Express, and MongoDB
