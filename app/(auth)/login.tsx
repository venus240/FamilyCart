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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setIsSubmitting(false);
    if (error) Alert.alert('เข้าสู่ระบบไม่สำเร็จ', error);
  };

  return (
    <View className="flex-1 bg-brand-cream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-white pt-24 pb-12 px-8 rounded-b-[60px] shadow-sm border-b border-brand-brown-100 items-center">
            <View className="w-24 h-24 bg-brand-pink-50 rounded-[32px] items-center justify-center mb-6 shadow-sm border border-brand-pink-100">
              <Ionicons name="basket" size={48} color="#ff8e9d" />
            </View>
            <Text className="text-4xl font-black text-brand-brown-700">FamilyCart</Text>
            <Text className="text-brand-brown-300 font-bold mt-2">จัดการรายการซื้อของให้คนในบ้าน</Text>
          </View>

          {/* Form */}
          <View className="p-8">
            <Text className="text-2xl font-black text-brand-brown-700 mb-2">ยินดีต้อนรับกลับ!</Text>
            <Text className="text-brand-brown-300 font-medium mb-8">ลงชื่อเข้าใช้งานเพื่อเริ่มช้อปปิ้ง</Text>

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
            <View className="mb-4">
              <Text className="text-xs font-black text-brand-brown-400 uppercase tracking-widest mb-2 ml-1">รหัสผ่าน</Text>
              <View className="flex-row items-center bg-white rounded-2xl px-5 border border-brand-brown-100 shadow-sm" style={{ height: 60 }}>
                <Ionicons name="lock-closed" size={20} color="#a38d89" />
                <TextInput
                  className="flex-1 ml-4 text-base font-bold text-brand-brown-700"
                  placeholder="••••••••"
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



            <TouchableOpacity onPress={handleLogin} disabled={isSubmitting} activeOpacity={0.85}>
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
                    <Text className="text-white text-lg font-black uppercase tracking-[0.1em]">เข้าสู่ระบบ</Text>
                    <View className="ml-3 bg-white/20 p-1.5 rounded-xl">
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-10 mb-6">
              <Text className="text-brand-brown-300 font-bold">ยังไม่มีบัญชี? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="font-black text-brand-pink-500">สมัครสมาชิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
