# Personal Finance Tracker - Backend

นี่คือโปรเจกต์ Backend สำหรับแอปพลิเคชัน Personal Finance Tracker ที่ถูกพัฒนาแยกส่วนออกมาจาก Frontend อย่างชัดเจน (Physical Separation) เพื่อให้รองรับการทำงานระดับ Production และง่ายต่อการ Scale ในอนาคต

## 📌 สรุปเหตุการณ์และ Prompt การพัฒนาระบบ Backend

บันทึกนี้ถูกสร้างขึ้นเพื่อสรุปสิ่งที่เกิดขึ้นตั้งแต่เริ่มต้นโปรเจกต์ ปัญหาที่พบ และวิธีแก้ไข เพื่อเป็น Document อ้างอิงในอนาคต

### 1. ความต้องการเริ่มต้น (Initial Prompts)
> **User Prompt 1:** "Act as an expert Next.js and React developer. I want to build a Personal Finance Tracker application. We will use Next.js (App Router), TailwindCSS, Prisma ORM, and SQLite for now. Please provide the terminal commands to initialize this project. Then, define a clean, scalable folder architecture that strictly separates frontend components from backend logic..."

> **User Prompt 2:** "งาน production ช่วยแยก Frontend backend ให้ชัดเจนได้ไหม"

> **User Prompt 3:** "เริ่มต้นเลยตามนี้
User (for future authentication)
Transaction (amount, type [income/expense], date, description)
Category/Tag (to support automated tagging and detailed reporting)"

> **User Prompt 4:** "Based on the Prisma schema, let's implement the backend logic. I want to use Next.js Server Actions (or API routes if you think it's better for separation). Please write the code to handle the core functionality: Fetch all transactions... Create a new transaction... Get a summary... Put this logic in a dedicated backend service file..."

### 2. โครงสร้างที่ได้ (Architecture)
เราได้ทำการแยกโฟลเดอร์เป็น 2 ส่วนหลักคือ `frontend` (Next.js) และ `backend` (Express.js) โดยฝั่ง Backend มีโครงสร้างดังนี้:
- `src/lib/prisma.ts` - จัดการเรื่อง Connection ของ Database
- `src/services/` - จัดการลอจิกในการเขียน/อ่าน Database (Business Logic)
- `src/routes/` - จัดการ HTTP API Endpoints (Express Router)
- `src/index.ts` - จุดเริ่มต้น (Entry Point) ของเซิร์ฟเวอร์

### 3. ปัญหาที่พบระหว่างทาง (Troubleshooting) และวิธีแก้ไข

ระหว่างการตั้งค่า Backend เราพบปัญหาใหญ่เกี่ยวกับการอัปเดตของ **Prisma เวอร์ชัน 7 (V7)** ซึ่งมีการเปลี่ยนแปลงเชิงโครงสร้าง (Breaking Changes) ดังนี้:

#### ❌ ปัญหาที่ 1: การประกาศ `url` ใน Schema ถูกยกเลิก
- **Error:** `The datasource property url is no longer supported in schema files.`
- **การแก้ไข:** ใน Prisma 7 เราไม่สามารถใส่ `url = env("DATABASE_URL")` ในไฟล์ `schema.prisma` ได้อีกต่อไป ต้องดึงออกและใช้ไฟล์ `prisma.config.ts` ในการตั้งค่า Migration แทน

#### ❌ ปัญหาที่ 2: Cannot find module '.prisma/client/default'
- **Error:** เมื่อพยายามเริ่มเซิร์ฟเวอร์ด้วย `ts-node-dev` พบว่าหาโมดูลของ Prisma Client ไม่เจอ
- **การแก้ไข:** รันคำสั่ง `npx prisma generate` เพื่อให้ระบบสร้างโฟลเดอร์สำหรับ Prisma Client ใน `node_modules` ใหม่อีกครั้งให้สมบูรณ์

#### ❌ ปัญหาที่ 3: PrismaClient ขาด Options (Query Engine ถูกยกเลิก)
- **Error:** `PrismaClientInitializationError: PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions`
- **สาเหตุ:** Prisma 7 บังคับให้ใช้ **Driver Adapter** แทน C-Engine/Rust Engine แบบเก่า
- **การแก้ไข:** เราได้ติดตั้ง `@prisma/adapter-better-sqlite3` และ `better-sqlite3` เพื่อใช้เป็น Adapter จากนั้นแก้โค้ดใน `src/lib/prisma.ts` ให้เรียกใช้งานผ่าน `PrismaBetterSqlite3({ url: ... })`

#### ❌ ปัญหาที่ 4: ไม่พบ Table (Table does not exist)
- **Error:** เมื่อทดสอบยิง API ระบบฟ้องว่า `main.User` ไม่มีอยู่จริง
- **การแก้ไข:** ตรวจสอบพบว่าไฟล์ `dev.db` ถูกสร้างไว้ที่หน้า root ของ backend (ไม่ใช่ในโฟลเดอร์ prisma) จึงปรับแก้ไขพาร์ทใน `url` ของ Adapter ให้ตรงกับ `process.env.DATABASE_URL || "file:./dev.db"`

---

## 🚀 การเริ่มต้นใช้งาน (How to Run)

1. เข้ามาที่โฟลเดอร์ backend
```bash
cd backend
```

2. ติดตั้ง Dependencies ทั้งหมด
```bash
npm install
```

3. รัน Server สำหรับ Development
```bash
npm run dev
```

Server จะทำงานที่ `http://localhost:5000`

## 🛠 API Endpoints ที่พร้อมใช้งาน

คุณสามารถใช้โปรแกรมอย่าง Postman, Thunder Client หรือกดรันผ่านไฟล์ `api-requests.http` ใน VS Code ได้เลย:

- **POST `/api/transactions`** - สร้างรายการรับ/จ่ายใหม่
- **GET `/api/transactions`** - ดึงรายการทั้งหมดของเดือนปัจจุบัน
- **GET `/api/transactions/summary`** - ดึงสรุปยอดรวม (รายรับ, รายจ่าย, ยอดคงเหลือ)

*(หมายเหตุ: ปัจจุบันระบบใช้ Mock Auth แบบจำลอง User ให้อัตโนมัติ)*
