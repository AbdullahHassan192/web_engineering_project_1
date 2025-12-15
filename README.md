# TutorConnect - Online Tutoring Marketplace

A full-stack tutoring marketplace platform built with the MERN stack (MongoDB, Express.js, React/Next.js, Node.js). Connects students with expert tutors for personalized learning sessions.

---

## 🎯 Features

### For Students
- **Browse & Search Tutors**: Search by subject, price range, and ratings with real-time filtering
- **Book Sessions**: Duration-based booking system (1-2.5 hours) with platform selection (Jitsi Meet, Zoom, Google Meet, MS Teams, Skype, Other)
- **Jitsi Meet Integration**: Automatic video meeting link generation for Jitsi sessions - shared instantly upon booking confirmation
- **Multiple Reminders**: Get notified at 15, 10, and 5 minutes before your session starts
- **Personal Dashboard**: View stats, manage bookings, edit profile, and track performance analytics
- **Real-Time Chat**: Message tutors directly with booking integration and clickable meeting links
- **Review System**: Rate and review tutors after completed sessions, edit reviews
- **Performance Tracking**: Subject-wise analytics, learning hours, and tutor feedback

### For Tutors
- **Professional Dashboard**: Manage profile, subjects, and hourly rates
- **Booking Management**: Accept/reject booking requests, view upcoming sessions
- **Jitsi Meet Auto-Setup**: Automatic meeting links for Jitsi sessions - no manual setup needed
- **Session Reminders**: Receive alerts at 15, 10, and 5 minutes before each session
- **Student Management**: Track all students you've tutored with detailed stats
- **Earnings Dashboard**: Financial overview with monthly breakdowns and session history
- **Real-Time Notifications**: Instant alerts for new booking requests
- **Chat System**: Communicate with students with automatic booking confirmations

### Platform Features
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Real-Time Updates**: Socket.io for live notifications and chat
- **Jitsi Meet Integration**: Automatic video conferencing with instant link generation (default platform)
- **Smart Notifications**: Triple reminder system (15/10/5 mins) with platform-specific instructions
- **Multi-Platform Support**: Choose between Jitsi Meet (auto-link), Zoom, Google Meet, MS Teams, Skype, or Other
- **Review & Rating System**: Students can rate tutors, with voting on helpful reviews
- **Collision Detection**: Prevents double-booking with time overlap validation
- **Responsive Design**: Modern dark theme with Tailwind CSS
- **AI Copilot**: Interactive chat widget for platform assistance

---

## 🛠 Tech Stack

**Frontend:** Next.js 14, React 18, Tailwind CSS, Axios, Socket.io Client, Lucide Icons  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.io, JWT, Bcrypt  

---

## 📁 Project Structure

```
web_engineering_project_1/
├── client/                    # Next.js Frontend
│   ├── components/
│   │   ├── Header.js
│   │   ├── NotificationBell.js
│   │   └── copilot/
│   │       └── ChatWidget.js
│   ├── pages/
│   │   ├── index.js          # Landing page
│   │   ├── search.js         # Advanced tutor search
│   │   ├── chats.js          # Chat interface
│   │   ├── auth/
│   │   │   ├── register.js
│   │   │   └── student/login.js
│   │   ├── student/
│   │   │   ├── home.js       # Browse tutors & book
│   │   │   └── dashboard.js  # Student dashboard
│   │   └── tutor/
│   │       ├── home.js       # Tutor overview
│   │       ├── dashboard.js  # Profile management
│   │       ├── students.js   # Student list
│   │       └── earnings.js   # Financial tracking
│   └── package.json
│
├── server/                    # Express.js Backend
│   ├── controllers/          # Business logic
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth & validation
│   ├── index.js              # Server entry point
│   └── package.json
│
├── .env                      # Environment variables
└── README.md
```

---

## 💻 Prerequisites

1. **Node.js** (v18+) - Check: `node --version`
2. **MongoDB** (local or MongoDB Atlas)
3. **npm** (comes with Node.js)

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create a `.env` file in the **root directory**:

```env
MONGO_URI=mongodb://localhost:27017/tutoring-marketplace
JWT_SECRET=your-secret-key-min-32-characters
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**For MongoDB Atlas**, replace `MONGO_URI` with your connection string.

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or start MongoDB service
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
```

Skip this if using MongoDB Atlas.

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access the Application

Open your browser and navigate to: **http://localhost:3000**

---

## 👤 Default Test Accounts

**Student:**
- Email: `arshyan@seecs.edu.pk`
- Password: `password123`

**Tutor:**
- Email: `tutor@seecs.edu.pk`
- Password: `password123`

---

## 📚 Key Pages

- `/` - Landing page with tutor search
- `/auth/register` - Create new account
- `/auth/student/login` - Student login
- `/student/home` - Browse and book tutors
- `/student/dashboard` - Student profile and bookings
- `/tutor/home` - Tutor overview
- `/tutor/dashboard` - Profile management
- `/tutor/students` - Student list
- `/tutor/earnings` - Financial tracking
- `/search` - Advanced tutor search
- `/chats` - Messaging interface

---

## ⚠️ Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env` file
- For Atlas, verify connection string and IP whitelist

**Port Already in Use:**
- Backend: Change `PORT` in `.env`
- Frontend: Kill the process or use: `PORT=3001 npm run dev`

**Cannot Connect to API:**
- Ensure backend is running on port 5000
- Verify `CLIENT_URL` in `.env` matches frontend URL
- Check CORS configuration

**Module Not Found:**
- Run `npm install` in the respective directory
- Clear cache: `npm cache clean --force`
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

---

## 📄 License

This project is for educational purposes.
