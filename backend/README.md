# Supabase Backend Setup for Pet Care Co-Op

## Setup Instructions

1. Create a new project in [Supabase](https://app.supabase.com/).
2. Enable the following extensions:
   ```sql
   create extension if not exists postgis;  -- For location features
   create extension if not exists "uuid-ossp";  -- For UUID generation
   ```
3. Go to SQL Editor and run `supabase_schema.sql` to create tables.
4. Run `supabase_functions.sql` to add custom functions.
5. Set up authentication (enable email/password sign up).
6. Configure Row Level Security (RLS) policies for each table as needed.
7. Add storage buckets for user and pet images if needed.

## Database Schema

The application includes the following main tables:

- `users`: User profiles with personal info, contact details (phone, email), and location
- `pets`: Pet information linked to owners
- `service_types`: Available service categories
- `service_listings`: Services offered by providers
- `service_requests`: Service bookings between users
- `reviews`: Ratings and feedback on completed services
- `messages`: Communication between users
- `user_notification_settings`: User preferences for push notifications

## Key Functions

- `handle_new_user()`: Creates default notification settings when a new user signs up
- `complete_service_request()`: Handles service completion and credit transfers
- `find_nearby_providers()`: Uses PostGIS to locate service providers in a given area

## Migrations

Additional migration scripts can be found in the frontend repository at `/frontend/src/migrations/`.

For additional business logic, use Supabase Edge Functions or SQL as needed.
