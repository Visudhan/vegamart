import { supabase } from './supabaseClient';

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name
      )
    `)
    .order('name');
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}
