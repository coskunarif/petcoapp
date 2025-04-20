# Supabase Backend Setup for Pet Care Co-Op

1. Create a new project in [Supabase](https://app.supabase.com/).
2. Go to SQL Editor and run `supabase_schema.sql` to create tables.
3. Run `supabase_functions.sql` to add custom functions.
4. Set up authentication (enable email/password sign up).
5. Configure Row Level Security (RLS) policies for each table as needed (see your architecture doc for examples).
6. Add storage buckets for user and pet images if needed.

**Note:** You may need to enable the PostGIS extension for location features:
```sql
create extension if not exists postgis;
```

For additional business logic, use Supabase Edge Functions or SQL as needed.
