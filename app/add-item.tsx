import { useAuth } from '@/contexts/auth-context';
import { useFamily } from '@/contexts/family-context';
import { addShoppingItem, getCategories } from '@/lib/shopping';
import type { Category } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddItemScreen() {
  const router = useRouter();
  const { family } = useFamily();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('ชิ้น');

  useEffect(() => {
    const loadCats = async () => {
      if (family) {
        const { data } = await getCategories(family.id);
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      }
      setIsLoading(false);
    };
    loadCats();
  }, [family]);

  const handleSave = async () => {
    if (!name.trim() || !family || !user) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อสินค้า');
      return;
    }
    setIsSubmitting(true);
    const { error } = await addShoppingItem({
      family_id: family.id,
      category_id: categoryId,
      name: name.trim(),
      quantity: parseFloat(quantity) || 1,
      unit: unit.trim(),
      added_by: user.id,
    });
    setIsSubmitting(false);
    if (error) Alert.alert('ข้อผิดพลาด', error);
    else router.back();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-cream items-center justify-center">
        <ActivityIndicator color="#ff8e9d" />
      </View>
    );
  }

  const isFormValid = name.trim().length > 0;

  return (
    <View className="flex-1 bg-brand-cream">
      {/* Custom Header */}
      <View className="bg-white pt-16 pb-6 px-8 rounded-b-[40px] shadow-sm border-b border-brand-brown-100 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 bg-brand-brown-50 rounded-2xl items-center justify-center border border-brand-brown-100"
        >
          <Ionicons name="close" size={24} color="#5d4037" />
        </TouchableOpacity>

        <Text className="text-xl font-black text-brand-brown-700">เพิ่มรายการ</Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting || !isFormValid}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={!isFormValid || isSubmitting ? ['#fecdd3', '#ffe4e6'] : ['#ff8e9d', '#fb7185']}
            className="px-6 py-3 rounded-2xl shadow-sm"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className={`text-sm font-black uppercase tracking-widest ${!isFormValid ? 'text-brand-pink-300' : 'text-white'}`}>
                บันทึก
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="p-8" showsVerticalScrollIndicator={false}>
          {/* Main Card */}
          <View className="bg-white p-7 rounded-[40px] border border-brand-brown-100 shadow-sm mb-8">
            <View className="mb-6">
              <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-[0.15em] mb-3 ml-1">ชื่อสินค้า</Text>
              <View className="bg-brand-cream rounded-[24px] px-6 border border-brand-brown-100" style={{ height: 64, justifyContent: 'center' }}>
                <TextInput
                  className="text-lg font-bold text-brand-brown-700"
                  placeholder="เช่น นมสด, ไข่ไก่..."
                  placeholderTextColor="#d1bebc"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>
            </View>

            <View className="flex-row">
              <View className="flex-1 mr-3">
                <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-[0.15em] mb-3 ml-1">จำนวน</Text>
                <View className="bg-brand-cream rounded-[24px] px-6 border border-brand-brown-100" style={{ height: 64, justifyContent: 'center' }}>
                  <TextInput
                    className="text-lg font-bold text-brand-brown-700"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-[0.15em] mb-3 ml-1">หน่วย</Text>
                <View className="bg-brand-cream rounded-[24px] px-6 border border-brand-brown-100" style={{ height: 64, justifyContent: 'center' }}>
                  <TextInput
                    className="text-lg font-bold text-brand-brown-700"
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Category Selection */}
          <View className="mb-10">
            <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-[0.15em] mb-5 ml-1">หมวดหมู่สินค้า</Text>
            <View className="flex-row flex-wrap">
              {categories.map(cat => {
                const isSelected = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    activeOpacity={0.7}
                    className={`flex-row items-center px-5 py-3.5 rounded-3xl mr-3 mb-4 border-2 shadow-sm ${isSelected ? 'bg-brand-pink-50 border-brand-pink-500' : 'bg-white border-brand-brown-50'}`}
                  >
                    <View className={`w-9 h-9 rounded-2xl items-center justify-center mr-2.5 ${isSelected ? 'bg-brand-pink-500' : 'bg-brand-brown-50'}`}>
                      <Text className="text-lg">{cat.icon}</Text>
                    </View>
                    <Text className={`text-sm font-black ${isSelected ? 'text-brand-brown-700' : 'text-brand-brown-400'}`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
