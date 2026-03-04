# 🎓 LMS Web Panel — Unified Learning Management System

A modern, high-performance Digital Learning Platform built with **Next.js**, designed to bridge the gap between content creators (Publishers), administrators, and learners (Students). This platform provides a seamless, integrated experience for managing and consuming educational content.

---

## 🚀 Key Features

### 👤 Student Experience (The Learner's Hub)
Designed for a premium learning experience with focus and interactivity.
- **Personal Dashboard**: View enrolled courses, track progress, and resume learning with a single click.
- **Course Explorer**: A searchable catalog to discover new subjects and enroll instantly.
- **Interactive Lesson Player**:
  - **Multimedia Support**: Rich text, embedded video players, and PDF resources.
  - **Knowledge Checks**: Real-time interactive quizzes with instant grading and attempt history.
  - **Progress Tracking**: Automatic tracking of lesson completion and subject mastery.

### ✍️ Publisher Tools (The Creator's Suite)
A complete workflow for building structured educational content.
- **Content Hierarchy**: Organize learning into **Subjects** → **Modules** → **Lessons**.
- **Dynamic Content Blocks**: Create lessons using versatile blocks:
  - **Text Blocks**: HTML-ready content for detailed explanations.
  - **Video Blocks**: Integration for educational videos.
  - **PDF Blocks**: Support for downloadable/viewable reading materials.
- **Quiz Engine**: Build complex multiple-choice questions with correct answer validation and explanations.

### 🛡️ Admin Panel (The Command Center)
Centralized management and moderation tools.
- **Publisher Onboarding**: Review and approve/reject new publisher registration requests.
- **Platform Analytics**: Real-time stats on subjects, active publishers, and pending approvals.
- **Global Moderation**: Maintain quality control across the entire platform.

---

## 🛠️ Technical Excellence

### Core Stack
- **Frontend**: [Next.js](https://nextjs.org/) (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS with custom glassmorphism and dark-mode aesthetics.
- **Icons**: [Lucide React](https://lucide.dev/) for a clean, consistent UI.
- **API Client**: Axios with custom interceptors for robust communication.

### Security & Authentication
- **JWT-Based Flow**: Secure, stateless authentication.
- **Automatic Token Management**: 
  - **In-Memory Storage**: Access tokens are kept in memory for maximum security.
  - **Refresh Tokens**: Implemented with automatic rotation and request queuing to prevent race conditions.
  - **Server-Side Revocation**: Real-time session invalidation during logout.
- **Role-Based Protected Routes**: Granular access control for every page and component.

### Architecture
- **Service-Oriented Design**: Clean separation of logic into dedicated services (`authService`, `contentService`, `quizService`, `enrollmentService`).
- **Unified DTOs**: Shared TypeScript interfaces to ensure perfect synchronization with the backend API.
- **Reusable Layouts**: Flexible `DashboardLayout` that adapts navigation and user context based on roles.

---

## ⚙️ Setup & Configuration

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (create `.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-url.com/api
   ```

### Development
Start the local development server:
```bash
npm run dev
```

### Production Build
Generate an optimized production bundle:
```bash
npm run build
```

---

## 📂 Project Structure
```text
src/
├── app/               # Next.js App Router (Routes & Pages)
├── components/        # Reusable UI Components
├── context/           # React Context (Auth, etc.)
├── lib/               # Utilities & Service Layer
│   ├── services/      # API Service implementations
│   └── api.ts         # Axios configuration & Interceptors
└── types/             # TypeScript definitions & DTOs
```

---

*Built with ❤️ for the future of digital education.*
