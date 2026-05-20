# Aion Enterprise Time Logger

Welcome to the **Aion Enterprise Time Logger** — a comprehensive enterprise portfolio management platform designed for precision time logging, strategic project planning, resource intelligence, and enterprise administration.

---

## 💾 Instant Tryout with Sample Database

For users wishing to instantly test and explore the system with populated data (pre-configured organizations, team members, WBS plans, and time logs):

1. **Restore Sample Database**:
   ```bash
   npm run db:restore-sample
   ```
   *This copies our pre-packaged `prisma/sample.db` directly to `prisma/dev.db`.*

2. **Run the Application**:
   ```bash
   npm run dev
   ```

3. **Login Credentials**:
   - **Super Admin**: `superadmin@example.com` / `password123`
   - **Stitch & Co (Org Admin)**: `admin@stitch.com` / `password123`
   - **Stitch & Co (Team Member)**: `alice@stitch.com` / `password123`

---

## 📖 Interactive Bilingual User Manual

An interactive, bilingual (EN/TH) glassmorphic user manual is built directly into the application.

### How to access:
1. Start the dev server: `npm run dev`
2. Visit: **[http://localhost:5173/tutorial/manual.html](http://localhost:5173/tutorial/manual.html)**
3. Alternatively, double-click/open `frontend/public/tutorial/manual.html` in your web browser.

---

## 🎥 Feature Walkthroughs & Step-by-Step Guides

Below are the 8 core operational chapters. Each contains a native video walkthrough and the precise steps to replicate the actions.

### 1. Account Registration (All Users)
Register a company, create a profile, and log in to the workspace.

<video src="frontend/public/tutorial/assets/01_register_account.mp4" width="100%" controls loop muted></video>

#### Steps to replicate:
1. Click the **Register** link at the bottom of the login page.
2. Enter your **Full Name**, **Email Address**, **Organization Name**, and **Password**.
3. Check the **Terms of Service & Privacy Policy** agreement checkbox.
4. Click the blue **Create Account** button.
5. Enter your registered email and password on the login screen, then click **Sign In**.

---

### 2. Dashboard Navigation (All Users)
Understand widgets, active assignments, and the work logs calendar.

<video src="frontend/public/tutorial/assets/02_login_dashboard.mp4" width="100%" controls loop muted></video>

#### Steps to replicate:
1. Observe the **Weekly Timesheet widget** showing total hours logged for the current week.
2. Review the **Active Tasks** panel containing tasks assigned to you.
3. Check the **Quick Log** form for daily logging.
4. Hover over the **Weekly Visual Calendar** to view daily work entry density.
5. Browse different modules using the left sidebar navigation menu.

---

### 3. Project & Workspace Setup (Administrators)
Create projects and divide them into phases.

<video src="frontend/public/tutorial/assets/03_project_setup.mp4" width="100%" controls loop muted></video>

#### Steps to replicate:
1. Navigate to the **Projects** page in the left sidebar.
2. Click the **Add Project** button in the top right.
3. Enter a project name (e.g., `Stitch Dashboard`), pick a color theme, and click **Save**.
4. Click the **Phases** tab next to your newly created project.
5. Click **Add Phase**, input the phase name (e.g., `Build`), and click **Save**.

---

### 4. Work Breakdown Structure - WBS (Administrators)
Construct hierarchical plans and timeline Gantt charts.

<video src="frontend/public/tutorial/assets/04_task_planning.mp4" width="100%" controls loop muted></video>

#### Steps to replicate:
1. Navigate to the **Plans** page in the left sidebar.
2. Select your target **Project** and **Phase** from the dropdown filters.
3. Click the **Add Task** button to create a task in the WBS list.
4. Enter the **Task Description**, **Start/End Dates**, **Planned Hours**, and assign it to a teammate.
5. Set the **Parent Task** dropdown to build nested task groups (e.g., nested under `Project Foundation`).
6. Click **Save** to render the hierarchical tree and the interactive **Gantt Chart**.

---

### 5. Team & Member Onboarding (Administrators)
Onboard your team roster in bulk.

<video src="frontend/public/tutorial/assets/05_bulk_upload.mp4" width="100%" controls loop muted></video>

#### Steps to replicate:
1. Go to the **Team** page from the sidebar navigation.
2. Click the **Bulk Register** button to open the spreadsheet upload modal.
3. Click **Download Template** to download the standard Excel file.
4. Populate the spreadsheet with team member names, emails, roles (USER/ADMIN), and manager emails.
5. Upload or drag-and-drop the populated Excel spreadsheet, then click **Upload**.
6. Verify that the team grid updates instantly with the new members and manager lines.

---

### 6. Time Logging & Submissions (All Users)
Submit operational work logs for review.

<video src="frontend/public/tutorial/assets/06_time_logging.mp4" width="100%" controls loop muted></video>

#### Steps to replicate:
1. Locate the **Quick Log Time** widget on the Dashboard.
2. Select the **Project**, **Phase**, and the **WBS Planned Task** you worked on.
3. Input the **Worked Hours** (e.g., `4`) and enter a descriptive summary of your task.
4. Click **Log Time** (saves the entry in a `DRAFT` status).
5. Navigate to the **Time Logs** page, check the draft entries, and click **Submit** to request approval.

---

### 7. Resource Analytics & Heatmaps (Administrators)
Track team capacity, over-allocation, and utilization.

<video src="frontend/public/tutorial/assets/07_analytics_reports.mp4" width="100%" controls loop muted></video>

#### Steps to replicate:
1. Click **Reports** in the sidebar navigation, then choose the **Capacity** tab.
2. Set the **Start Date** and **End Date** filters to select your sprint range.
3. Inspect the **Resource Capacity Heatmap**:
   - 🟩 **Green**: Normal allocation (up to 8 hours/day).
   - 🟥 **Red**: Over-allocated resource status (>8 hours/day).
   - ⬛ **Grey**: Weekends and corporate holidays.
4. Click the **Export Report** button to download a CSV format capacity report.

---

### 8. Superadmin Config & Branding (Super Admins)
Customize logos and branding accents organization-wide.

![Superadmin Customization](frontend/public/tutorial/assets/08_superadmin_config.webp)

#### Steps to replicate:
1. Log in as a **Super Admin** or authorized Administrator and navigate to the **Admin** settings.
2. Locate the **Branding Customization** panel.
3. Set your preferred corporate theme color hex code (e.g., `#ff5722` for orange).
4. Upload your company's **Logo** image file.
5. Click **Save Customization** and observe the header logo and theme colors update instantly.

---

## 🛠️ Project Structure

- **`/frontend`**: React + Vite + TypeScript frontend.
  - API Client: `/frontend/src/api/client.ts`
  - Tutorial Assets: `/frontend/public/tutorial/`
- **`/src`**: Node.js + Express backend.
  - Business Logic: `/src/services/`
- **Database**: Prisma + SQLite

---

## 🧪 Development & Testing

- **Install Dependencies:** `npm install`
- **Restore Sample DB:** `npm run db:restore-sample`
- **Run Dev Server:** `npm run dev` (Concurrent backend + frontend)
- **Run Tests:** `npm run test` (Vitest + Supertest)
- **Build Project:** `npm run build`
