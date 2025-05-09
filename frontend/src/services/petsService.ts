import { supabase } from '../supabaseClient';
import { Pet } from '../store/petsSlice';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Fetch all pets for a user
 * @param userId The user ID to fetch pets for
 * @returns Array of pets
 */
export async function fetchPets(userId: string): Promise<Pet[]> {
  console.log('[petsService.fetchPets] called with userId:', userId);
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    console.log('[petsService.fetchPets] Supabase response:', { data, error });
    
    if (error) throw error;
    return data as Pet[];
  } catch (error) {
    console.error('[petsService.fetchPets] Error:', error);
    throw new Error(`Failed to fetch pets: ${(error as Error).message}`);
  }
}

/**
 * Fetch a single pet by ID
 * @param petId The pet ID to fetch
 * @returns Pet object or null if not found
 */
export async function fetchPetById(petId: string): Promise<Pet | null> {
  console.log('[petsService.fetchPetById] called with petId:', petId);
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found error
        return null;
      }
      throw error;
    }
    
    return data as Pet;
  } catch (error) {
    console.error('[petsService.fetchPetById] Error:', error);
    throw new Error(`Failed to fetch pet: ${(error as Error).message}`);
  }
}

/**
 * Add a new pet
 * @param pet The pet data to add
 * @returns Created pet object
 */
export async function addPet(pet: Partial<Pet> & { owner_id: string }): Promise<Pet> {
  console.log('[petsService.addPet] Adding pet for user:', pet.owner_id);
  
  try {
    // Remove any empty ID to let the database generate one
    const petData = { ...pet };
    if ('id' in petData && (!petData.id || petData.id === '')) {
      delete petData.id;
    }
    
    console.log('[petsService.addPet] Prepared data for insertion:', petData);
    
    const { data, error } = await supabase
      .from('pets')
      .insert([petData])
      .select()
      .single();
    
    if (error) throw error;
    console.log('[petsService.addPet] Pet created successfully:', data);
    return data as Pet;
  } catch (error) {
    console.error('[petsService.addPet] Error:', error);
    throw new Error(`Failed to add pet: ${(error as Error).message}`);
  }
}

/**
 * Update an existing pet
 * @param petId The pet ID to update
 * @param updates The updates to apply
 * @returns Updated pet object
 */
export async function updatePet(petId: string, updates: Partial<Pet>): Promise<Pet> {
  console.log('[petsService.updatePet] Updating pet:', petId);
  try {
    const { data, error } = await supabase
      .from('pets')
      .update(updates)
      .eq('id', petId)
      .select()
      .single();
    
    if (error) throw error;
    console.log('[petsService.updatePet] Pet updated successfully:', data);
    return data as Pet;
  } catch (error) {
    console.error('[petsService.updatePet] Error:', error);
    throw new Error(`Failed to update pet: ${(error as Error).message}`);
  }
}

/**
 * Upload a single pet image
 * @param file The file to upload
 * @param userId User ID
 * @param petId Pet ID
 * @returns Public URL of the uploaded image
 */
export async function uploadPetImage(
  file: File, 
  userId: string, 
  petId: string
): Promise<string> {
  console.log('[petsService.uploadPetImage] Uploading image for pet:', petId);
  try {
    // Create a unique file path
    const filePath = `${userId}/${petId}/${Date.now()}_${file.name}`;
    
    // Upload the file
    const { error } = await supabase.storage
      .from('pet-images')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Get the public URL
    const { data } = supabase.storage
      .from('pet-images')
      .getPublicUrl(filePath);
    
    console.log('[petsService.uploadPetImage] Image uploaded successfully:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('[petsService.uploadPetImage] Error:', error);
    throw new Error(`Failed to upload image: ${(error as Error).message}`);
  }
}

/**
 * Upload multiple pet images
 * @param files Array of files to upload
 * @param userId User ID
 * @param petId Pet ID
 * @param progressCallback Optional callback for upload progress
 * @returns Array of public URLs for the uploaded images
 */
export async function uploadMultiplePetImages(
  files: File[], 
  userId: string, 
  petId: string,
  progressCallback?: (progress: number) => void
): Promise<string[]> {
  console.log('[petsService.uploadMultiplePetImages] Uploading multiple images for pet:', petId);
  
  try {
    const urls: string[] = [];
    let completed = 0;
    
    // Upload each file sequentially
    for (const file of files) {
      const url = await uploadPetImage(file, userId, petId);
      urls.push(url);
      completed++;
      
      // Update progress if callback provided
      if (progressCallback) {
        progressCallback((completed / files.length) * 100);
      }
    }
    
    console.log('[petsService.uploadMultiplePetImages] All images uploaded successfully');
    return urls;
  } catch (error) {
    console.error('[petsService.uploadMultiplePetImages] Error:', error);
    throw new Error(`Failed to upload images: ${(error as Error).message}`);
  }
}

/**
 * Delete a pet image from storage
 * @param imageUrl The public URL of the image to delete
 * @returns True if successful
 */
export async function deletePetImage(imageUrl: string): Promise<boolean> {
  console.log('[petsService.deletePetImage] Deleting image:', imageUrl);
  try {
    // Extract the path from the URL
    const urlParts = imageUrl.split('pet-images/');
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL format');
    }
    
    const filePath = urlParts[1];
    const { error } = await supabase.storage
      .from('pet-images')
      .remove([filePath]);
    
    if (error) throw error;
    console.log('[petsService.deletePetImage] Image deleted successfully');
    return true;
  } catch (error) {
    console.error('[petsService.deletePetImage] Error:', error);
    throw new Error(`Failed to delete image: ${(error as Error).message}`);
  }
}

/**
 * Delete a pet
 * @param petId The pet ID to delete
 * @returns void
 */
export async function deletePet(petId: string): Promise<void> {
  console.log('[petsService.deletePet] Deleting pet:', petId);
  try {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId);
    
    if (error) throw error;
    console.log('[petsService.deletePet] Pet deleted successfully');
  } catch (error) {
    console.error('[petsService.deletePet] Error:', error);
    throw new Error(`Failed to delete pet: ${(error as Error).message}`);
  }
}

/**
 * Subscribe to changes in a user's pets
 * @param userId User ID to subscribe to
 * @param callback Function to call when changes occur
 * @returns Supabase channel object
 */
export function subscribeToPetsChanges(
  userId: string,
  callback: (payload: any) => void
): RealtimeChannel {
  console.log('[petsService.subscribeToPetsChanges] Setting up subscription for user:', userId);
  
  const channel = supabase.channel(`pets_${userId}`);
  
  channel
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'pets',
      filter: `owner_id=eq.${userId}`
    }, (payload) => {
      console.log('[petsService.subscribeToPetsChanges] Pet change detected:', payload);
      callback(payload);
    })
    .subscribe();
  
  return channel;
}

/**
 * Unsubscribe from a channel
 * @param channel The channel to unsubscribe from
 */
export async function unsubscribePets(channel: RealtimeChannel): Promise<void> {
  console.log('[petsService.unsubscribePets] Unsubscribing from channel');
  await supabase.removeChannel(channel);
}
