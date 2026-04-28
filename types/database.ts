export type Family = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type FamilyMember = {
  id: string;
  family_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profiles?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
};

export type Category = {
  id: string;
  family_id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
};

export type ShoppingItem = {
  id: string;
  family_id: string;
  category_id: string | null;
  name: string;
  quantity: number;
  unit: string;
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly';
  status: 'to_buy' | 'bought';
  notes: string | null;
  added_by: string;
  bought_by: string | null;
  bought_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category;
};

export type PriceHistory = {
  id: string;
  family_id: string;
  shopping_item_id: string | null;
  item_name: string;
  price: number;
  store_name: string | null;
  bought_by: string;
  bought_at: string;
  created_at: string;
};
