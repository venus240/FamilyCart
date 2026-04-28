import { supabase } from './supabase';
import type { Category, ShoppingItem } from '@/types/database';

export async function getCategories(familyId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('family_id', familyId)
    .order('sort_order');

  return { data: (data as Category[]) ?? [], error: error?.message ?? null };
}

export async function getShoppingItems(familyId: string) {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*, categories(*)')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  return { data: (data as ShoppingItem[]) ?? [], error: error?.message ?? null };
}

export async function addShoppingItem(item: Partial<ShoppingItem>) {
  const { data, error } = await supabase
    .from('shopping_items')
    .insert(item)
    .select()
    .single();

  return { data: data as ShoppingItem, error: error?.message ?? null };
}

export async function toggleItemStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'to_buy' ? 'bought' : 'to_buy';
  const updateData =
    newStatus === 'bought'
      ? { status: newStatus, bought_at: new Date().toISOString() }
      : { status: newStatus, bought_at: null, bought_by: null };

  const { data, error } = await supabase
    .from('shopping_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  return { data: data as ShoppingItem, error: error?.message ?? null };
}

export async function markItemBoughtWithPrice(itemId: string, price: number, store: string) {
  const { data, error } = await supabase.rpc('mark_item_bought', {
    item_id: itemId,
    item_price: price,
    item_store: store,
  });

  return { data: data as ShoppingItem, error: error?.message ?? null };
}

export async function deleteShoppingItem(id: string) {
  const { error } = await supabase.from('shopping_items').delete().eq('id', id);
  return { error: error?.message ?? null };
}
