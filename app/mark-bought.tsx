import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { markItemBoughtWithPrice } from '@/lib/shopping';
import { Ionicons } from '@expo/vector-icons';

export default function MarkBoughtScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!price.trim() || isNaN(parseFloat(price))) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกราคาที่ถูกต้อง');
      return;
    }
    setIsSubmitting(true);
    const { error } = await markItemBoughtWithPrice(id as string, parseFloat(price), store.trim() || 'ไม่ระบุร้านค้า');
    setIsSubmitting(false);
    if (error) Alert.alert('ข้อผิดพลาด', error);
    else router.back();
  };

  return (
    <View className="flex-1 bg-brand-cream">
      <View className="flex-row items-center justify-between px-8 pt-16 pb-6 bg-white rounded-b-[40px] shadow-sm border-b border-brand-brown-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-brand-brown-50 rounded-xl">
          <Ionicons name="close" size={24} color="#5d4037" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-brand-brown-700">ระบุราคาที่ซื้อ</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting || !price.trim()} className={`px-5 py-2 rounded-2xl ${price.trim() ? 'bg-brand-pink-500' : 'bg-brand-pink-100'}`}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-sm font-black text-white uppercase tracking-widest">บันทึก</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 p-8">
        <View className="bg-white p-8 rounded-[40px] shadow-sm items-center mb-8 border border-brand-brown-100">
          <View className="w-20 h-20 bg-brand-pink-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="card" size={36} color="#ff8e9d" />
          </View>
          <Text className="text-xs font-black text-brand-brown-300 uppercase tracking-widest mb-1">คุณกำลังซื้อ</Text>
          <Text className="text-3xl font-black text-brand-brown-700 text-center">{name}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-widest mb-3 ml-1">ราคาที่ซื้อจริง (บาท)</Text>
          <View className="bg-white rounded-3xl px-6 border border-brand-pink-200 shadow-sm flex-row items-center" style={{ height: 80 }}>
             <Text className="text-3xl font-black text-brand-pink-500 mr-2">฿</Text>
             <TextInput
              className="flex-1 text-4xl font-black text-brand-brown-700"
              placeholder="0.00"
              placeholderTextColor="#fecdd3"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
        </View>

        <View>
          <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-widest mb-3 ml-1">ซื้อจากร้านไหน? (ไม่บังคับ)</Text>
          <View className="bg-white rounded-2xl px-6 border border-brand-brown-100 shadow-sm flex-row items-center" style={{ height: 60 }}>
             <Ionicons name="storefront" size={20} color="#a38d89" />
             <TextInput
              className="flex-1 ml-4 text-lg font-bold text-brand-brown-700"
              placeholder="เช่น 7-11, โลตัส, ตลาด..."
              placeholderTextColor="#d1bebc"
              value={store}
              onChangeText={setStore}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
