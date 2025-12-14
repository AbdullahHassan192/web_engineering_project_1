# Tutoring Marketplace & AI Copilot System

## 📋 Project Overview

A comprehensive full-stack MERN (MongoDB, Express.js, React, Node.js) application designed as a tutoring marketplace platform specifically tailored for Data Science students (SEECS). The system features role-based access control, an intelligent booking system with collision detection, and an integrated AI Copilot assistant that uses keyword-based decision tree logic to help users find tutors, compare prices, and learn algorithms.

### Core Purpose
This platform connects students seeking tutoring services with qualified tutors specializing in Data Science, Machine Learning, CNN Architecture, Unreal Engine 5, and related technical subjects. The AI Copilot provides intelligent assistance through natural language queries, making it easy for users to discover tutors and understand complex algorithms.

---

## 🎯 Key Features

### 1. **Role-Based Access Control (RBAC)**
- **Student Role**: Can browse tutors, create bookings, view their session history
- **Tutor Role**: Can manage their profile, view bookings, set availability and hourly rates
- **Admin Role**: Full system access (extensible for future admin features)
- Secure JWT-based authentication with bcrypt password hashing

### 2. **Intelligent Booking System**
- **Collision Detection Algorithm**: Prevents double-booking by checking time overlaps
  - Uses MongoDB query: `ExistingStart < RequestEnd AND ExistingEnd > RequestStart`
  - Validates time ranges (end time must be after start time)
  - Prevents booking in the past
  - Generates unique meeting IDs (format: `TutorApp_[RandomString]`)

### 3. **AI Copilot Assistant**
- **Keyword Decision Tree Logic**: ID3-inspired algorithm for intent detection
- **Supported Queries**:
  - **Price Queries**: "Show me tutors by price" → Returns tutors sorted by hourly rate
  - **Subject Queries**: "Find Unreal Engine tutors" → Filters tutors by subject expertise
  - **Algorithm Queries**: "Explain ID3" → Provides detailed algorithm explanations
  - **General Help**: Context-aware assistance for platform navigation
- Maintains conversation history (last 2 turns) for context-aware responses

### 4. **Real-Time Updates**
- Socket.io integration for live booking notifications
- Real-time status updates for booking confirmations/cancellations

### 5. **Modern UI/UX**
- **Deep Navy/Charcoal Theme**: Professional Data Science aesthetic
  - Primary Background: `#0F0F14` (Deep Navy)
  - Secondary Background: `#1C1C22` (Charcoal Gray)
  - Action Colors: `#3B82F6` (Indigo Blue) with hover states
- Responsive design with Tailwind CSS
- Floating AI Copilot widget with gradient header

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14+**: React framework with Pages Router
- **React 18**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **Socket.io Client**: Real-time communication
- **Lucide React**: Modern icon library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Socket.io**: Real-time bidirectional communication
- **JWT (jsonwebtoken)**: Authentication tokens
- **Bcryptjs**: Password hashing

---

## 📁 Project Structure

```
web_engineering_project_1/
├── client/                          # Next.js Frontend Application
│   ├── components/
│   │   └── copilot/
│   │       └── ChatWidget.js       # AI Copilot floating chat widget
│   ├── pages/
│   │   ├── _app.js                 # Next.js app wrapper with global styles
│   │   ├── index.js                # Landing/home page
│   │   ├── auth/
│   │   │   ├── register.js         # User registration page
│   │   │   └── student/
│   │   │       └── login.js        # Student login page
│   │   ├── student/
│   │   │   └── dashboard.js        # Student dashboard with bookings
│   │   └── tutor/
│   │       └── dashboard.js        # Tutor dashboard with bookings
│   ├── styles/
│   │   └── globals.css              # Global CSS with Tailwind imports
│   ├── tailwind.config.js          # Tailwind configuration (Deep Navy theme)
│   ├── next.config.js               # Next.js configuration
│   ├── postcss.config.js           # PostCSS configuration for Tailwind
│   └── package.json                 # Frontend dependencies
│
├── server/                          # Express.js Backend Application
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic (login/register)
│   │   ├── bookingController.js     # Booking CRUD with collision detection
│   │   └── copilotController.js     # AI Copilot keyword decision tree logic
│   ├── models/
│   │   ├── User.js                  # User schema (student/tutor/admin)
│   │   └── Booking.js               # Booking schema with indexes
│   ├── routes/
│   │   ├── authRoutes.js            # Authentication endpoints
│   │   ├── bookingRoutes.js         # Booking endpoints (protected)
│   │   └── copilotRoutes.js         # AI Copilot endpoints
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   ├── index.js                     # Server entry point (Express + MongoDB + Socket.io)
│   └── package.json                 # Backend dependencies
│
├── .env                             # Environment variables (MongoDB URI, JWT Secret, etc.)
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

---

## 🚀 Complete Setup & Installation Guide

### Prerequisites Checklist

Before starting, ensure you have the following installed:

1. **Node.js** (version 18 or higher)
   - Check installation: `node --version`
   - Download from: https://nodejs.org/

2. **MongoDB** (local installation or MongoDB Atlas account)
   - **Local MongoDB**: Install from https://www.mongodb.com/try/download/community
   - **MongoDB Atlas**: Free cloud database at https://www.mongodb.com/cloud/atlas
   - Check installation: `mongod --version` (for local)

3. **npm** (comes with Node.js)
   - Check installation: `npm --version`

4. **Git** (optional, for version control)
   - Check installation: `git --version`

### Step-by-Step Installation

#### Step 1: Navigate to Project Directory

```bash
cd web_engineering_project_1
```

#### Step 2: Install Backend Dependencies

```bash
# Navigate to server directory
cd server

# Install all backend dependencies
npm install

# This will install:
# - express (web framework)
# - mongoose (MongoDB ODM)
# - dotenv (environment variables)
# - cors (cross-origin resource sharing)
# - socket.io (real-time communication)
# - jsonwebtoken (JWT authentication)
# - bcryptjs (password hashing)
# - nodemon (development auto-reload, dev dependency)
```

**Expected Output**: You should see a `node_modules` folder created in the `server/` directory.

**Troubleshooting**:
- If you see `npm ERR!`, check your Node.js version: `node --version` (should be 18+)
- If installation is slow, try: `npm install --legacy-peer-deps`
- Clear npm cache if needed: `npm cache clean --force`

#### Step 3: Install Frontend Dependencies

```bash
# Navigate back to root, then to client directory
cd ../client

# Install all frontend dependencies
npm install

# This will install:
# - next (Next.js framework)
# - react & react-dom (React library)
# - tailwindcss (CSS framework)
# - axios (HTTP client)
# - socket.io-client (real-time client)
# - lucide-react (icons)
# - autoprefixer & postcss (Tailwind dependencies)
```

**Expected Output**: You should see a `node_modules` folder created in the `client/` directory.

**Troubleshooting**:
- Same troubleshooting steps as backend
- If Tailwind errors occur, ensure `postcss.config.js` exists

#### Step 4: Configure Environment Variables

**Create `.env` file in the root directory** (`web_engineering_project_1/.env`):

```bash
# Navigate back to root directory
cd ..

# Create .env file (Windows PowerShell)
New-Item -ItemType File -Path .env -Force

# Or create manually using a text editor
```

**Add the following content to `.env`**:

```env
# MongoDB Connection String
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/tutoring-marketplace

# For MongoDB Atlas (replace with your connection string):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tutoring-marketplace?retryWrites=true&w=majority

# JWT Secret Key (change this to a random secure string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Server Port
PORT=5000

# Frontend URL (for CORS and Socket.io)
CLIENT_URL=http://localhost:3000

# Environment Mode
NODE_ENV=development
```

**Important Notes**:
- **MONGO_URI**: 
  - Local: `mongodb://localhost:27017/tutoring-marketplace` (requires MongoDB running locally)
  - Atlas: Get connection string from MongoDB Atlas dashboard
- **JWT_SECRET**: Use a long, random string (minimum 32 characters) in production
- **PORT**: Backend server will run on this port (default: 5000)
- **CLIENT_URL**: Must match your frontend URL for CORS to work

**Troubleshooting**:
- If `.env` file is not being read, ensure it's in the root directory (same level as `server/` and `client/`)
- Check file encoding is UTF-8 (no BOM)
- Ensure no extra spaces around `=` sign

#### Step 5: Start MongoDB (Local Installation Only)

**If using local MongoDB**:

```bash
# Windows (run in separate terminal)
mongod

# macOS/Linux
sudo mongod

# Or if MongoDB is installed as a service:
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Expected Output**: MongoDB should start and show connection logs.

**If using MongoDB Atlas**:
- Skip this step
- Ensure your `.env` has the Atlas connection string
- Whitelist your IP address in Atlas dashboard

**Troubleshooting**:
- `mongod: command not found`: MongoDB not in PATH, add to system PATH or use full path
- `Port 27017 already in use`: MongoDB already running or another service using the port
- Connection refused: Check MongoDB service status

---

## 🏃 Running the Application

### Development Mode (Recommended)

The application requires **two separate terminal windows** - one for the backend server and one for the frontend client.

#### Terminal 1: Start Backend Server

```bash
# Navigate to server directory
cd server

# Start the server
npm start

# OR for development with auto-reload (if nodemon is installed):
npm run dev
```

**Expected Output**:
```
✓ MongoDB connected successfully
✓ Student profile created: Muhammad Arshyan
✓ Tutor profile created: Expert Tutor
Database seeding completed!
✓ Server running on port 5000
✓ Environment: development
```

**What's Happening**:
1. Server loads environment variables from `.env`
2. Connects to MongoDB (local or Atlas)
3. Seeds database with default users (if database is empty)
4. Starts Express server on port 5000
5. Initializes Socket.io for real-time communication

**Troubleshooting**:
- **"MongoDB connection error"**: 
  - Check if MongoDB is running: `mongod` or check Atlas connection string
  - Verify `MONGO_URI` in `.env` is correct
  - Check firewall/network settings
- **"Port 5000 already in use"**: 
  - Change `PORT` in `.env` to another port (e.g., 5001)
  - Or stop the process using port 5000
- **"Cannot find module"**: 
  - Run `npm install` in `server/` directory
  - Check `package.json` exists
- **"JWT_SECRET is not defined"**: 
  - Check `.env` file exists and contains `JWT_SECRET`
  - Restart server after creating `.env`

#### Terminal 2: Start Frontend Client

```bash
# Navigate to client directory (in a NEW terminal window)
cd client

# Start Next.js development server
npm run dev
```

**Expected Output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- info Loaded env from .env.local
- event compiled client and server successfully
```

**What's Happening**:
1. Next.js compiles React components
2. Tailwind CSS processes styles
3. Development server starts on port 3000
4. Hot-reload enabled for instant updates

**Troubleshooting**:
- **"Port 3000 already in use"**: 
  - Kill the process: `npx kill-port 3000` (or manually)
  - Or set custom port: `PORT=3001 npm run dev`
- **"Module not found"**: 
  - Run `npm install` in `client/` directory
- **"Tailwind CSS errors"**: 
  - Check `tailwind.config.js` exists
  - Verify `postcss.config.js` is configured
  - Restart dev server
- **"Cannot connect to API"**: 
  - Ensure backend server is running on port 5000
  - Check `CLIENT_URL` in backend `.env` matches frontend URL
  - Verify CORS is enabled in backend

### Accessing the Application

Once both servers are running:

1. **Open your web browser**
2. **Navigate to**: `http://localhost:3000`
3. **You should see**: The landing page with "Tutoring Marketplace" heading

---

## 🧪 Testing the Application

### 1. Test Database Seeding

**What to Check**:
- Backend terminal should show: "✓ Student profile created" and "✓ Tutor profile created"
- This happens automatically on first server start

**If Seeding Fails**:
- Check MongoDB connection
- Verify database is empty (seeding only runs if no users exist)
- Check server logs for error messages

### 2. Test User Registration

1. Navigate to: `http://localhost:3000/auth/register`
2. Fill in the registration form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Role: Select "Student" or "Tutor"
   - Password: "test123" (minimum 6 characters)
   - Confirm Password: "test123"
3. Click "Create Account"
4. **Expected**: Redirect to dashboard based on role

**Troubleshooting**:
- **"User already exists"**: Email is already registered, use different email
- **"Registration failed"**: Check backend server is running, check server logs
- **"Network error"**: Verify backend URL in frontend code matches `http://localhost:5000`

### 3. Test User Login

**Use Default Seeded Users**:

**Student Account**:
- Email: `arshyan@seecs.edu.pk`
- Password: `password123`

**Tutor Account**:
- Email: `tutor@seecs.edu.pk`
- Password: `password123`

1. Navigate to: `http://localhost:3000/auth/student/login`
2. Enter credentials
3. Click "Sign In"
4. **Expected**: Redirect to respective dashboard (`/student/dashboard` or `/tutor/dashboard`)

**Troubleshooting**:
- **"Invalid credentials"**: 
  - Verify email/password are correct
  - Check if user exists in database
  - Ensure database was seeded properly
- **"Token not stored"**: 
  - Check browser console for errors
  - Verify localStorage is enabled
  - Check network tab for API response

### 4. Test AI Copilot

1. **Open any page** (dashboard or home)
2. **Look for floating chat button** (bottom-right corner, blue gradient)
3. **Click the chat button** to open Copilot widget
4. **Try these queries**:
   - "Show me tutors by price" → Should return tutors sorted by hourly rate
   - "Find Unreal Engine tutors" → Should filter tutors by subject
   - "Explain ID3" → Should provide algorithm explanation
   - "Help me" → Should show general help

**Troubleshooting**:
- **Chat widget not visible**: 
  - Check browser console for errors
  - Verify `ChatWidget` component is imported in pages
  - Check Tailwind CSS is loading properly
- **"Server error"**: 
  - Check backend server is running
  - Verify `/api/copilot/chat` endpoint is accessible
  - Check server logs for errors
- **No response**: 
  - Check network tab for API call
  - Verify backend `copilotController.js` is working
  - Check MongoDB connection (for tutor queries)

### 5. Test Booking System

**As a Student**:
1. Login as student
2. Navigate to dashboard
3. Create a booking (if booking form exists, or via API)
4. **Expected**: Booking created with unique meeting ID

**As a Tutor**:
1. Login as tutor
2. Navigate to dashboard
3. View bookings assigned to you

**Test Collision Detection**:
1. Create a booking for a tutor from 2:00 PM to 3:00 PM
2. Try to create another booking for the same tutor from 2:30 PM to 3:30 PM
3. **Expected**: "Slot conflict detected" error

**Troubleshooting**:
- **"Slot conflict detected"**: This is correct behavior - booking times overlap
- **"Booking not created"**: 
  - Check authentication token is valid
  - Verify tutor/student IDs exist
  - Check server logs for detailed error
- **"Meeting ID collision"**: Very rare, but if it happens, the system will retry

---

## 🔍 Debugging Guide

### Common Issues and Solutions

#### Issue 1: "Cannot connect to MongoDB"

**Symptoms**:
- Backend shows: "MongoDB connection error"
- Server crashes on startup

**Solutions**:
1. **Local MongoDB**:
   ```bash
   # Check if MongoDB is running
   mongod --version
   
   # Start MongoDB service
   # Windows: net start MongoDB
   # macOS: brew services start mongodb-community
   # Linux: sudo systemctl start mongod
   ```

2. **MongoDB Atlas**:
   - Verify connection string in `.env`
   - Check IP whitelist in Atlas dashboard
   - Verify username/password are correct
   - Check network connectivity

3. **Connection String Format**:
   - Local: `mongodb://localhost:27017/tutoring-marketplace`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

#### Issue 2: "CORS Error" or "Network Error"

**Symptoms**:
- Frontend cannot connect to backend API
- Browser console shows CORS errors
- API calls return "Network Error"

**Solutions**:
1. **Verify Backend is Running**:
   - Check terminal 1 shows "Server running on port 5000"
   - Test: `curl http://localhost:5000/api/health`

2. **Check CORS Configuration**:
   - Verify `CLIENT_URL` in `.env` matches frontend URL
   - Check `server/index.js` has `app.use(cors())`
   - Restart backend server after changing `.env`

3. **Check API URLs in Frontend**:
   - Verify all API calls use `http://localhost:5000`
   - Check `axios` base URL configuration

#### Issue 3: "JWT Token Invalid" or "Unauthorized"

**Symptoms**:
- Login works but dashboard shows "Unauthorized"
- API calls return 401 status

**Solutions**:
1. **Check Token Storage**:
   ```javascript
   // In browser console
   localStorage.getItem('token')
   // Should return a JWT string
   ```

2. **Verify JWT_SECRET**:
   - Check `.env` has `JWT_SECRET` defined
   - Ensure secret is long enough (32+ characters)
   - Restart server after changing secret

3. **Check Token Expiration**:
   - Tokens expire after 7 days
   - Re-login to get new token

#### Issue 4: "Module Not Found" Errors

**Symptoms**:
- `Cannot find module 'express'`
- `Module not found: Can't resolve 'axios'`

**Solutions**:
1. **Reinstall Dependencies**:
   ```bash
   # Backend
   cd server
   rm -rf node_modules package-lock.json
   npm install
   
   # Frontend
   cd client
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check package.json**:
   - Verify all required packages are listed
   - Check for typos in package names

#### Issue 5: "Port Already in Use"

**Symptoms**:
- `Error: listen EADDRINUSE: address already in use :::5000`
- Server won't start

**Solutions**:
1. **Find and Kill Process**:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```

2. **Change Port**:
   - Update `PORT` in `.env` to different port (e.g., 5001)
   - Update frontend API URLs if needed

#### Issue 6: "Tailwind CSS Not Working"

**Symptoms**:
- Styles not applying
- Components look unstyled
- Console shows Tailwind errors

**Solutions**:
1. **Verify Configuration Files**:
   - Check `tailwind.config.js` exists
   - Check `postcss.config.js` exists
   - Verify `globals.css` imports Tailwind

2. **Rebuild**:
   ```bash
   cd client
   rm -rf .next
   npm run dev
   ```

3. **Check Content Paths**:
   - Verify `tailwind.config.js` has correct `content` paths
   - Should include `./pages/**/*.{js,ts,jsx,tsx}`

### Debugging Tools

#### Backend Debugging

1. **Enable Detailed Logging**:
   - Add `console.log()` statements in controllers
   - Check server terminal for error messages
   - Use `console.error()` for error logging

2. **Test API Endpoints**:
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Test login (replace with actual data)
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"arshyan@seecs.edu.pk","password":"password123"}'
   ```

3. **MongoDB Debugging**:
   ```bash
   # Connect to MongoDB shell
   mongo
   # Or for newer versions:
   mongosh
   
   # Use database
   use tutoring-marketplace
   
   # Check collections
   show collections
   
   # Query users
   db.users.find().pretty()
   ```

#### Frontend Debugging

1. **Browser Developer Tools**:
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API calls
   - Check Application tab for localStorage

2. **React DevTools**:
   - Install React DevTools browser extension
   - Inspect component props and state

3. **Next.js Debugging**:
   - Check `.next` folder for build errors
   - Review terminal output for compilation errors
   - Check `pages/_app.js` for global issues

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "bio": "Optional bio text",
  "subjects": ["Math", "CS"],  // For tutors only
  "hourlyRate": 50             // For tutors only
}
```

**Response** (201):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### POST `/api/auth/login`
Login existing user.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Booking Endpoints (Require Authentication)

#### POST `/api/bookings`
Create a new booking.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "studentId": "student_id",
  "tutorId": "tutor_id",
  "startTime": "2024-01-15T14:00:00Z",
  "endTime": "2024-01-15T15:00:00Z"
}
```

**Response** (201):
```json
{
  "message": "Booking created successfully",
  "booking": {
    "_id": "booking_id",
    "studentId": {...},
    "tutorId": {...},
    "startTime": "2024-01-15T14:00:00Z",
    "endTime": "2024-01-15T15:00:00Z",
    "meetingId": "TutorApp_abc123",
    "status": "pending"
  }
}
```

**Error** (400): "Slot conflict detected" - Booking time overlaps with existing booking

#### GET `/api/bookings`
Get user's bookings.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `userId`: User ID
- `role`: "student" or "tutor"

**Response** (200):
```json
{
  "bookings": [...]
}
```

#### PATCH `/api/bookings/:bookingId`
Update booking status.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "status": "confirmed"  // "pending", "confirmed", or "cancelled"
}
```

### AI Copilot Endpoints

#### POST `/api/copilot/chat`
Chat with AI Copilot.

**Request Body**:
```json
{
  "message": "Show me tutors by price",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"}
  ]
}
```

**Response** (200):
```json
{
  "response": "Here are tutors sorted by hourly rate...",
  "tutors": [...],  // If applicable
  "detectedKeywords": ["price"]
}
```

---

## 🎓 Default Users (Auto-Seeded)

The system automatically creates these users on first database connection:

### Student Account
- **Email**: `arshyan@seecs.edu.pk`
- **Password**: `password123`
- **Name**: Muhammad Arshyan
- **Bio**: Data Science Student from SEECS Batch '23
- **Role**: student

### Tutor Account
- **Email**: `tutor@seecs.edu.pk`
- **Password**: `password123`
- **Name**: Expert Tutor
- **Bio**: Experienced tutor specializing in Machine Learning, CNN Architecture, and Unreal Engine 5
- **Subjects**: Machine Learning, CNN Architecture, Unreal Engine 5, Deep Learning, Computer Vision
- **Hourly Rate**: $50/hr
- **Role**: tutor

**Note**: Seeding only occurs if the database is empty. To re-seed, clear the `users` collection in MongoDB.

---

## 🔐 Security Considerations

### Production Deployment Checklist

1. **Environment Variables**:
   - Change `JWT_SECRET` to a strong, random string (use `openssl rand -base64 32`)
   - Use environment-specific `.env` files
   - Never commit `.env` to version control

2. **MongoDB Security**:
   - Use strong passwords for database users
   - Enable MongoDB authentication
   - Use connection string with credentials
   - Whitelist only necessary IP addresses

3. **API Security**:
   - Implement rate limiting
   - Add input validation and sanitization
   - Use HTTPS in production
   - Implement CORS properly

4. **Frontend Security**:
   - Don't expose sensitive API keys
   - Validate user inputs
   - Implement proper error handling
   - Use secure token storage (consider httpOnly cookies)

---

## 📝 Development Notes

### Code Architecture

- **MVC Pattern**: Controllers handle business logic, Models define data structure, Routes define endpoints
- **Middleware**: JWT authentication middleware protects routes
- **Error Handling**: All async operations wrapped in try/catch blocks
- **Database Indexing**: Compound indexes on `tutorId + startTime` for optimal booking queries

### Key Algorithms

1. **Booking Collision Detection**:
   ```javascript
   // Query: ExistingStart < RequestEnd AND ExistingEnd > RequestStart
   const existingBookings = await Booking.find({
     tutorId,
     status: { $in: ['pending', 'confirmed'] },
     $or: [
       { startTime: { $lt: end }, endTime: { $gt: start } }
     ]
   });
   ```

2. **AI Copilot Keyword Detection**:
   - Uses regex patterns to detect keywords
   - Branches based on detected keywords
   - Maintains conversation history for context

### Future Enhancements

- Video conferencing integration (Jitsi)
- Payment processing
- Email notifications
- Advanced search and filtering
- Tutor rating system
- Calendar integration
- Mobile app (React Native)

---

## 🐛 Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| MongoDB connection error | Start MongoDB service or check Atlas connection string |
| Port already in use | Change PORT in .env or kill process using the port |
| CORS error | Verify CLIENT_URL in .env matches frontend URL |
| Module not found | Run `npm install` in respective directory |
| JWT token invalid | Check JWT_SECRET in .env, re-login |
| Tailwind not working | Check tailwind.config.js, rebuild with `rm -rf .next` |
| Seeding not working | Clear users collection, restart server |
| API not responding | Check backend server is running, verify API URL |

---

## 📞 Support & Contribution

This project is designed for educational purposes. For issues or questions:

1. Check this README's troubleshooting section
2. Review server and browser console logs
3. Verify all prerequisites are installed
4. Check environment variables are set correctly

---

## 📄 License

This project is for educational purposes.

---

**Last Updated**: 2024
**Version**: 1.0.0
