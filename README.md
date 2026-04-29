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
| **Backend** | localhost:5000 (local development) |
| **Database** | Supabase PostgreSQL (ap-south-1) |

---

## 📋 สารบัญ

- [Phase 1: Foundation](#-phase-1-foundation---ระบบพื้นฐาน)
- [Phase 2: Analytics & Data](#-phase-2-analytics--data---กราฟและข้อมูล)
- [Phase 3: AI & Goals](#-phase-3-ai--goals---ai-และเป้าหมายการออม)
- [Phase 4: Production & Deploy](#-phase-4-production--deploy---deploy-ขึ้น-production)
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

### Tech Stack ที่ใช้
- **Frontend:** Next.js 16 + TailwindCSS 4 + Lucide Icons
- **Backend:** Express 5 + TypeScript
- **Database:** SQLite (development) via Prisma ORM
- **UI:** Glassmorphism design, gradient cards, responsive layout

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

### Libraries ที่เพิ่ม
- `recharts` - สำหรับ Bar/Pie Chart
- `papaparse` - สำหรับ CSV parse/generate

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

### ปัญหาที่พบ
| ปัญหา | สาเหตุ | วิธีแก้ |
|--------|--------|---------|
| AI Insights ไม่ทำงาน | Gemini API key หมดอายุ/ไม่มี | เปลี่ยนมาใช้สูตรคำนวณแทน AI |
| `prisma.goal` lint error | IDE cache ไม่อัปเดตหลัง generate | เป็น false positive — runtime ทำงานปกติ |
| เป้าหมายไม่ขึ้นหน้าเว็บ | API endpoint ผิด path | แก้ route + เพิ่ม Goal model ใน schema |
| 0.1 + 0.2 ≠ 0.3 | IEEE 754 floating point | ใช้ `toBeCloseTo()` + `Math.round()` helper |
| 1.005 rounds เป็น 1.00 | IEEE 754 edge case | ใช้ `Number.EPSILON` correction |

### Database Schema ที่เพิ่ม
```sql
CREATE TABLE "Goal" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION DEFAULT 0,
    "deadline" TIMESTAMP,
    "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE
);
```

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
- ✅ **Prisma Migration** - `20260429081905_init` สร้าง 4 ตาราง
- ✅ **Frontend on Vercel** - Deploy สำเร็จ
- ✅ **Environment Variables** - แยก config สำหรับ dev/prod
- ✅ **Jest Test Suite** - 27 floating point tests ผ่านทั้งหมด

### ปัญหาที่พบ
| ปัญหา | สาเหตุ | วิธีแก้ |
|--------|--------|---------|
| Prisma 7 ไม่รับ `url` ใน schema | Breaking change ใน v7 | ย้าย url ไป `prisma.config.ts` |
| `PrismaClient` ต้องการ adapter | Prisma 7 ลบ Rust engine | ติดตั้ง `@prisma/adapter-pg` + `pg` |
| `datasourceUrl` ไม่รู้จัก | Prisma 7 ลบ property นี้ | ใช้ `adapter` pattern แทน |
| Migration "Tenant not found" | Hostname region ผิด | เปลี่ยนจาก `ap-southeast-1` → `ap-south-1` |
| Migration "provider mismatch" | มี migration เก่า (SQLite) | ลบ folder migrations แล้วสร้างใหม่ |
| Auth failed ตอน API call | `dotenv.config()` เรียกหลัง import | **ย้าย `dotenv.config()` ขึ้นบรรทัดแรกสุดก่อน import อื่น** |
| PgBouncer ไม่รองรับ DDL | Transaction pooler ใช้ migrate ไม่ได้ | ใช้ Session Pooler (port 5432) สำหรับ migrate |

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

### 4. Run Tests
```bash
cd backend
npm test        # 27 tests ผ่านทั้งหมด
```

---

## 📁 โครงสร้างโปรเจกต์

```
Latapon/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (PostgreSQL)
│   │   └── migrations/            # Migration files
│   ├── src/
│   │   ├── index.ts               # Express server entry point
│   │   ├── lib/prisma.ts          # Prisma client (PrismaPg adapter)
│   │   ├── routes/
│   │   │   ├── transaction.route.ts
│   │   │   ├── goal.route.ts
│   │   │   ├── user.route.ts
│   │   │   └── ai.route.ts
│   │   ├── services/
│   │   │   └── transaction.service.ts
│   │   └── __tests__/
│   │       └── floating-point.test.ts  # 27 test cases
│   ├── prisma.config.ts
│   ├── jest.config.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Main dashboard (950+ lines)
│   │   │   └── layout.tsx
│   │   └── context/
│   │       └── LanguageContext.tsx
│   └── package.json
│
└── README.md                      # This file
```

---

## 🔮 ฟีเจอร์ที่แนะนำสำหรับอนาคต

### 1. 🤖 AI วิเคราะห์การเงินแบบเจาะลึก

| ฟีเจอร์ | รายละเอียด | เทคโนโลยี |
|---------|-----------|-----------|
| **AI Budget Advisor** | วิเคราะห์พฤติกรรมการใช้จ่ายและแนะนำงบประมาณรายเดือน | Gemini Pro / GPT-4o |
| **Smart Categorization** | จำแนกหมวดหมู่อัตโนมัติจากข้อความ description | NLP + Few-shot learning |
| **Spending Anomaly Detection** | แจ้งเตือนเมื่อค่าใช้จ่ายผิดปกติ (เช่น สูงกว่าค่าเฉลี่ย 2x) | Statistical Analysis |
| **Financial Forecast** | พยากรณ์รายรับ-รายจ่าย 3-6 เดือนข้างหน้า | Time Series (Prophet/ARIMA) |
| **Receipt OCR** | ถ่ายรูปใบเสร็จ แล้วบันทึกอัตโนมัติ | Google Vision API / Tesseract |

### 2. 📱 ค่าใช้จ่ายประจำ (Recurring Expenses)

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| **รายจ่ายรายเดือน** | ค่าเน็ต, ค่าโทรศัพท์, ค่าเช่า — บันทึกอัตโนมัติทุกเดือน |
| **Subscription Tracker** | ติดตาม Netflix, Spotify, iCloud — รวมยอดรายเดือน |
| **Bill Reminder** | แจ้งเตือนก่อนถึงกำหนดชำระ 3 วัน |
| **ค่าใช้จ่ายต่อวัน** | คำนวณว่าวันนี้ใช้ไปเท่าไหร่แล้ว เทียบกับงบ |

### 3. 🔐 ระบบ Authentication จริง

| ฟีเจอร์ | รายละเอียด | เทคโนโลยี |
|---------|-----------|-----------|
| **Social Login** | ล็อกอินด้วย Google / GitHub | NextAuth.js / Supabase Auth |
| **Multi-user** | แต่ละคนเห็นเฉพาะข้อมูลตัวเอง | Row Level Security (RLS) |
| **Family Shared** | แชร์ข้อมูลการเงินในครอบครัว | Shared workspace model |

### 4. 💸 ประมาณการค่าใช้จ่ายในการดำเนินงาน (Monthly Costs)

สำหรับการ deploy จริงในระดับ production:

| รายการ | Free Tier | Pro Plan | หมายเหตุ |
|--------|-----------|----------|----------|
| **Supabase** (Database) | ฟรี (500MB, 50K rows) | ~$25/เดือน | ถ้าข้อมูลเกิน 500MB |
| **Vercel** (Frontend) | ฟรี (100GB bandwidth) | ~$20/เดือน | ถ้าเกิน 100GB/เดือน |
| **Gemini API** (AI Chat) | ฟรี (15 RPM) | ~$0.35/1M tokens | ใช้ Gemini Flash ถูกสุด |
| **Google Vision** (OCR) | 1,000 ครั้ง/เดือน ฟรี | ~$1.50/1,000 ครั้ง | สำหรับ Receipt OCR |
| **Domain** (.com) | — | ~$12/ปี | Optional |
| **SendGrid** (Email) | 100 emails/วัน ฟรี | ~$20/เดือน | สำหรับ Bill Reminder |

#### 💡 สรุปค่าใช้จ่ายจริง:
- **ใช้งานส่วนตัว / Demo:** **฿0/เดือน** (Free Tier ทุกอย่าง)
- **ใช้งานจริง ผู้ใช้ < 100 คน:** **~฿900/เดือน** ($25 Supabase Pro)
- **ใช้งานเชิงพาณิชย์ ผู้ใช้ 1,000+ คน:** **~฿2,500-5,000/เดือน**

---

## 🧪 Test Results

```
PASS src/__tests__/floating-point.test.ts
  Floating Point Accuracy - Currency Calculations
    Basic Decimal Addition
      ✅ 0.1 + 0.2 should be close to 0.3
      ✅ Summing small amounts should stay accurate
      ✅ Repeated addition of 0.01 (100 times) should equal 1.00
    Net Balance Calculations
      ✅ Income minus Expense should produce correct balance
      ✅ Balance should be 0 when income equals expense
      ✅ Large number of small transactions should sum correctly
    Savings Goal - Per Day Calculation
      ✅ should calculate correct daily savings amount
      ✅ should handle edge case: 1 day left
      ✅ should handle edge case: 0 days left (deadline passed)
      ✅ should calculate progress percentage accurately
      ✅ progress should cap at 100% when over-funded
    Currency Formatting
      ✅ should format standard amounts correctly
      ✅ should format zero correctly
      ✅ should format very small amounts
      ✅ should format large amounts
      ✅ floating point display: 0.1 + 0.2 should display as 0.30
    CSV/JSON Import - parseFloat Accuracy
      ✅ parseFloat should handle typical currency strings
      ✅ parseFloat edge cases
      ✅ Sum of parsed imported data should be accurate
    Dashboard Summary - Aggregation Accuracy
      ✅ groupBy aggregation simulation
      ✅ Empty transactions should return zero
    Stress Test - Large Volume
      ✅ 10,000 random transactions should maintain accuracy
      ✅ Alternating add/subtract should return to zero
    Rounding Helper - toFixed2
      ✅ should fix 0.1 + 0.2 issue
      ✅ should round 1.005 — known IEEE 754 edge case
      ✅ should handle negative numbers
      ✅ applying toFixed2 to a sum of 100x ฿0.01 should equal ฿1.00

Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
```

---

## 👨‍💻 Developer

- **Project:** Latapon - Personal Finance Tracker
- **Stack:** Next.js 16 + Express 5 + Prisma 7 + Supabase + Vercel
- **AI Pair Programming:** Google Gemini (Antigravity)

---

## 🚀 Upcoming Features (Roadmap)

เรากำลังพัฒนาฟีเจอร์ใหม่ๆ เพื่อยกระดับประสบการณ์การจัดการการเงินให้มีประสิทธิภาพและปลอดภัยยิ่งขึ้น:

### 🔐 1. User Authentication & Security
- **Secure Login:** พัฒนาระบบลงชื่อเข้าใช้งานด้วย **NextAuth.js** รองรับการ Login ผ่าน Google และ Email/Password
- **Data Privacy:** แยกฐานข้อมูลรายบุคคล เพื่อให้มั่นใจว่าข้อมูลทางการเงินของคุณจะเป็นความลับและเข้าถึงได้เฉพาะเจ้าของบัญชีเท่านั้น
- **Multi-device Sync:** ความสามารถในการซิงค์ข้อมูลข้ามอุปกรณ์ผ่านระบบ Cloud

### 🤖 2. AI-Powered Financial Intelligence (Domain Specific)
- **Smart Transaction Categorization:** ใช้ AI (Gemini API) วิเคราะห์และจัดหมวดหมู่รายรับ-รายจ่ายโดยอัตโนมัติจากชื่อร้านค้าหรือคำอธิบายสั้นๆ
- **Predictive Budgeting:** ระบบพยากรณ์การใช้จ่ายในเดือนถัดไป โดยวิเคราะห์จากพฤติกรรมในอดีต (Spending Pattern Recognition)
- **Personalized Financial Advisor:** AI แนะนำแนวทางการออมเงินที่ปรับแต่งตามเป้าหมายของผู้ใช้ (เช่น แนะนำการลดค่าใช้จ่ายฟุ่มเฟือยเพื่อเก็บเงินซื้อบ้าน)
- **Anomaly Detection:** ระบบแจ้งเตือนอัตโนมัติเมื่อพบการใช้จ่ายที่ผิดปกติ หรือมียอดชำระซ้ำซ้อน
