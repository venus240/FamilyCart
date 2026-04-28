import { useAuth } from '@/contexts/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (password.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email.trim(), password, fullName.trim());
    setIsSubmitting(false);

    if (error) {
      Alert.alert('สมัครสมาชิกไม่สำเร็จ', error);
    } else {
      Alert.alert('สำเร็จ', 'กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันการสมัคร', [
        { text: 'ตกลง', onPress: () => router.replace('/(auth)/login') }
      ]);
    }
  };

  return (
    <View className="flex-1 bg-brand-cream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-white pt-20 pb-10 px-8 rounded-b-[60px] shadow-sm border-b border-brand-brown-100 items-center">
             <View className="w-20 h-20 bg-brand-pink-50 rounded-[28px] items-center justify-center mb-5 shadow-sm border border-brand-pink-100">
                <Ionicons name="person-add" size={36} color="#ff8e9d" />
             </View>
             <Text className="text-3xl font-black text-brand-brown-700">ร่วมทีมช้อป</Text>
             <Text className="text-brand-brown-300 font-bold mt-2 text-center px-10">สร้างบัญชีของคุณเพื่อจัดการรายการของคนในบ้าน</Text>
          </View>

          {/* Form */}
          <View className="p-8">
            {/* Full Name */}
            <View className="mb-5">
              <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-widest mb-2 ml-1">ชื่อ-นามสกุล</Text>
              <View className="flex-row items-center bg-white rounded-2xl px-5 border border-brand-brown-100 shadow-sm" style={{ height: 60 }}>
                <Ionicons name="person" size={20} color="#a38d89" />
                <TextInput
                  className="flex-1 ml-4 text-base font-bold text-brand-brown-700"
                  placeholder="สมชาย ใจดี"
                  placeholderTextColor="#d1bebc"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-widest mb-2 ml-1">อีเมล</Text>
              <View className="flex-row items-center bg-white rounded-2xl px-5 border border-brand-brown-100 shadow-sm" style={{ height: 60 }}>
                <Ionicons name="mail" size={20} color="#a38d89" />
                <TextInput
                  className="flex-1 ml-4 text-base font-bold text-brand-brown-700"
                  placeholder="name@email.com"
                  placeholderTextColor="#d1bebc"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-8">
              <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-widest mb-2 ml-1">รหัสผ่าน</Text>
              <View className="flex-row items-center bg-white rounded-2xl px-5 border border-brand-brown-100 shadow-sm" style={{ height: 60 }}>
                <Ionicons name="lock-closed" size={20} color="#a38d89" />
                <TextInput
                  className="flex-1 ml-4 text-base font-bold text-brand-brown-700"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  placeholderTextColor="#d1bebc"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#d1bebc" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={isSubmitting} activeOpacity={0.85}>
              <LinearGradient
                colors={isSubmitting ? ['#fda4af', '#fecdd3'] : ['#ff8e9d', '#fb7185']}
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
                    <Text className="text-white text-lg font-black uppercase tracking-[0.1em]">สร้างบัญชีใหม่</Text>
                    <View className="ml-3 bg-white/20 p-1.5 rounded-xl">
                      <Ionicons name="sparkles" size={20} color="white" />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-10 mb-10">
              <Text className="text-brand-brown-300 font-bold">มีบัญชีอยู่แล้ว? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="font-black text-brand-pink-500">เข้าสู่ระบบ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
