# Pet Care Co-Op Mobile App

This repository contains the full-stack implementation for the Pet Care Co-Op app, including:

- **Frontend**: React Native mobile app (Expo)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)

## Project Documentation

The project documentation is organized as follows:

- **`/PetCoApp/project_structure.md`**: Provides a comprehensive overview of the project's architecture, directory structure, technical stack, and key features. This is the main reference for understanding how the application is organized.

- **`/PetCoApp/database_schema.txt`**: Contains the detailed database schema, including all tables, columns, relationships, and key functions. This document is essential for understanding the data model.

- **`/CLAUDE.md`**: Contains guidelines and command information for Claude Code when working with this repository.

- **Feature-specific documentation**: Some features have their own README files, like `/frontend/src/screens/profile/settings/README-notifications.md` for the notifications system.

## Setup Instructions

### Backend (Supabase)
See `backend/README.md` for setup steps and SQL schema/functions.

The `/frontend/src/migrations/` directory contains SQL scripts that need to be run on your Supabase instance to set up required tables and functions.

### Frontend (React Native)
See `frontend/README.md` for setup and development instructions.

## Key Features

- Pet care service marketplace
- User profiles and social features
- Location-based service discovery
- Pet management
- Credit-based service exchange
- Push notifications
- Messaging system
- Profile management

See `/PetCoApp/project_structure.md` for a complete feature list and technical details.

---

© 2025 Pet Care Co-Op
