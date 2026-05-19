# Aion Enterprise Time Logger

Welcome to the **Aion Enterprise Time Logger** — a comprehensive enterprise portfolio management platform designed for precision time logging, strategic project planning, resource intelligence, and enterprise administration.

## 📖 User Manual & Walkthroughs

The complete bilingual (EN/TH) interactive user manual and high-fidelity video walkthroughs are located within the application itself.

### How to access the manual:
1. Run the development server locally:
   ```bash
   npm run dev
   ```
2. Navigate to the tutorial path in your browser:
   **[http://localhost:5173/tutorial/manual.html](http://localhost:5173/tutorial/manual.html)** *(Port may vary depending on your Vite setup)*

Alternatively, you can open `frontend/public/tutorial/manual.html` directly in any web browser.

---

## 🚀 Feature Highlights (Use Case Videos)

Here are the key workflows demonstrated in our video walkthroughs.

### 1. Precision Time Logging
Aion provides distinct methods for capturing work intensity—from quick entries to bulk logging—ensuring total accuracy with minimal friction.
![Time Logging Workflow](frontend/public/tutorial/assets/time_logging.webp)

### 2. Strategic Project Planning
Go beyond simple lists. Aion supports complex Work Breakdown Structures (WBS) and real-time Gantt visualization to directly link time entries to planned tasks.
![Project Planning and Resource Utilization](frontend/public/tutorial/assets/enterprise_features.webp)

### 3. Custom Branding & Administration
Complete control over your organizational identity, data privacy, and compliance standards. Set your own logos and multi-tenant isolation.
![Custom Branding & Logo Settings](frontend/public/tutorial/assets/login_branding.webp)

---

## 🛠️ Project Structure

- **`/frontend`**: React + Vite + TypeScript frontend.
  - API Client: `/frontend/src/api/client.ts`
  - Tutorial Assets: `/frontend/public/tutorial/`
- **`/src`**: Node.js + Express backend.
  - Business Logic: `/src/services/`
- **Database**: Prisma + SQLite

## 🧪 Development & Testing

- **Install Dependencies:** `npm install`
- **Run Dev Server:** `npm run dev` (Concurrent backend + frontend)
- **Run Tests:** `npm run test` (Vitest + Supertest)
- **Build Project:** `npm run build`
