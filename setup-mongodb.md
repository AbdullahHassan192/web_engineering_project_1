# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended for Quick Start)

MongoDB Atlas is a free cloud database service. This is the easiest way to get started.

### Steps:
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (Free tier: M0)
4. Create a database user (username/password)
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `tutoring-marketplace`

7. Update `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tutoring-marketplace?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB Installation

### Windows Installation:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service (recommended)
5. Install MongoDB Compass (GUI tool - optional)

### After Installation:
1. MongoDB service should start automatically
2. If not, start it manually:
   ```powershell
   net start MongoDB
   ```

3. Verify installation:
   ```powershell
   mongod --version
   ```

4. The default connection string in `.env` should work:
   ```
   MONGO_URI=mongodb://localhost:27017/tutoring-marketplace
   ```

### Troubleshooting:
- If `mongod` command not found, add MongoDB to PATH:
  - Usually: `C:\Program Files\MongoDB\Server\<version>\bin`
- If port 27017 is in use, check what's using it:
  ```powershell
  netstat -ano | findstr :27017
  ```
















