import { supabase } from './supabase';
import type { PriceHistory } from '@/types/database';

export async function getPriceHistory(familyId: string) {
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('family_id', familyId)
    .order('bought_at', { ascending: false });

  return { data: (data as PriceHistory[]) ?? [], error: error?.message ?? null };
}
