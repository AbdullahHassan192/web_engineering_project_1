# .env File Explanation

## Why There Was 2 .env Files

### The Issue
You had **2 .env files**:
1. **Root `.env`** (CORRECT - Required) ✅
2. **Client `.env`** (UNNECESSARY - Removed) ❌

### Why This Happened
The `client/.env` file was likely created accidentally or from a previous project setup. It contained:
- Wrong database name (`tutorconnect` instead of `tutoring-marketplace`)
- Wrong JWT_SECRET (placeholder value)
- Duplicate configuration

### Why Only One .env File is Needed

**Root `.env` file** (Required):
- Located at: `web_engineering_project_1/.env`
- Used by: **Backend server** (Node.js/Express)
- Contains: MongoDB connection, JWT_SECRET, PORT, etc.
- Read by: `server/index.js` using `require('dotenv').config()`

**Client `.env` file** (NOT needed):
- Next.js frontend doesn't need server-side environment variables
- Frontend uses hardcoded API URLs or `NEXT_PUBLIC_*` variables
- Server-side secrets should NEVER be in client code

### Current Setup (Correct)

```
web_engineering_project_1/
├── .env                    ← ONLY THIS ONE (for server)
├── client/
│   └── (no .env needed)
└── server/
    └── (reads from root .env)
```

### How It Works

1. **Server** reads from `root/.env`:
   ```javascript
   // server/index.js
   require('dotenv').config(); // Reads root/.env
   const MONGO_URI = process.env.MONGO_URI;
   const JWT_SECRET = process.env.JWT_SECRET;
   ```

2. **Client** uses hardcoded URLs or public env vars:
   ```javascript
   // client/pages/auth/student/login.js
   axios.post('http://localhost:5000/api/auth/login', ...)
   ```

### If You Need Client-Side Environment Variables

If you need environment variables in Next.js frontend, use:
- `NEXT_PUBLIC_*` prefix (exposed to browser)
- Example: `NEXT_PUBLIC_API_URL=http://localhost:5000`
- These can be in root `.env` or `client/.env.local`

### Summary

✅ **Keep**: `root/.env` - Required for server
❌ **Removed**: `client/.env` - Unnecessary and had wrong values

**Result**: Now you have only **1 .env file** in the correct location!















