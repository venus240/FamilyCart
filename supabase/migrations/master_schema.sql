-- =========================================================
-- FAMILYCART MASTER SCHEMA (รันไฟล์นี้ไฟล์เดียวได้ครบทุกตารางและฟังก์ชัน)
-- =========================================================

-- 1. DROP TABLES & FUNCTIONS (ถ้าเคยมีอยู่แล้วจะถูกเคลียร์เพื่อสร้างใหม่)
DROP TABLE IF EXISTS public.price_history CASCADE;
DROP TABLE IF EXISTS public.shopping_items CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.family_members CASCADE;
DROP TABLE IF EXISTS public.families CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.get_my_family_ids() CASCADE;
DROP FUNCTION IF EXISTS public.create_family(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.join_family(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.switch_family(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.mark_item_bought(UUID, NUMERIC, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ==========================================
-- 2. CREATE TABLES (สร้างตาราง)
-- ==========================================

-- ตารางผู้ใช้งาน
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  current_family_id UUID,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ตารางครอบครัว
CREATE TABLE public.families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 6)),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- เชื่อม Profile ให้รู้จักครอบครัวปัจจุบัน
ALTER TABLE public.profiles ADD CONSTRAINT fk_current_family FOREIGN KEY (current_family_id) REFERENCES public.families(id) ON DELETE SET NULL;

-- ตารางสมาชิกครอบครัว
CREATE TABLE public.family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- ตารางหมวดหมู่สินค้า
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ตารางรายการซื้อของ
CREATE TABLE public.shopping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'ชิ้น',
  status TEXT DEFAULT 'to_buy', -- 'to_buy' หรือ 'bought'
  bought_at TIMESTAMPTZ,
  bought_by UUID REFERENCES public.profiles(id),
  added_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ตารางประวัติราคา
CREATE TABLE public.price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.shopping_items(id) ON DELETE CASCADE,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  store_name TEXT,
  bought_at TIMESTAMPTZ DEFAULT now(),
  bought_by UUID REFERENCES public.profiles(id)
);

-- ตารางการแจ้งเตือน
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 3. FUNCTIONS & TRIGGERS (ฟังก์ชันของฐานข้อมูล)
-- ==========================================

-- ดึง ID ครอบครัวของฉัน (แก้ปัญหา RLS ทับซ้อน)
CREATE OR REPLACE FUNCTION public.get_my_family_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid();
$$;

-- สร้างครอบครัว
CREATE OR REPLACE FUNCTION public.create_family(family_name TEXT)
RETURNS public.families
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_family public.families;
BEGIN
  INSERT INTO public.families (name, created_by) VALUES (family_name, auth.uid()) RETURNING * INTO new_family;
  INSERT INTO public.family_members (family_id, user_id, role) VALUES (new_family.id, auth.uid(), 'owner');
  UPDATE public.profiles SET current_family_id = new_family.id WHERE id = auth.uid();

  -- ใส่หมวดหมู่พื้นฐานให้ครอบครัวใหม่
  INSERT INTO public.categories (family_id, name, icon, sort_order) VALUES 
    (new_family.id, 'ของสด', '🥩', 1),
    (new_family.id, 'ผัก/ผลไม้', '🥬', 2),
    (new_family.id, 'ของใช้ในบ้าน', '🧻', 3),
    (new_family.id, 'เครื่องดื่ม', '🥛', 4),
    (new_family.id, 'อื่นๆ', '📦', 5);

  RETURN new_family;
END;
$$;

-- เข้าร่วมครอบครัวด้วยโค้ด
CREATE OR REPLACE FUNCTION public.join_family(invite_code_input TEXT)
RETURNS public.families
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_family public.families;
BEGIN
  SELECT * INTO target_family FROM public.families WHERE invite_code = invite_code_input LIMIT 1;
  IF target_family IS NULL THEN
    RAISE EXCEPTION 'ไม่พบครอบครัวจากรหัสเชิญนี้';
  END IF;

  INSERT INTO public.family_members (family_id, user_id, role) VALUES (target_family.id, auth.uid(), 'member') ON CONFLICT DO NOTHING;
  UPDATE public.profiles SET current_family_id = target_family.id WHERE id = auth.uid();

  RETURN target_family;
END;
$$;

-- สลับครอบครัวปัจจุบัน
CREATE OR REPLACE FUNCTION public.switch_family(new_family_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.family_members WHERE family_id = new_family_id AND user_id = auth.uid()) THEN
    UPDATE public.profiles SET current_family_id = new_family_id WHERE id = auth.uid();
  ELSE
    RAISE EXCEPTION 'คุณไม่ได้เป็นสมาชิกของครอบครัวนี้';
  END IF;
END;
$$;

-- บันทึกสินค้าว่าซื้อแล้วและเก็บประวัติราคา
CREATE OR REPLACE FUNCTION public.mark_item_bought(
  item_id UUID,
  item_price NUMERIC DEFAULT NULL,
  item_store TEXT DEFAULT NULL
)
RETURNS public.shopping_items
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_item public.shopping_items;
BEGIN
  UPDATE public.shopping_items SET status = 'bought', bought_at = now(), bought_by = auth.uid() WHERE id = item_id RETURNING * INTO target_item;

  IF item_price IS NOT NULL AND item_price > 0 THEN
    INSERT INTO public.price_history (item_id, family_id, item_name, price, store_name, bought_by)
    VALUES (target_item.id, target_item.family_id, target_item.name, item_price, item_store, auth.uid());
  END IF;

  RETURN target_item;
END;
$$;

-- Trigger สมัครสมาชิกใหม่ (ย้ายข้อมูลจาก Auth มาที่ Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS Policies)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Members view family members" ON public.family_members FOR SELECT USING (user_id = auth.uid() OR family_id IN (SELECT public.get_my_family_ids()));
CREATE POLICY "Members view families" ON public.families FOR SELECT USING (id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Members view categories" ON public.categories FOR SELECT USING (family_id IN (SELECT public.get_my_family_ids()));
CREATE POLICY "Members modify categories" ON public.categories FOR ALL USING (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Members view shopping items" ON public.shopping_items FOR SELECT USING (family_id IN (SELECT public.get_my_family_ids()));
CREATE POLICY "Members modify shopping items" ON public.shopping_items FOR ALL USING (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Members view price history" ON public.price_history FOR SELECT USING (family_id IN (SELECT public.get_my_family_ids()));
CREATE POLICY "Members insert price history" ON public.price_history FOR INSERT WITH CHECK (family_id IN (SELECT public.get_my_family_ids()));

-- ==========================================
-- 5. STORAGE BUCKETS (สำหรับเก็บรูปโปรไฟล์)
-- ==========================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar public access" ON storage.objects;
DROP POLICY IF EXISTS "Users insert avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users update avatar" ON storage.objects;

CREATE POLICY "Avatar public access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users insert avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1]);
CREATE POLICY "Users update avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1]);

-- ==========================================
-- 6. ENABLE REALTIME (เปิดระบบดึงข้อมูลแบบ Realtime)
-- ==========================================

-- ยกเลิกของเก่าและสร้างใหม่ (ป้องกัน Error กรณีตารางซ้ำ)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- เพิ่มตารางที่ต้องการให้แอปอัปเดตแบบไม่ต้องดึงหน้าจอ (Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.price_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.family_members;
