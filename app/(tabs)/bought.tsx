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
import { useFamily } from '@/contexts/family-context';
import { getShoppingItems, getCategories, toggleItemStatus, deleteShoppingItem } from '@/lib/shopping';
import type { ShoppingItem, Category } from '@/types/database';
import { supabase } from '@/lib/supabase';

export default function BoughtScreen() {
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
    const channelName = `shopping_items_bought_${family.id}`;
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
    const { error } = await toggleItemStatus(item.id, item.status);
    if (error) Alert.alert('ข้อผิดพลาด', error);
    else loadData();
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

  const filteredItems = useMemo(() => items.filter(i => i.status === 'bought'), [items]);

  const renderItem = ({ item }: { item: ShoppingItem }) => {
    const category = categories.find(c => c.id === item.category_id);
    return (
      <View className="bg-white p-4 rounded-3xl mb-4 flex-row items-center border border-brand-brown-100 shadow-sm opacity-80">
        <TouchableOpacity 
          onPress={() => handleToggleStatus(item)}
          className="w-10 h-10 rounded-2xl bg-brand-pink-500 items-center justify-center mr-4 shadow-sm"
        >
          <Ionicons name="checkmark-done" size={20} color="white" />
        </TouchableOpacity>
        
        <View className="flex-1">
          <Text className="text-lg font-bold text-brand-brown-300 line-through">{item.name}</Text>
          <View className="flex-row items-center mt-1">
            {category && (
              <View className="flex-row items-center mr-3 bg-brand-brown-50 px-2 py-0.5 rounded-full border border-brand-brown-100">
                <Text style={{ fontSize: 12 }}>{category.icon}</Text>
                <Text className="text-xs text-brand-brown-400 ml-1 font-medium">{category.name}</Text>
              </View>
            )}
            <Text className="text-xs font-bold px-3 py-1 rounded-full bg-brand-brown-100 text-brand-brown-400">
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
            <Text className="text-3xl font-black text-brand-brown-700">ซื้อแล้ว</Text>
            <Text className="text-brand-brown-300 font-medium mt-1">เก่งมาก! ช้อปเรียบร้อย</Text>
          </View>
          <View className="w-12 h-12 bg-brand-pink-500 rounded-2xl items-center justify-center">
             <Ionicons name="bag-check" size={24} color="white" />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadData(); }} tintColor="#ff8e9d" />
        }
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 bg-brand-brown-50 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle-outline" size={48} color="#d1bebc" />
            </View>
            <Text className="text-xl font-bold text-brand-brown-400 text-center">ยังไม่มีรายการที่ซื้อแล้ว</Text>
            <Text className="text-brand-brown-300 mt-2 text-center px-10">
              เมื่อคุณกดซื้อของในหน้าแรก{'\n'}รายการจะย้ายมาแสดงที่นี่
            </Text>
          </View>
        )}
      />
    </View>
  );
}
