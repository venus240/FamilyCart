import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '@/contexts/family-context';
import { getPriceHistory } from '@/lib/price-history';
import type { PriceHistory } from '@/types/database';

export default function HistoryScreen() {
  const { family } = useFamily();
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    if (!family) return;
    try {
      const { data, error } = await getPriceHistory(family.id);
      if (!error) setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [family]);

  const renderItem = ({ item }: { item: PriceHistory }) => (
    <View className="bg-white p-5 rounded-[32px] mb-4 border border-brand-brown-100 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1">
          <Text className="text-lg font-black text-brand-brown-700">{item.item_name}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="storefront" size={14} color="#a38d89" />
            <Text className="text-xs text-brand-brown-400 font-bold ml-1">{item.store_name || 'ไม่ระบุร้านค้า'}</Text>
          </View>
        </View>
        <View className="bg-brand-pink-50 px-4 py-2 rounded-2xl border border-brand-pink-100">
          <Text className="text-xl font-black text-brand-pink-500">฿{item.price.toLocaleString()}</Text>
        </View>
      </View>
      
      <View className="flex-row items-center justify-between pt-3 border-t border-brand-brown-50">
        <View className="flex-row items-center">
           <View className="w-6 h-6 rounded-full bg-brand-brown-100 items-center justify-center mr-2">
             <Ionicons name="calendar" size={12} color="#5d4037" />
           </View>
           <Text className="text-xs font-bold text-brand-brown-400">
             {new Date(item.bought_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: '2-digit' })}
           </Text>
        </View>
        <Ionicons name="chevron-forward-circle" size={20} color="#f2e8e5" />
      </View>
    </View>
  );

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
            <Text className="text-3xl font-black text-brand-brown-700">ประวัติราคา</Text>
            <Text className="text-brand-brown-300 font-medium mt-1">เปรียบเทียบราคาที่เคยซื้อ</Text>
          </View>
          <View className="w-12 h-12 bg-brand-brown-700 rounded-2xl items-center justify-center">
             <Ionicons name="bar-chart" size={24} color="white" />
          </View>
        </View>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadData(); }} tintColor="#ff8e9d" />
        }
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 bg-brand-brown-50 rounded-full items-center justify-center mb-6">
              <Ionicons name="stats-chart-outline" size={48} color="#d1bebc" />
            </View>
            <Text className="text-xl font-bold text-brand-brown-400 text-center">ยังไม่มีประวัติราคา</Text>
            <Text className="text-brand-brown-300 mt-2 text-center px-10">
              ประวัติจะแสดงเมื่อระบุราคาตอนซื้อของ{'\n'}เพื่อให้คุณเปรียบเทียบราคาได้ดีขึ้น
            </Text>
          </View>
        )}
      />
    </View>
  );
}
