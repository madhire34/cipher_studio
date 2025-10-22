# CipherStudio Frontend

Next.js application for CipherStudio - Online React IDE

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production, update the API URL to your deployed backend URL.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Features

### 🎨 Landing Page
- Modern, responsive design
- Feature highlights
- Call-to-action buttons

### 🔐 Authentication
- User registration with validation
- Secure login with JWT tokens
- Protected routes

### 📊 Dashboard
- View all projects
- Create new projects
- Delete projects
- Project metadata display

### 💻 IDE Interface
- **File Explorer**: Tree view of project files and folders
- **Code Editor**: Powered by Sandpack with syntax highlighting
- **Live Preview**: Real-time React component rendering
- **Auto-save**: Save changes to the cloud

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + shadcn/ui components
- **Code Editor**: Sandpack by CodeSandbox
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Context API

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.js              # Landing page
│   │   ├── login/page.js        # Login page
│   │   ├── signup/page.js       # Signup page
│   │   ├── dashboard/page.js    # Projects dashboard
│   │   ├── ide/[projectId]/page.js  # IDE interface
│   │   ├── layout.js            # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.js       # Authentication context
│   └── lib/
│       ├── api.js               # API client
│       └── utils.js             # Utility functions
├── public/                      # Static assets
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Key Components

### AuthContext
Manages user authentication state across the application.

### API Client
Centralized Axios instance with interceptors for:
- Adding JWT tokens to requests
- Handling 401 errors
- Error response formatting

### Sandpack Integration
Provides live React code editing and preview:
- Syntax highlighting
- Hot module reloading
- Error display
- Console output

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Customization

### Themes
Modify `src/app/globals.css` to customize colors and themes.

### Sandpack Options
Edit Sandpack configuration in `src/app/ide/[projectId]/page.js`:
- Change editor theme
- Adjust layout proportions
- Enable/disable features

## Troubleshooting

### API Connection Issues
- Verify backend is running
- Check NEXT_PUBLIC_API_URL in .env.local
- Ensure CORS is configured correctly on backend

### Build Errors
- Clear .next folder: `rm -rf .next`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Authentication Issues
- Clear localStorage
- Check JWT token expiration
- Verify backend JWT_SECRET matches

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Tips

- Use production build for deployment
- Enable Next.js image optimization
- Implement code splitting for large projects
- Use React.memo for expensive components
