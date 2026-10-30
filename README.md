# AcademiaPro — Unified College Management System

A production-grade, full-stack College Management System built with **Express.js**, **MongoDB/Mongoose**, and **React (Vite)** featuring a modern glassmorphic interface and role-based portals for **Administrators**, **Faculty**, and **Students**.

---

## 🌟 Key Features

### 👑 Administrator Portal
- **Executive Dashboard**: Real-time KPI statistics on active student enrollments, teaching faculty, degree programs, and departments.
- **Department Administration**: Manage academic departments, assign department heads, and monitor departmental student capacity.
- **Course & Syllabus Management**: Configure 4-year / 2-year degree tracks, semester quotas, credits, and subject curricula.
- **Faculty Directory**: Register faculty members, allocate employee IDs, and assign subject teaching modules.
- **Student Admissions**: Enroll students with roll numbers, registration IDs, course tracks, semester assignments, and guardian information.
- **Campus Examinations**: Schedule mid-term, end-term, lab practicals, and assignment assessments with maximum marks.

### 👨‍🏫 Faculty Portal
- **Teaching Schedule**: View assigned subject modules, credit allocations, and course syllabus.
- **Interactive Attendance Register**: One-click class roll attendance tracking (`Present`, `Absent`, `Late`) with live attendance rates and batch save.
- **Examination Grading**: Enter student marks with automated percentage and letter-grade computation (`A+`, `A`, `B+`, `B`, `C`, `D`, `F`).
- **Publish Results**: Toggle examination results between Draft and Published state to release official scores to students.

### 🎓 Student Portal
- **Academic Dashboard**: Visual attendance compliance gauge with warning indicators if attendance falls below the mandatory 75% threshold.
- **Official Transcript & Report Card**: Real-time view of published marks, aggregate GPA/percentage, letter grades, and instructor remarks.
- **Curriculum & Schedule**: View enrolled degree tracks, semester subjects, and faculty coordinators.
- **Printable Transcripts**: Export or print official grade sheets directly from the browser.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on v24.16.0)
- **MongoDB** (Local instance or MongoDB Atlas URI)
  > *Note: If MongoDB is not running locally, the server includes a fallback to an in-memory MongoDB server for seamless zero-config evaluation.*

### 2. Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 3. Seed Database (Optional)
Populate the database with rich test departments, courses, faculty, students, attendance history, and examinations:
```bash
cd server
npm run seed
```

### 4. Run the Application

**Start Backend Server (Port 5000):**
```bash
cd server
npm run dev
```

**Start Frontend Client (Port 5173):**
```bash
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@college.edu` | `Admin@123` | Full Campus Administration |
| **👨‍🏫 Faculty** | `faculty@college.edu` | `Faculty@123` | Attendance & Grading (Dr. Alan Turing) |
| **🎓 Student** | `student@college.edu` | `Student@123` | Grades & Attendance (Alex Mercer) |

*💡 Tip: The login screen and top navigation bar include instant **One-Click Quick Login** buttons to switch between Admin, Faculty, and Student roles with zero typing.*

---

## 🏗️ Architecture & Technology Stack

- **Backend**: Express.js, Mongoose, JWT (JSON Web Tokens), bcryptjs, Helmet, CORS, Cookie-Parser, Morgan, Express-Rate-Limit.
- **Frontend**: React 19, Vite, Lucide React icons.
- **Styling**: Vanilla CSS Design System with custom tokens, glassmorphism, responsive data tables, modal dialogs, and Dark/Light mode theme switching.
- **Security**: HttpOnly cookies, JWT Bearer headers, role-based authorization middleware (`ADMIN`, `FACULTY`, `STUDENT`), and input sanitization.
