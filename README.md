# 💰 FinTrack - Personal Finance Tracker

> ระบบบันทึกรายรับ-รายจ่ายส่วนบุคคล พร้อมเป้าหมายการออม กราฟวิเคราะห์ และ AI Chat

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![Express](https://img.shields.io/badge/Express-5-blue?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green?logo=supabase)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://frontend-eta-hazel-91.vercel.app](https://frontend-eta-hazel-91.vercel.app) |
| **Backend** | [https://backend-fintrack.vercel.app](https://backend-fintrack.vercel.app) |
| **Database** | Supabase PostgreSQL (ap-south-1) |

---

## 📋 สารบัญ

- [Phase 1: Foundation](#-phase-1-foundation---ระบบพื้นฐาน)
- [Phase 2: Analytics & Data](#-phase-2-analytics--data---กราฟและข้อมูล)
- [Phase 3: AI & Goals](#-phase-3-ai--goals---ai-และเป้าหมายการออม)
- [Phase 4: Production & Deploy](#-phase-4-production--deploy---deploy-ขึ้น-production)
- [Phase 5: Local User System](#-phase-5-local-user-system---ระบบผู้ใช้แยกเครื่อง)
- [Problems & Solutions](#-ปัญหาที่พบและวิธีแก้ไข)
- [Future Features](#-ฟีเจอร์ที่แนะนำสำหรับอนาคต)

---

## 🏗️ Phase 1: Foundation - ระบบพื้นฐาน

### Prompt ที่ใช้
```
"มาเพิ่มฟีเจอร์ บันทึกรายรับรายจ่ายและสามารถตรวจสอบโดยใช้ auto tag"
"Category เพิ่มทางฝั่งหลังบ้านด้วยล็อคไว้เลยว่ามีกี่ประเภท"
```

### สิ่งที่ได้
- ✅ ระบบ CRUD รายรับ-รายจ่าย (สร้าง, อ่าน, อัปเดต, ลบ)
- ✅ Auto-tagging ด้วย Category ที่ล็อคไว้จากหลังบ้าน
- ✅ หมวดหมู่แบบ Fixed: อาหาร, ค่าเดินทาง, ค่าที่พัก, เงินเดือน ฯลฯ
- ✅ Dashboard แสดงยอดรวมรายรับ, รายจ่าย, ยอดคงเหลือ
- ✅ ตารางรายการธุรกรรมพร้อม Tag สี
- ✅ Dark Mode / Light Mode
- ✅ รองรับภาษาไทย / อังกฤษ

### ปัญหาที่พบ
| ปัญหา | สาเหตุ | วิธีแก้ |
|--------|--------|---------|
| Category ไม่ขึ้น | ไม่มีข้อมูล seed ในฐานข้อมูล | สร้าง locked categories ผ่าน service layer อัตโนมัติ |
| TypeScript error ใน Express 5 | Express 5 เปลี่ยน type signature | ใช้ `any` type สำหรับ middleware params |

---

## 📊 Phase 2: Analytics & Data - กราฟและข้อมูล

### Prompt ที่ใช้
```
"ทำกราฟ chart รายรับรายจ่าย barchart และ piechart และระบบ import export ด้วย csv หรือ json"
```

### สิ่งที่ได้
- ✅ **Bar Chart** - แสดงรายรับ vs รายจ่ายรายเดือน
- ✅ **Pie Chart** - แสดงสัดส่วนค่าใช้จ่ายแยกตามหมวดหมู่
- ✅ **Export CSV** - ดาวน์โหลดข้อมูลเป็นไฟล์ CSV
- ✅ **Import CSV** - นำเข้าข้อมูลจากไฟล์ CSV
- ✅ **ปุ่มลบรายการ** - ลบรายการแต่ละรายการจากตาราง (hover เพื่อแสดงถังขยะ)
- ✅ **Settings Dropdown** - รวมปุ่ม Import, Export, Reset ไว้ในเมนูเดียว
- ✅ **Reset All** - ลบรายการทั้งหมดพร้อมยืนยัน

### ปัญหาที่พบ
| ปัญหา | สาเหตุ | วิธีแก้ |
|--------|--------|---------|
| Recharts ไม่ render | SSR conflict กับ Next.js | ใช้ `dynamic import` กับ `ssr: false` |
| CSV import ข้อมูลผิด | Date format ไม่ตรง | Normalize date ก่อน parse |

---

## 🎯 Phase 3: AI & Goals - AI และเป้าหมายการออม

### Prompt ที่ใช้
```
"เรียกใช้ ai ของ gemini มาวิเคราะห์โดยสามารถถามหรือโต้ตอบได้"
"เพิ่มฟีเจอตั้งเป้าหมายการออม และเพิ่มการวิเคราะลงในหน้าหลัก"
"เป้าหมายสามารถ เพิ่ม และกำหนดวันสิ้นสุด และระบุข้อความว่า ต้องเก็บภายใน 5 วัน โดยต้องได้เงิน300บาทต่อวัน"
```

### สิ่งที่ได้
- ✅ **Savings Goals** - สร้างเป้าหมายการออมหลายรายการ
- ✅ **Deadline & Daily Target** - กำหนดวันสิ้นสุด + คำนวณเงินต่อวันอัตโนมัติ
- ✅ **Progress Bar** - แสดงความคืบหน้าแบบ visual
- ✅ **Add Funds** - เติมเงินแยกตามเป้าหมาย
- ✅ **Status Alerts** - ⚠️ เลยกำหนด / 🎉 ถึงเป้าหมาย
- ✅ **AI Chat** (Gemini) - ถาม-ตอบเรื่องการเงินกับ AI
- ✅ **Floating Point Test** - 27 test cases ทดสอบความถูกต้องของการคำนวณทศนิยม

---

## 🚀 Phase 4: Production & Deploy - Deploy ขึ้น Production

### Prompt ที่ใช้
```
"ทำ deploy โดยทำการ database Migration script และ deploy พร้อมฐานข้อมูลจริง"
"ใช้ supabase สร้างเลย"
"deploy frontend"
```

### สิ่งที่ได้
- ✅ **Supabase PostgreSQL** - ฐานข้อมูลจริงบน Cloud
- ✅ **Prisma Migration** - สร้าง Schema บน Database จริง
- ✅ **Frontend on Vercel** - Deploy ระบบหน้าบ้านสำเร็จ
- ✅ **Environment Variables** - แยก config สำหรับ dev/prod

---

## 📱 Phase 5: Local User System - ระบบผู้ใช้แยกเครื่อง

### Prompt ที่ใช้
```
"ช่วยเอาระบบuserมาหน่อยเก็บด้วยเครื่อง จากนั้นแก้readme deploy backendใหม่"
```

### สิ่งที่ได้
- ✅ **Device ID Authentication** - ระบบระบุตัวตนด้วย ID ของเครื่อง (Stored in localStorage)
- ✅ **Automatic User Creation** - สร้าง User ในฐานข้อมูลอัตโนมัติเมื่อมีการเชื่อมต่อจากเครื่องใหม่
- ✅ **Data Isolation** - ข้อมูลรายรับรายจ่ายแยกกันตามเครื่องที่ใช้งาน ไม่ต้องสมัครสมาชิก
- ✅ **authFetch Helper** - ระบบ Frontend ส่ง `X-Device-ID` ไปยัง Backend ทุก Request อัตโนมัติ
- ✅ **deviceAuth Middleware** - ระบบ Backend ตรวจสอบและจัดการ User ตาม Device ID

### ปัญหาที่พบ
| ปัญหา | สาเหตุ | วิธีแก้ |
|--------|--------|---------|
| ข้อมูลปนกัน | เดิมใช้ dummy-user-id ตัวเดียว | เปลี่ยนมาใช้ Device ID จาก Header `X-Device-ID` |
| Request โดนปฏิเสธ | Backend ต้องการ Header แต่ Frontend ไม่ได้ส่ง | สร้าง `authFetch` wrapper เพื่อแนบ Header อัตโนมัติ |

---

## 🔧 วิธีติดตั้งและรัน

### Prerequisites
- Node.js 18+
- npm หรือ yarn

### 1. Clone & Install
```bash
git clone <repo-url>
cd Latapon

# Backend
cd backend
npm install
cp .env.example .env  # แก้ไข DATABASE_URL

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Run Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev     # http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev     # http://localhost:3000
```

---

## 🔮 ฟีเจอร์ที่แนะนำสำหรับอนาคต

1. **🤖 AI Budget Advisor** - วิเคราะห์พฤติกรรมการใช้จ่ายและแนะนำงบประมาณ
2. **📱 Recurring Expenses** - ระบบบันทึกรายจ่ายประจำ (Netflix, ค่าเช่าบ้าน)
3. **🔐 Auth System** - ระบบ Login จริง (Google/GitHub) เพื่อซิงค์ข้อมูลข้ามเครื่อง
4. **📊 Financial Forecast** - พยากรณ์รายรับ-รายจ่ายในอนาคต

---

## 🧪 Test Results

27 Tests Passed (Floating Point Accuracy Verified)
