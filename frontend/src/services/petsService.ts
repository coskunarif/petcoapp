import supabase from '../supabaseClient';
import { Pet } from '../store/petsSlice';

export async function fetchPets(userId: string): Promise<Pet[]> {
  console.log('[petsService.fetchPets] called with userId:', userId);
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  console.log('[petsService.fetchPets] Supabase response:', { data, error });
  if (error) throw error;
  return data as Pet[];
}

export async function addPet(pet: Partial<Pet> & { owner_id: string }): Promise<Pet> {
  const { data, error } = await supabase
    .from('pets')
    .insert([pet])
    .select()
    .single();
  if (error) throw error;
  return data as Pet;
}

export async function updatePet(petId: string, updates: Partial<Pet>): Promise<Pet> {
  const { data, error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', petId)
    .select()
    .single();
  if (error) throw error;
  return data as Pet;
}

export async function uploadPetImage(file: File, userId: string, petId: string): Promise<string> {
  const filePath = `${userId}/${petId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('pet-images').upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from('pet-images').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deletePet(petId: string): Promise<void> {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId);
  if (error) throw error;
}
