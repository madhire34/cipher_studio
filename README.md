# CipherStudio - Online React IDE

A full-stack online IDE for building React applications directly in your browser. Write, preview, and save React code with a professional development environment.

## 🚀 Features

- **Live Code Editor**: Write React code with syntax highlighting and instant preview
- **File Management**: Create, edit, and organize files in a hierarchical folder structure
- **Real-time Preview**: See your changes instantly with hot module reloading
- **Project Management**: Create, save, and manage multiple React projects
- **Authentication**: Secure user authentication with JWT tokens
- **Cloud Storage**: Projects saved to MongoDB Atlas with optional AWS S3
- **Modern UI**: Beautiful interface with dark theme and smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Code Editor**: Sandpack by CodeSandbox
- **Styling**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt, helmet, cors
- **Validation**: express-validator

### Database Schema
- **Users**: Authentication and user profiles
- **Projects**: Project metadata and ownership
- **Files**: Hierarchical file structure with tree support

## 📁 Project Structure

```
cipher_studio/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── config/            # Database & S3 configuration
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth & validation
│   │   ├── models/           # MongoDB schemas
│   │   └── routes/           # API endpoints
│   └── server.js             # Entry point
│
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # UI components
│   │   ├── contexts/         # React contexts
│   │   └── lib/              # Utilities & API client
│   └── public/               # Static assets
│
└── package.json              # Root scripts
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free)
- AWS S3 bucket (optional)

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
Create `backend/.env` with:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
```

4. **Start the server**:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
Create `frontend/.env.local` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Start the development server**:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🎨 UI Features

### Three-Panel IDE Layout
- **File Explorer (Left)**: Tree view of project files and folders
- **Code Editor (Center)**: Sandpack editor with syntax highlighting
- **Live Preview (Right)**: Real-time React component rendering

### Modern Design
- Dark theme with gradient backgrounds
- Glass morphism effects
- Smooth animations and transitions
- Responsive layout for all devices
- Professional color scheme

## 🔌 API Endpoints

### Authentication
- `POST /api/users` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects/user` - Get user's projects
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Files
- `POST /api/files` - Create file/folder
- `GET /api/files/project/:projectId` - Get project files
- `GET /api/files/:id` - Get file by ID
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Projects Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  description: String,
  template: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Files Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  parentId: ObjectId | null,
  name: String,
  type: "file" | "folder",
  content: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (Render/Railway/Cyclic)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

## 🎯 Usage

1. **Visit** http://localhost:3000
2. **Sign up** or log in
3. **Create a project** from the dashboard
4. **Edit code** in the Sandpack editor
5. **See live preview** update in real-time
6. **Save changes** to persist your work

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- User authorization checks
- Secure API endpoints

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

**Built with ❤️ using Next.js and Sandpack**
