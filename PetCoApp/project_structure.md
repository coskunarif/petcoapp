
# PetCoApp Project Structure

## Project Overview
PetCoApp (also called Pet Connect in the UI) is a mobile app built with Expo/React Native that facilitates a pet care cooperative system. The app connects pet owners with service providers for various pet care services such as dog walking, pet sitting, boarding, and transportation.

## Directory Structure
The project is located at C:\Project\petcoapp and has the following main directories:

- `.git`: Git repository metadata
- `backend`: Server-side code (Supabase configuration)
- `frontend`: React Native with Expo mobile app code
- `node_modules`: NPM dependencies
- `PetCoApp`: Documentation and specification files

## Frontend Structure
The frontend is a React Native app with Expo, using the following structure:
- `frontend/src/api`: API integration code
- `frontend/src/components`: Reusable UI components
- `frontend/src/navigation`: Navigation configuration
- `frontend/src/redux`: Redux state management
  - `frontend/src/redux/slices`: Redux slices organized by feature
  - `frontend/src/redux/selectors.ts`: Memoized selectors
- `frontend/src/screens`: Screen components organized by feature
- `frontend/src/services`: Service layer for backend communication
- `frontend/src/migrations`: SQL migration scripts for Supabase
- `frontend/src/store`: Redux store configuration
- `frontend/src/lib`: Utility functions
- `frontend/src/theme`: Styling and theming configuration

## Technical Stack
- **Frontend**: 
  - React Native with Expo (version 52)
  - State Management: Redux Toolkit and React Query
  - UI Components: React Native Paper
  - Navigation: React Navigation
  - Form Handling: Formik with Yup
  - Maps/Location: React Native Maps and Expo Location
  - Notifications: Expo Notifications and Badge

- **Backend**:
  - Database: PostgreSQL via Supabase
  - Authentication: Supabase Auth
  - File Storage: Supabase Storage
  - Geospatial Features: PostGIS

## Key Features
1. Pet Care Service Marketplace
2. Social Features (profiles with ratings, messaging)
3. Location-Based Service Discovery
4. Pet Management
5. Credit-based system for service exchange
6. Push Notifications with user preferences
7. User Profile Management (including personal info, contact details, bio)

## Navigation Structure
- Authentication Flow: Login, Signup, Onboarding
- Main App: Home, PetList, Services, Messages, Profile

## Database Schema
The app uses PostgreSQL with the following main tables:
- users
- pets
- service_types
- service_listings
- service_requests
- reviews
- messages
- user_notification_settings

See the full schema details in database_schema.txt

