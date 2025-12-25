# FeiYue System - Employee Time Tracking

## Overview
FeiYue System is a Vietnamese employee time tracking and attendance management system. It tracks employee check-ins, breaks (bathroom, smoking, phone calls), and shift changes with automatic violation detection and fine calculation.

## Features
- Employee login and authentication
- Check-in/check-out tracking with time validation
- Break management (bathroom: 3x/day at 15min, smoking: 8x/day at 8min, phone: unlimited)
- Automatic violation detection and fine calculation ($10 per violation)
- Admin panel for managing all employee data
- Boss/Manager view for monitoring
- Revenue tracking system (separate page at /revenue)
- Automatic daily reset at 01:00

## Project Structure
- `server.js` - Express backend server with PostgreSQL integration
- `index.html` - Main attendance tracking application
- `revenue.html` - Revenue tracking dashboard
- `_sdk/data_sdk.js` - Data layer SDK for frontend-backend communication
- `_sdk/element_sdk.js` - UI configuration SDK

## Database
Uses PostgreSQL with two tables:
- `attendance_records` - All attendance/break/violation records
- `revenue_records` - Transaction revenue data

## Setup and Running

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup PostgreSQL database:**
   ```bash
   # Start PostgreSQL service
   sudo service postgresql start
   
   # Create database and user
   sudo -u postgres psql -c "CREATE DATABASE feiyue;"
   sudo -u postgres psql -c "CREATE USER feiyue_user WITH PASSWORD 'feiyue123';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE feiyue TO feiyue_user;"
   sudo -u postgres psql feiyue -c "GRANT ALL ON SCHEMA public TO feiyue_user;"
   ```

3. **Configure environment:**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env if needed to change database credentials
   ```

4. **Start the application:**
   ```bash
   # Option 1: Use the startup script
   ./start.sh
   
   # Option 2: Run directly
   DATABASE_URL=postgresql://feiyue_user:feiyue123@localhost:5432/feiyue node server.js
   
   # Option 3: With npm
   npm start
   ```

The application will be available at http://localhost:5000

## Default Accounts
Employee codes: 2001-2009, 1001-1012, 3001, 3003, etc.
Admin: 3040 (password required)
Boss accounts: 3006, 3007 (password required)
