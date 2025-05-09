# Pets Screen Backend Implementation

This document provides an overview of the backend implementation for the Pets screen in the PetCoApp.

## Changes Made

1. **Enhanced Pets Service (`petsService.ts`)**:
   - Added proper error handling with try/catch blocks
   - Added detailed logging for better debugging
   - Added function to fetch a single pet by ID
   - Added support for uploading multiple pet images
   - Added function to delete pet images
   - Implemented real-time subscriptions for pet changes

2. **Updated Redux Store (`petsSlice.ts`)**:
   - Enhanced state management with TypeScript
   - Added support for real-time updates with Supabase
   - Added reducers for real-time pet changes (add, update, delete)
   - Improved error handling throughout
   - Added thunks for multiple image uploads and deletion
   - Added subscription management

3. **Updated UI Components**:
   - Enhanced `PetsScreen.native.tsx` with real-time subscriptions
   - Improved `PetsList.native.tsx` with better refresh handling
   - Added proper loading indicators and error handling

## Testing Instructions

To test the Pets screen implementation, follow these steps:

### Basic CRUD Operations

1. **View Pets**:
   - Launch the app and navigate to the Pets screen
   - Verify that your pets load correctly
   - Pull down to refresh the list and ensure it updates

2. **Add a Pet**:
   - Tap the "+" button at the bottom right
   - Fill in the pet details (name, species, etc.)
   - Save the pet and verify it appears in your list
   - Check Supabase to verify the pet was added to the database

3. **Edit a Pet**:
   - Tap on a pet card and select edit
   - Change some information and save
   - Verify the changes appear in the list
   - Check Supabase to verify the changes were saved

4. **Delete a Pet**:
   - Tap on a pet card and select delete
   - Confirm deletion
   - Verify the pet is removed from the list
   - Check Supabase to verify the pet was deleted from the database

### Real-time Updates

To test real-time updates, you'll need two devices or simulators logged into the same account:

1. Open the app on both devices and navigate to the Pets screen
2. Make a change on one device (add, edit, or delete a pet)
3. Verify that the change appears on the other device without needing to refresh

### Image Handling

1. **Add Images**:
   - Edit a pet
   - Add one or more images
   - Verify that the images appear in the pet details
   - Check Supabase storage to verify the images were uploaded

2. **Delete Images**:
   - Edit a pet with images
   - Delete an image
   - Verify that the image is removed from the pet details
   - Check Supabase storage to verify the image was deleted

## Troubleshooting

If you encounter issues:

1. Check the console logs for error messages
2. Make sure your Supabase connection is working
3. Verify that you have the correct permissions in Supabase
4. Try logging out and back in to refresh your authentication token

## Implementation Details

### Database Schema

The pets table contains the following fields:
- `id`: UUID primary key
- `owner_id`: UUID reference to the users table
- `name`: Text
- `species`: Text
- `breed`: Text (optional)
- `age`: Integer (optional)
- `weight`: Decimal (optional)
- `care`: JSON (optional)
- `photos`: Array of text (URLs)
- `vetInfo`: Text (optional)
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

### Real-time Subscriptions

We use Supabase's real-time capabilities to subscribe to changes in the pets table. This allows the app to receive updates instantly when:
- A new pet is added
- An existing pet is updated
- A pet is deleted

### Image Storage

Pet images are stored in the Supabase storage bucket named 'pet-images'. Each image has a path structure of:
`{userId}/{petId}/{timestamp}_{filename}`

This ensures unique file paths for each upload and organizes images by user and pet.