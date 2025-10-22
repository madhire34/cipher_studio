# CipherStudio Backend

Express.js REST API for CipherStudio - Online React IDE

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cipherstudio?retryWrites=true&w=majority

# JWT Secret (Generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# AWS S3 Configuration (Optional - files stored in MongoDB by default)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cipherstudio-files

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. MongoDB Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env`

### 4. Run the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- **POST** `/api/users` - Register new user
- **POST** `/api/users/login` - Login user
- **GET** `/api/users/me` - Get current user (Protected)

### Projects

- **POST** `/api/projects` - Create new project (Protected)
- **GET** `/api/projects/user` - Get all user projects (Protected)
- **GET** `/api/projects/:id` - Get project by ID (Protected)
- **PUT** `/api/projects/:id` - Update project (Protected)
- **DELETE** `/api/projects/:id` - Delete project (Protected)

### Files

- **POST** `/api/files` - Create file/folder (Protected)
- **GET** `/api/files/project/:projectId` - Get all files in project (Protected)
- **GET** `/api/files/:id` - Get file by ID (Protected)
- **PUT** `/api/files/:id` - Update file content (Protected)
- **DELETE** `/api/files/:id` - Delete file/folder (Protected)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── s3.js            # AWS S3 configuration
│   ├── models/
│   │   ├── User.js          # User schema
│   │   ├── Project.js       # Project schema
│   │   └── File.js          # File schema
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   └── fileController.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   └── fileRoutes.js
│   └── middleware/
│       ├── auth.js          # JWT authentication
│       └── validation.js    # Request validation
├── server.js                # Entry point
├── package.json
└── .env.example
```

## Testing the API

Use tools like Postman, Insomnia, or curl to test endpoints.

Example registration:
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## Deployment

### Render.com

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set environment variables
5. Deploy

### Railway.app

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables: `railway variables`
5. Deploy: `railway up`

## Security Notes

- Always use strong JWT_SECRET in production
- Enable CORS only for trusted domains
- Use HTTPS in production
- Implement rate limiting for production
- Regularly update dependencies
