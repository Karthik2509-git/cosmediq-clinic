# 🩺 COSMEDIQ — Skin & Hair Clinic Operating System

<div align="center">

![COSMEDIQ Banner](https://lh3.googleusercontent.com/aida/AEtjO1WSDWhBYLfoQ5nnn8fjxD2cyBiwKAspAi2WY6qS80ErhGY9RWa36jCWMQFoUu0jLX2ELVkfctMmqJnCC0SO7y0e_xkLuejQOMuoUnArxWNkjkRHiCUQ4NiLwyxcQQOfcogevdnr6tgfogi7Qo7LTlvGpvl99XZKWm-l9XJDMrxxThA3wr4JtQTWFB4_6XSySsmqwECxmhhw5-D2QUtH1WXO4mcxpGKpV-nZUw9H-8tUdPaWVc2Z3kLi1w)

**Modern, Fast & Non-Technical Reception Desk Terminal for Aesthetic Dermatology & Surgical Hair Restoration Clinics**

[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Render](https://img.shields.io/badge/Deploy_to-Render-46E3B7?logo=render&logoColor=black)](https://render.com)

</div>

---

## 📖 Overview

**COSMEDIQ** is a dedicated clinical operating environment purpose-built for front-desk receptionists, clinic coordinators, and dermatological surgeons. Designed with an ultra-clean, high-contrast, and intuitive interface, it replaces fragile paper diaries while remaining 100% accessible to non-technical clinic staff.

The system manages the complete lifecycle of clinical operations:
1. **Patient Intake & Logbook Sync**: Digital records mapped to physical paper diaries via volume & page citations.
2. **Appointments & Doctor Consultation Fees**: Tracks walk-ins, phone calls, and WhatsApp inquiries with consultation fee settlement.
3. **Post-Consultation Patient Outcomes**: Automatically categorizes outcomes into *Treatment Booked*, *In Talks / Considering*, *Medicines Only*, or *Refused Treatment*, while permanently preserving all patient records.
4. **Separated Hair & Skin Multi-Treatments**: Per-treatment closure amounts, amounts paid, remaining dues, and sittings count (finalized, appeared, and left).
5. **Milestone Balances & Desk Payments**: Collects dues via UPI QR, Cash Desk, POS Card, or NEFT with instant thermal slip printing.
6. **Dispensary Stock & OT Consumables**: Live steppers for surgical consumables (PRP tubes, punches, anesthetics) and retail serums.

---

## ✨ Key Features & Clinical Workflows

### 1. 💇 Dedicated Skin & Hair Multi-Treatment Tracking
* **Separate Care Categories**: Hair and Skin treatments are independently tracked with clear visual badges:
  - 💇 **Hair Treatments** (FUE Transplants, PRP Therapy, GFC Boosters, Scalp Mesotherapy)
  - ✨ **Skin Treatments** (Carbon Laser, Hydrafacials, Chemical Peels, Acne Scars Subcision, Laser Hair Reduction)
* **Financial Precision per Treatment**:
  - **Closure Amount (₹)**: Agreed package price.
  - **Paid by Patient (₹)**: Total collected across milestones.
  - **Amount Left to Pay (₹)**: Automatically calculated live (`Closure - Paid`).
* **Sittings Counter**:
  - **Finalized Sittings**: Total agreed sessions (e.g., 6 sittings).
  - **Appeared Sittings**: Desk staff taps green **`+1 Sitting Appeared`** when patient attends.
  - **Sittings Left**: Real-time remaining session counter.

---

### 2. 📅 Appointments, Inquiries & Doctor Consultation Fees
* **3 Booking Channels**:
  - 📱 **WhatsApp / SMS Text**: Inquiries received via messaging.
  - 📞 **Phone Call**: Telephonic appointments booked at the front desk.
  - 🚶 **Walk-in Desk Visit**: Direct walk-in patients visiting the clinic counter.
* **Doctor Consultation Fee Management**:
  - One-click presets: **₹500**, **₹800**, **₹1,000**, or custom amount.
  - Fee settlement status:
    - `Paid Before Consultation` (collected at reception upon arrival).
    - `Pay After Consultation` (highlighted in amber until settled post-consultation).
    - `Pending / Unpaid`.
    - `Fee Waived / Free Doctor Visit` (for complimentary check-ups).
* **Post-Consultation Outcomes (`ConsultationOutcomeModal`)**:
  - 🟢 **Treatment Booked / Closed**: Automatically transitions staff to the Package Closure window to enter agreed packages and advance payment.
  - 🟡 **In Talks / Considering**: Patient is considering; logs reminder date (*After 3 Days*, *Next Monday*) and consultation notes with a 1-tap **"Send Follow-up WhatsApp"** button.
  - 💊 **Medicines & Prescription Only**: Patient visited solely for clinical assessment and prescribed medicines; no surgical/cosmetic procedure booked.
  - 🔴 **Refused Treatment**: Patient declined recommended treatments.
* **🔒 Permanent Patient Retention Rule**:
  - Every inquiring, calling, or walk-in patient is **permanently saved in the Patient Directory**, even if they refuse treatment or only buy medicines!

---

### 3. 💳 Treatment Closures & Balances (Tab 2)
* **Active Package Ledger**: Displays all active surgical package agreements and multi-session courses.
* **Summary Financial Metrics**:
  - Total Agreed Closures (₹)
  - Total Collections Received (₹)
  - Total Outstanding Balances Due (₹ highlighted in bold amber)
* **One-Click Balance Collection**:
  - Click amber **`+ Collect Balance`** to record payments.
  - Payment modes: **UPI / QR Code** (auto-generates Bharat QR for instant scanning), **Cash Desk**, **POS Card Terminal**, and **Bank NEFT**.
  - 1-click **"Pay Full Balance"** auto-fill button.
  - Thermal desk receipt printing toggle and physical logbook check-off.

---

### 4. 📦 Clinic Stocks & Dispensary Inventory (Tab 4)
* **Dual Stock Sections**:
  - **Clinic Pharmacy**: Surgical anesthetics (Lignocaine 2%), PRP/GFC vacuum tubes, titanium micro-punches, saline.
  - **Clinic Products**: Post-transplant serums, Minoxidil 5% solutions, healing barrier creams, ketoconazole shampoos.
* **One-Click Steppers**:
  - **`[-1 Sell / Dispense]`**: Instantly deducts 1 unit with automated reception timestamp log.
  - **`[+ Add Stock]`**: Adds units upon vendor delivery.
* **Low Stock Alerts & CSV Export**: Automated alerts when stock dips below threshold with vendor CSV purchase order generator.

---

### 5. 📖 Physical Register Diary Citations & Daily OPD Sheet
* **Paper Diary Linking**: Tags like **`📖 Vol 2, Page 15 • Blue Spiral Diary`** cross-reference digital records with physical paper logbooks in the clinic filing cabinet.
* **Daily Register Sheet**: One-click printable hardcopy OPD sheet formatted for clinic management audits.

---

### 6. 🗄️ Persistent Real Database & Clean Test Week Mode
* **Zero Mock Patients**: Starts in **Clean Test Week Mode** (`patients: []`, `deals: []`, `appointments: []`) with clinic inventory intact.
* **Atomic Persistence**: Real data is saved on the server in `data/clinic_database.json` and mirrored in the browser.
* **1-Click Control**:
  - **`Clean Slate (0 Records)`**: Wipes all test data to start fresh for real clinic intake.
  - **`Load Sample Demo Data`**: Populates demo records for staff onboarding and walkthroughs.

---

## 🚀 Internet Deployment Guide (Render.com)

This application includes [`render.yaml`](render.yaml) and [`Procfile`](Procfile) for seamless 1-click deployment.

### Step 1: Push Your Code to GitHub
```bash
# Initialize and push to your repository (replace with your repo URL)
git add .
git commit -m "COSMEDIQ Clinic Desk ready for cloud deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cosmediq-clinic.git
git push -u origin main
```

### Step 2: Deploy on Render (Free Web Service)
1. Sign in to [Render.com](https://render.com).
2. Click **"New +"** in the top navigation and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and connect your GitHub repository (`cosmediq-clinic`).
4. Render will automatically detect the settings from [`render.yaml`](render.yaml):
   - **Name**: `cosmediq-clinic`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
5. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `GEMINI_API_KEY`: *(Optional — for the AI Staff Desk Copilot)*
6. Click **"Create Web Service"**.

In **2 to 3 minutes**, Render will build and launch your live public URL (e.g. `https://cosmediq-clinic.onrender.com`). Share this URL with clinic reception staff!

---

## 💻 Local Development

### Prerequisites
* [Node.js](https://nodejs.org/) version 20.0 or higher
* npm version 9.0 or higher

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/cosmediq-clinic.git
cd cosmediq-clinic

# 2. Install dependencies
npm install

# 3. (Optional) Set up your Gemini API key in .env
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

# 4. Start the local server
npm run dev
```

Open your browser at **`http://localhost:3000`**.

### Available Scripts
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts server with Vite middleware at `http://localhost:3000` |
| `npm run build` | Compiles production bundle with Vite into `dist/` |
| `npm run start` | Runs production Node server using `tsx server.ts` |
| `npm run lint` | Runs TypeScript type checker (`tsc --noEmit`) |
| `npx tsx --test src/utils/clinicLogic.test.ts` | Runs comprehensive clinic logic unit test suite |

---

## 📂 Project Architecture

```
cosmediq/
├── data/
│   └── clinic_database.json      # Persistent atomic clinic database (patients, deals, appointments, stock)
├── public/                       # Static brand logos and SVGs
├── src/
│   ├── components/
│   │   ├── Header.tsx            # Navigation, omnibox search (⌘K), staff badge & quick actions
│   │   ├── PatientsTab.tsx       # Active patient directory (Card & Dense views with Skin/Hair tags)
│   │   ├── ClosuresTab.tsx       # Treatment package deals & balance milestone tracker
│   │   ├── AppointmentsTab.tsx   # OPD queue, booking channels, consultation fees & outcomes
│   │   ├── InventoryTab.tsx      # OT pharmacy & retail product stock management
│   │   ├── BookVisitModal.tsx    # Walk-in/Phone/WhatsApp booking with doctor fee presets
│   │   ├── ConsultationOutcomeModal.tsx # Post-consultation outcome recorder (Booked/In Talks/Rx/Refused)
│   │   ├── ManageTreatmentsModal.tsx    # Separate Skin & Hair treatments manager with dues & sittings
│   │   ├── RecordClosureModal.tsx       # Multi-treatment package closure recorder
│   │   ├── CollectPaymentModal.tsx      # UPI QR, Cash Desk, POS Card payment processor
│   │   ├── PatientProfileModal.tsx      # Comprehensive 360° patient clinical history
│   │   ├── DailyRegisterSheetModal.tsx  # Hardcopy OPD ledger printable format
│   │   ├── GeminiStaffChatbot.tsx       # AI Desk Copilot assistant
│   │   └── Toast.tsx                    # Non-intrusive action feedback toasts
│   ├── data/
│   │   └── initialData.ts        # Fallback starter datasets and stock templates
│   ├── utils/
│   │   ├── clinicLogic.ts        # Pure business logic, financial calculators & sittings helpers
│   │   └── clinicLogic.test.ts   # 14 automated unit tests
│   ├── App.tsx                   # Main application controller with auto-sync persistence
│   ├── main.tsx                  # React 19 root entry
│   └── index.css                 # Tailwind CSS v4 design system
├── server.ts                     # Express + Vite server with REST database persistence APIs
├── render.yaml                   # 1-Click Render.com deployment blueprint
├── Procfile                      # Process configuration for Railway / Heroku
├── package.json                  # Dependencies & scripts
└── tsconfig.json                 # TypeScript strict compiler options
```

---

## 🔒 Security & Privacy

* **Sandbox & Isolation**: Built with strict CORS headers and sanitization for reception terminals.
* **Offline Protection**: All data automatically mirrors to browser local storage so reception staff never lose inputs during network interruptions.
* **Auditability**: Every transaction and stock deduction captures a timestamp and operating staff member.

---

## 📄 License

Licensed under the [Apache-2.0 License](LICENSE).
