# Changelog — LMS Web Panel (Next.js)

All notable changes to the Publisher & Admin Web Panel are documented in this file.

---

## [1.0.0] — Phase 1 MVP Complete

### 1. Project Initialization
- Initialized the Next.js 14 project with the **App Router**.
- Configured **TailwindCSS** for styling.

### 2. API Integration & Authentication
- Integrated **Axios** with a JWT Interceptor (`lib/api.ts`) for seamless token handling.
- Created a robust **Context API** `<AuthProvider>` to manage authentication state and automatically inject JWT tokens into requests.

### 3. Protected Routing
- Built a `<ProtectedRoute>` component to guard dashboard routes.
- Only **Admins** can access the Admin Dashboard.
- Only **Publishers** can access the Publisher Dashboard.

### 4. Admin Dashboard
- Built the Admin Dashboard page with the following capabilities:
  - View all publishers.
  - Approve or reject publisher applications.
  - Manage platform users.
  - View platform-wide statistics.

### 5. Publisher Dashboard
- Built the Publisher Dashboard page with the following capabilities:
  - Publisher profile management.
  - Create, edit, and delete subjects.
  - Manage modules & lessons.
  - Upload media files.
  - Create quizzes.
  - View enrollment count per subject.

### Validation
- Spun up both the ASP.NET Core backend and Next.js frontend.
- Used automated browser testing to verify the login flow and Admin Dashboard rendering.
- The app successfully redirects to `/login` and processes mock admin login to render the Admin Dashboard.
