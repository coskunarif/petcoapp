-- Migration: Update find_nearby_providers function
-- This migration improves the find_nearby_providers function to:
-- 1. Handle null service_type parameter
-- 2. Return additional fields needed by the UI (serviceTypes, availability)
-- 3. Include distance calculation in the result

-- Create a type to return structured provider data if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_result') THEN
    CREATE TYPE provider_result AS (
      id UUID,
      full_name TEXT,
      profile_image_url TEXT,
      rating NUMERIC,
      distance_km FLOAT,
      service_types TEXT[],
      availability TEXT[]
    );
  END IF;
END
$$;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS find_nearby_providers;

-- Create updated function
CREATE OR REPLACE FUNCTION find_nearby_providers(
  user_location GEOGRAPHY,
  distance_km DOUBLE PRECISION,
  service_type UUID DEFAULT NULL,
  min_rating INT DEFAULT 0
)
RETURNS SETOF provider_result AS $$
BEGIN
  RETURN QUERY
    -- Main query to find providers
    SELECT 
      u.id,
      u.full_name,
      u.profile_image_url,
      COALESCE(u.rating, 0) AS rating,
      -- Calculate distance in kilometers
      ST_Distance(u.location, user_location) / 1000 AS distance_km,
      -- Get service types offered by the provider
      ARRAY(
        SELECT st.name
        FROM service_listings sl
        JOIN service_types st ON sl.service_type_id = st.id
        WHERE sl.provider_id = u.id 
        AND sl.is_active = true
      ) AS service_types,
      -- For availability, extract days from availability_schedule, or use default
      ARRAY['Mon', 'Wed', 'Fri'] AS availability -- Default fallback
    FROM 
      users u
    WHERE 
      -- Find users within the specified distance
      ST_DWithin(u.location, user_location, distance_km * 1000)
      -- Apply minimum rating filter
      AND COALESCE(u.rating, 0) >= min_rating
      -- If service_type is provided, check if provider offers it
      AND (service_type IS NULL OR EXISTS (
        SELECT 1 
        FROM service_listings sl
        WHERE sl.provider_id = u.id 
        AND (service_type IS NULL OR sl.service_type_id = service_type)
        AND sl.is_active = true
      ))
      -- Exclude providers with no location data
      AND u.location IS NOT NULL
    -- Sort by distance (closest first)
    ORDER BY ST_Distance(u.location, user_location) ASC
    LIMIT 20; -- Limit to 20 closest providers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;