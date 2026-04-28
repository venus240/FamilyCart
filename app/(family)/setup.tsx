import React, { useState, useEffect } from 'react';
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
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFamily } from '@/contexts/family-context';
import { useAuth } from '@/contexts/auth-context';
import { getUserFamilies, switchFamily } from '@/lib/families';
import type { Family } from '@/types/database';

export default function FamilySetupScreen() {
  const [mode, setMode] = useState<'choose' | 'join'>('choose');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userFamilies, setUserFamilies] = useState<Family[]>([]);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { joinFamily, refreshFamily } = useFamily();
  const { signOut } = useAuth();
  const router = useRouter();

  const fetchFamilies = async () => {
    const { data } = await getUserFamilies();
    setUserFamilies(data);
    setIsLoadingFamilies(false);
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFamilies();
    setRefreshing(false);
  };

  const handleJoin = async () => {
    if (inviteCode.trim().length < 6) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสครอบครัว 6 หลัก');
      return;
    }
    setIsSubmitting(true);
    const { error } = await joinFamily(inviteCode.trim());
    setIsSubmitting(false);
    if (error) Alert.alert('เข้าร่วมไม่สำเร็จ', error);
    else router.replace('/(tabs)' as any);
  };

  const handleSwitchFamily = async (familyId: string) => {
    setIsSubmitting(true);
    const { error } = await switchFamily(familyId);
    if (!error) {
      await refreshFamily();
      router.replace('/(tabs)' as any);
    } else {
      Alert.alert('สลับครอบครัวไม่สำเร็จ', error);
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-brand-cream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff8e9d" />}>
          
          <View className="bg-white pt-24 pb-12 px-8 rounded-b-[50px] shadow-sm border-b border-brand-brown-100 items-center">
             <TouchableOpacity onPress={signOut} className="absolute top-16 right-8 p-2 bg-brand-brown-50 rounded-xl">
                <Ionicons name="log-out" size={24} color="#5d4037" />
             </TouchableOpacity>

             <View className="w-24 h-24 bg-brand-pink-50 rounded-[32px] items-center justify-center mb-6 shadow-sm border border-brand-pink-100">
                <Ionicons name="people" size={48} color="#ff8e9d" />
             </View>
             <Text className="text-4xl font-black text-brand-brown-700">ครอบครัว</Text>
             <Text className="text-brand-brown-300 font-bold mt-2 text-center">เข้าร่วมกลุ่มเพื่อเริ่มแบ่งปันรายการ</Text>
          </View>

          <View className="p-8">
            {mode === 'choose' ? (
              <>
                <TouchableOpacity onPress={() => router.push('/(family)/create')} className="bg-white border-2 border-brand-pink-100 rounded-[32px] p-6 mb-4 shadow-sm flex-row items-center">
                  <View className="w-14 h-14 bg-brand-pink-50 rounded-2xl items-center justify-center mr-5">
                    <Ionicons name="add-circle" size={32} color="#ff8e9d" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-black text-brand-brown-700">สร้างครอบครัวใหม่</Text>
                    <Text className="text-brand-brown-300 font-medium">เริ่มต้นกลุ่มของคุณเอง</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMode('join')} className="bg-white border-2 border-brand-brown-100 rounded-[32px] p-6 mb-8 shadow-sm flex-row items-center">
                  <View className="w-14 h-14 bg-brand-brown-50 rounded-2xl items-center justify-center mr-5">
                    <Ionicons name="enter" size={32} color="#5d4037" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-black text-brand-brown-700">เข้าร่วมครอบครัว</Text>
                    <Text className="text-brand-brown-300 font-medium">มีรหัสเชิญแล้ว? กดที่นี่</Text>
                  </View>
                </TouchableOpacity>

                {!isLoadingFamilies && userFamilies.length > 0 && (
                  <View className="mt-4">
                    <Text className="text-xs font-black text-brand-brown-300 uppercase tracking-[0.2em] mb-4 ml-1">ครอบครัวที่เคยเข้าร่วม</Text>
                    {userFamilies.map((fam) => (
                      <TouchableOpacity key={fam.id} onPress={() => handleSwitchFamily(fam.id)} disabled={isSubmitting} className="bg-white rounded-[24px] p-5 mb-4 flex-row items-center border border-brand-brown-100 shadow-sm">
                        <View className="w-12 h-12 rounded-2xl bg-brand-cream items-center justify-center mr-4">
                          <Ionicons name="home" size={20} color="#a38d89" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-bold text-brand-brown-700">{fam.name}</Text>
                          <Text className="text-xs font-bold text-brand-pink-400">Code: {fam.invite_code}</Text>
                        </View>
                        <Ionicons name="swap-horizontal" size={20} color="#ff8e9d" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View>
                <TouchableOpacity onPress={() => setMode('choose')} className="flex-row items-center mb-6">
                  <Ionicons name="arrow-back" size={20} color="#ff8e9d" />
                  <Text className="text-brand-pink-500 font-black ml-2">กลับ</Text>
                </TouchableOpacity>

                <Text className="text-2xl font-black text-brand-brown-700 mb-2">กรอกรหัสเชิญ</Text>
                <Text className="text-brand-brown-300 font-medium mb-8">ใช้รหัส 6 หลักจากสมาชิกในครอบครัว</Text>

                <TextInput
                  className="bg-white text-center text-4xl font-black text-brand-brown-700 border-2 border-brand-pink-200 rounded-3xl mb-8"
                  style={{ height: 100, letterSpacing: 10 }}
                  placeholder="ABC123"
                  placeholderTextColor="#fecdd3"
                  value={inviteCode}
                  onChangeText={(t) => setInviteCode(t.toUpperCase().slice(0, 6))}
                  autoCapitalize="characters"
                  maxLength={6}
                />

                <TouchableOpacity onPress={handleJoin} disabled={isSubmitting || inviteCode.length < 6} activeOpacity={0.85}>
                  <LinearGradient
                    colors={isSubmitting || inviteCode.length < 6 ? ['#fda4af', '#fecdd3'] : ['#ff8e9d', '#fb7185']}
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
                        <Text className="text-white text-lg font-black uppercase tracking-[0.1em]">เข้าร่วมครอบครัว</Text>
                        <View className="ml-3 bg-white/20 p-1.5 rounded-xl">
                          <Ionicons name="checkmark-circle" size={20} color="white" />
                        </View>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
