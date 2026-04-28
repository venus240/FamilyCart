import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '@/contexts/family-context';
import { getPriceHistory } from '@/lib/price-history';
import type { PriceHistory } from '@/types/database';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
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

  // สรุปยอดรวม
  const totalSpending = useMemo(() => {
    return history.reduce((sum, item) => sum + Number(item.price), 0);
  }, [history]);

  // แยกตามเดือนปัจจุบัน
  const monthlySpending = useMemo(() => {
    const now = new Date();
    return history
      .filter(item => {
        const date = new Date(item.bought_at);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, item) => sum + Number(item.price), 0);
  }, [history]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-cream items-center justify-center">
        <ActivityIndicator size="large" color="#ff8e9d" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-cream">
      {/* Header */}
      <View className="bg-white pt-20 pb-10 px-8 rounded-b-[50px] shadow-sm border-b border-brand-brown-100">
        <Text className="text-3xl font-black text-brand-brown-700">สรุปค่าใช้จ่าย</Text>
        <Text className="text-brand-brown-300 font-medium mt-1">ภาพรวมการช้อปปิ้งของครอบครัว</Text>
      </View>

      <ScrollView 
        className="flex-1 p-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadData(); }} tintColor="#ff8e9d" />}
      >
        {/* Total Card */}
        <LinearGradient
          colors={['#ff8e9d', '#fb7185']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 40, padding: 32, marginBottom: 24, shadowColor: '#ff8e9d', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 }}
        >
          <View className="flex-row items-center mb-4">
             <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="wallet" size={20} color="white" />
             </View>
             <Text className="text-white font-bold opacity-80 uppercase tracking-widest">ยอดรวมทั้งหมด</Text>
          </View>
          <Text className="text-5xl font-black text-white">฿{totalSpending.toLocaleString()}</Text>
          <View className="h-px bg-white/20 my-6" />
          <View className="flex-row justify-between">
             <View>
                <Text className="text-white/70 text-xs font-bold uppercase mb-1">เดือนนี้</Text>
                <Text className="text-white text-xl font-black">฿{monthlySpending.toLocaleString()}</Text>
             </View>
             <View className="items-end">
                <Text className="text-white/70 text-xs font-bold uppercase mb-1">จำนวนรายการ</Text>
                <Text className="text-white text-xl font-black">{history.length} รายการ</Text>
             </View>
          </View>
        </LinearGradient>



        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
