import { supabase } from './supabase';
import type { Family, FamilyMember } from '@/types/database';

export async function createFamily(name: string) {
  const { data, error } = await supabase.rpc('create_family', { family_name: name });
  if (error) return { data: null, error: error.message };
  return { data: data as Family, error: null };
}

export async function joinFamily(code: string) {
  const { data, error } = await supabase.rpc('join_family', { code: code.toUpperCase() });
  if (error) return { data: null, error: error.message };
  return { data: data as Family, error: null };
}

export async function getCurrentFamily() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.current_family_id) return { data: null, error: null };

  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('id', profile.current_family_id)
    .single();

  return { data: data as Family | null, error: error?.message ?? null };
}

export async function getFamilyMembers(familyId: string) {
  const { data, error } = await supabase
    .from('family_members')
    .select('*, profiles(full_name, email, avatar_url)')
    .eq('family_id', familyId)
    .order('joined_at', { ascending: true });

  return { data: (data as FamilyMember[]) ?? [], error: error?.message ?? null };
}

export async function getUserFamilies() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('family_members')
    .select('*, families(*)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  console.log("getUserFamilies - data:", JSON.stringify(data, null, 2));
  console.log("getUserFamilies - error:", error);

  // Map out the families array from the joined result and filter nulls
  const families = data?.map(m => m.families).filter(f => f !== null) as Family[] ?? [];
  return { data: families, error: error?.message ?? null };
}

export async function switchFamily(familyId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({ current_family_id: familyId })
    .eq('id', user.id);

  return { error: error?.message ?? null };
}
