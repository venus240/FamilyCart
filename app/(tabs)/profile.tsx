import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { useFamily } from '@/contexts/family-context';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { family, refreshFamily } = useFamily();
  const router = useRouter();
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fullName = user?.user_metadata?.full_name || 'สมาชิก';
  const email = user?.email || '';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const loadProfile = async () => {
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshFamily(), loadProfile()]);
    setRefreshing(false);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      const fileName = `${user?.id}/${Date.now()}.jpg`;
      
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        await supabase.storage.from('avatars').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        setAvatarUrl(publicUrl);
        const { error: dbError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user?.id);
        if (dbError) throw dbError;
      } catch (error: any) {
        Alert.alert('ข้อผิดพลาด', 'อัปเดตรูปโปรไฟล์ไม่สำเร็จ: ' + error.message);
      }
    }
  };

  const handleSignOut = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: signOut },
    ]);
  };

  const copyInviteCode = async () => {
    if (family?.invite_code) {
      await Clipboard.setStringAsync(family.invite_code);
      Alert.alert('คัดลอกสำเร็จ', 'คัดลอกรหัสครอบครัวแล้ว ส่งให้สมาชิกคนอื่นได้เลย!');
    }
  };

  return (
    <View className="flex-1 bg-brand-cream">
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff8e9d" />}>
        {/* Header */}
        <View className="bg-white pt-20 pb-10 px-8 rounded-b-[50px] shadow-sm border-b border-brand-brown-100 items-center">
           <TouchableOpacity onPress={handlePickImage} className="relative mb-4">
             <View className="w-32 h-32 rounded-[48px] bg-brand-pink-50 items-center justify-center border-4 border-brand-pink-100 overflow-hidden">
               {avatarUrl ? (
                 <Image source={{ uri: avatarUrl }} className="w-32 h-32" />
               ) : (
                 <Text className="text-4xl font-black text-brand-pink-400">{initials}</Text>
               )}
             </View>
             <View className="absolute bottom-0 right-0 bg-brand-brown-700 w-10 h-10 rounded-2xl items-center justify-center border-4 border-white shadow-sm">
               <Ionicons name="camera" size={18} color="white" />
             </View>
           </TouchableOpacity>
           
           <Text className="text-2xl font-black text-brand-brown-700">{fullName}</Text>
           <Text className="text-brand-brown-300 font-medium mt-1">{email}</Text>
        </View>

        {/* Content */}
        <View className="p-8">
          {family && (
            <View className="bg-white rounded-[32px] p-6 shadow-sm border border-brand-brown-100 mb-6">
              <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 bg-brand-brown-50 rounded-2xl items-center justify-center mr-4 border border-brand-brown-100">
                  <Ionicons name="home" size={22} color="#5d4037" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-brand-brown-300 uppercase tracking-widest">ครอบครัวปัจจุบัน</Text>
                  <Text className="text-xl font-black text-brand-brown-700">{family.name}</Text>
                </View>
              </View>

              <View className="bg-brand-cream rounded-2xl p-5 border border-brand-brown-100 flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-bold text-brand-brown-400 mb-1">รหัสเชิญเข้าร่วม</Text>
                  <Text className="text-2xl font-black text-brand-pink-500 tracking-widest">{family.invite_code}</Text>
                </View>
                <TouchableOpacity onPress={copyInviteCode} className="bg-brand-brown-700 w-12 h-12 rounded-2xl items-center justify-center shadow-lg">
                  <Ionicons name="copy" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Actions */}
          <View className="space-y-4">
            <TouchableOpacity onPress={() => router.push('/(family)/setup')} className="bg-white flex-row items-center p-5 rounded-[24px] border border-brand-brown-100">
               <View className="w-10 h-10 bg-brand-pink-50 rounded-xl items-center justify-center mr-4">
                 <Ionicons name="swap-horizontal" size={20} color="#ff8e9d" />
               </View>
               <Text className="flex-1 text-base font-bold text-brand-brown-700">สลับ / จัดการครอบครัว</Text>
               <Ionicons name="chevron-forward" size={18} color="#d1bebc" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSignOut} activeOpacity={0.8}>
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ 
                  height: 64, 
                  borderRadius: 24, 
                  flexDirection: 'row',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  shadowColor: '#ef4444',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 15,
                  elevation: 10,
                  marginTop: 16
                }}
              >
                <View className="bg-white/20 p-1.5 rounded-xl mr-3">
                  <Ionicons name="log-out" size={20} color="white" />
                </View>
                <Text className="text-white text-lg font-black uppercase tracking-widest">ออกจากระบบ</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="items-center mt-12">
            <Text className="text-xs font-bold text-brand-brown-200 uppercase tracking-widest">FamilyCart v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
