import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFamily } from '@/contexts/family-context';

export default function CreateFamilyScreen() {
  const [familyName, setFamilyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createFamily } = useFamily();
  const router = useRouter();

  const handleCreate = async () => {
    if (!familyName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาตั้งชื่อครอบครัว');
      return;
    }

    setIsSubmitting(true);
    const { error } = await createFamily(familyName.trim());
    setIsSubmitting(false);

    if (error) {
      Alert.alert('สร้างไม่สำเร็จ', error);
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  return (
    <View className="flex-1 bg-brand-cream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-white pt-20 pb-12 px-8 rounded-b-[60px] shadow-sm border-b border-brand-brown-100 items-center">
             <TouchableOpacity onPress={() => router.back()} className="absolute top-16 left-8 p-2 bg-brand-brown-50 rounded-xl">
                <Ionicons name="arrow-back" size={24} color="#5d4037" />
             </TouchableOpacity>
             
             <View className="w-24 h-24 bg-brand-pink-50 rounded-[32px] items-center justify-center mb-6 shadow-sm border border-brand-pink-100">
                <Ionicons name="add-circle" size={48} color="#ff8e9d" />
             </View>
             <Text className="text-3xl font-black text-brand-brown-700">สร้างครอบครัว</Text>
             <Text className="text-brand-brown-300 font-bold mt-2 text-center px-10">ตั้งชื่อบ้านของคุณเพื่อเริ่มจดรายการของกันและกัน</Text>
          </View>

          {/* Form */}
          <View className="p-8">
            <View className="mb-8">
              <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-widest mb-2 ml-1">ชื่อครอบครัว / ชื่อบ้าน</Text>
              <View className="flex-row items-center bg-white rounded-2xl px-5 border border-brand-brown-100 shadow-sm" style={{ height: 64 }}>
                <Ionicons name="home" size={22} color="#a38d89" />
                <TextInput
                  className="flex-1 ml-4 text-lg font-bold text-brand-brown-700"
                  placeholder="เช่น บ้านแสนสุข, ครอบครัวตัว ต."
                  placeholderTextColor="#d1bebc"
                  value={familyName}
                  onChangeText={setFamilyName}
                  editable={!isSubmitting}
                  autoFocus
                />
              </View>
            </View>

            <View className="bg-brand-pink-50 p-6 rounded-[32px] border border-brand-pink-100 mb-8 flex-row items-center">
               <Text className="text-3xl mr-4">🏠</Text>
               <Text className="flex-1 text-sm font-bold text-brand-pink-600">หลังจากสร้างเสร็จ คุณจะได้รับรหัสเชิญสำหรับส่งให้สมาชิกคนอื่นเข้าร่วมบ้านครับ</Text>
            </View>

            <TouchableOpacity onPress={handleCreate} disabled={isSubmitting || !familyName.trim()} activeOpacity={0.85}>
              <LinearGradient
                colors={isSubmitting || !familyName.trim() ? ['#fda4af', '#fecdd3'] : ['#ff8e9d', '#fb7185']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ 
                  height: 64, 
                  borderRadius: 24, 
                  flexDirection: 'row',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  shadowColor: '#ff8e9d',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.35,
                  shadowRadius: 15,
                  elevation: 10
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white text-lg font-black uppercase tracking-[0.1em]">สร้างครอบครัวเลย</Text>
                    <View className="ml-3 bg-white/20 p-1.5 rounded-xl">
                      <Ionicons name="home" size={20} color="white" />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
