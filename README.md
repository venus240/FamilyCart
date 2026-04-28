# 🛒 FamilyCart

**FamilyCart** เป็นแอปพลิเคชันมือถือสำหรับจัดการรายการซื้อของภายในครอบครัว ช่วยให้สมาชิกทุกคนสามารถเพิ่ม แก้ไข และแชร์รายการของที่ต้องซื้อร่วมกันได้แบบ Real-time พร้อมระบบบันทึกประวัติราคาเพื่อช่วยในการวางแผนค่าใช้จ่าย

---

## 📱 Screenshots

<div align="center">
  <img src="https://img1.pic.in.th/images/0cf47959-f732-469b-88d6-306932582bd3.jpg" width="250" />
  <img src="https://img2.pic.in.th/4db809b7-1ab1-41f7-a603-fe561630f102.jpg" width="250" />
  <img src="https://img1.pic.in.th/images/2c73cd7f-1c5b-4685-99a9-d77f2769d504.jpg" width="250" />
</div>

<div align="center">
  <img src="https://img2.pic.in.th/713d60ee-42e4-4c03-9ef6-aa23d8f30748.jpg" width="250" />
  <img src="https://img1.pic.in.th/images/b1286030-068e-48a0-8907-9eac645c7225.jpg" width="250" />
  <img src="https://img1.pic.in.th/images/46c0ff01-3752-4e73-b4c5-738bc3259813.jpg" width="250" />
</div>

<div align="center">
  <img src="https://img2.pic.in.th/46d456b4-9bee-42ac-a1e7-31a5626f479b.jpg" width="250" />
</div>

---

## ✨ คุณสมบัติเด่น (Features)

*   **👨‍👩‍👧‍👦 ระบบครอบครัว (Family Management):** สร้างกลุ่มครอบครัวและเชิญสมาชิกเข้าร่วมเพื่อจัดการรายการของใช้ร่วมกัน
*   **📝 รายการซื้อของ (Shopping List):** เพิ่มรายการที่ต้องซื้อ ระบุจำนวน และสถานะการซื้อแบบ Real-time
*   **💰 ประวัติราคา (Price History):** บันทึกราคาและร้านค้าที่ซื้อ เพื่อนำมาเปรียบเทียบราคาในครั้งถัดไป
*   **📊 สรุปยอดค่าใช้จ่าย (Expenses Summary):** ดูภาพรวมการใช้จ่ายในแต่ละเดือนของครอบครัว
*   **🔒 ระบบยืนยันตัวตน (Authentication):** เข้าใช้งานอย่างปลอดภัยด้วยระบบ Email & Password ผ่าน Supabase Auth

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

*   **Frontend:** [React Native](https://reactnative.dev/) (Expo SDK)
*   **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based Routing)
*   **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
*   **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL + Real-time)
*   **Icons:** Expo Vector Icons (Ionicons)

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ที่ Root directory และระบุค่าดังนี้:
```env
EXPO_PUBLIC_SUPABASE_URL=https://gwuslckfkraokfjprsju.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_DWk6TAjX-q3ziOw7ksPvnw_X9ImVxQO
```

### 3. รันโปรเจค
```bash
npx expo start
```
*ใช้แอป **Expo Go** บน iOS หรือ Android เพื่อทดสอบ*

---

## 📦 การติดตั้งสำหรับ iOS/Android (Build)
โปรเจคนี้รองรับการ Build ผ่าน **EAS (Expo Application Services)**
```bash
eas build --platform ios
eas build --platform android
```

---

Developed with ❤️ by FamilyCart Team
