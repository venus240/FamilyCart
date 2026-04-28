import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFamily } from '@/contexts/family-context';
import { getShoppingItems, getCategories, toggleItemStatus, deleteShoppingItem } from '@/lib/shopping';
import type { ShoppingItem, Category } from '@/types/database';
import { supabase } from '@/lib/supabase';

export default function ShoppingListScreen() {
  const { family } = useFamily();
  const router = useRouter();
  
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    if (!family) return;
    try {
      const [itemsRes, catsRes] = await Promise.all([
        getShoppingItems(family.id),
        getCategories(family.id)
      ]);
      if (!itemsRes.error) setItems(itemsRes.data);
      if (!catsRes.error) setCategories(catsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    if (!family) return;
    const channelName = `shopping_items_tobuy_${family.id}`;
    supabase.removeChannel(supabase.channel(channelName));
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items', filter: `family_id=eq.${family.id}` }, () => {
        loadData();
      });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [family]);

  const handleToggleStatus = async (item: ShoppingItem) => {
    if (item.status === 'to_buy') {
      router.push({ pathname: '/mark-bought', params: { id: item.id, name: item.name } });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('ลบรายการ', 'คุณต้องการลบรายการนี้ใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: async () => {
        const { error } = await deleteShoppingItem(id);
        if (error) Alert.alert('ข้อผิดพลาด', error);
        else loadData();
      }}
    ]);
  };

  const filteredItems = useMemo(() => items.filter(i => i.status === 'to_buy'), [items]);

  const renderItem = ({ item }: { item: ShoppingItem }) => {
    const category = categories.find(c => c.id === item.category_id);
    return (
      <View className="bg-white p-4 rounded-3xl mb-4 flex-row items-center border border-brand-brown-100 shadow-sm">
        <TouchableOpacity 
          onPress={() => handleToggleStatus(item)}
          className="w-10 h-10 rounded-2xl border-2 border-brand-pink-200 items-center justify-center mr-4 bg-brand-pink-50"
        >
          <Ionicons name="cart-outline" size={20} color="#ff8e9d" />
        </TouchableOpacity>
        
        <View className="flex-1">
          <Text className="text-lg font-bold text-brand-brown-700">{item.name}</Text>
          <View className="flex-row items-center mt-1">
            {category && (
              <View className="flex-row items-center mr-3 bg-brand-brown-50 px-2 py-0.5 rounded-full border border-brand-brown-100">
                <Text style={{ fontSize: 12 }}>{category.icon}</Text>
                <Text className="text-xs text-brand-brown-400 ml-1 font-medium">{category.name}</Text>
              </View>
            )}
            <Text className="text-xs font-bold px-3 py-1 rounded-full bg-brand-pink-100 text-brand-pink-600">
              {item.quantity} {item.unit}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 bg-brand-brown-50 rounded-xl">
          <Ionicons name="trash-outline" size={20} color="#a38d89" />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-cream items-center justify-center">
        <ActivityIndicator size="large" color="#ff8e9d" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-cream">
      <View className="px-8 pt-20 pb-6 bg-white rounded-b-[40px] shadow-sm border-b border-brand-brown-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-black text-brand-brown-700">ต้องซื้อ</Text>
            <Text className="text-brand-brown-300 font-medium mt-1">เตรียมตัวช้อปปิ้งกัน!</Text>
          </View>
          <View className="w-12 h-12 bg-brand-pink-100 rounded-2xl items-center justify-center">
             <Ionicons name="receipt" size={24} color="#ff8e9d" />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadData(); }} tintColor="#ff8e9d" />
        }
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 bg-brand-pink-50 rounded-full items-center justify-center mb-6">
              <Ionicons name="basket-outline" size={48} color="#fda4af" />
            </View>
            <Text className="text-xl font-bold text-brand-brown-400 text-center">ยังไม่มีรายการที่ต้องซื้อ</Text>
            <Text className="text-brand-brown-300 mt-2 text-center px-10">
              กดปุ่มด้านล่างเพื่อเพิ่มรายการ{'\n'}ของเข้าตะกร้าครอบครัว
            </Text>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={() => router.push('/add-item')}
        className="absolute bottom-10 right-8 shadow-2xl"
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#ff8e9d', '#fb7185']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            width: 72, 
            height: 72, 
            borderRadius: 28, 
            alignItems: 'center', 
            justifyContent: 'center',
            shadowColor: '#ff8e9d',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 12
          }}
        >
          <Ionicons name="add" size={40} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
