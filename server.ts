











/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_INVENTORY,
  INITIAL_PATIENTS,
  INITIAL_CLOSURE_DEALS,
  INITIAL_APPOINTMENTS,
  INITIAL_DISPENSATION_LOGS,
} from './src/data/initialData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path & directory setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'clinic_database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database helper functions
interface ClinicDatabase {
  patients: any[];
  deals: any[];
  appointments: any[];
  inventory: any[];
  dispensationLogs: any[];
  isCleanTestWeek: boolean;
  lastUpdated: string;
}

async function getDatabase(): Promise<ClinicDatabase> {
  if (!fs.existsSync(DB_FILE)) {
    // For test week: Clean database with 0 mock patients/deals/appointments, but with inventory items ready
    const cleanDb: ClinicDatabase = {
      patients: [],
      deals: [],
      appointments: [],
      inventory: INITIAL_INVENTORY,
      dispensationLogs: [],
      isCleanTestWeek: true,
      lastUpdated: new Date().toISOString(),
    };
    await fs.promises.writeFile(DB_FILE, JSON.stringify(cleanDb, null, 2), 'utf-8');
    return cleanDb;
  }

  try {
    const raw = await fs.promises.readFile(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading clinic_database.json, returning empty structure:', err);
    return {
      patients: [],
      deals: [],
      appointments: [],
      inventory: INITIAL_INVENTORY,
      dispensationLogs: [],
      isCleanTestWeek: true,
      lastUpdated: new Date().toISOString(),
    };
  }
}

async function saveDatabase(data: Partial<ClinicDatabase>): Promise<ClinicDatabase> {
  const current = await getDatabase();
  const updated: ClinicDatabase = {
    patients: Array.isArray(data.patients) ? data.patients : current.patients,
    deals: Array.isArray(data.deals) ? data.deals : current.deals,
    appointments: Array.isArray(data.appointments) ? data.appointments : current.appointments,
    inventory: Array.isArray(data.inventory) ? data.inventory : current.inventory,
    dispensationLogs: Array.isArray(data.dispensationLogs) ? data.dispensationLogs : current.dispensationLogs,
    isCleanTestWeek: Array.isArray(data.patients) ? data.patients.length === 0 : current.isCleanTestWeek,
    lastUpdated: new Date().toISOString(),
  };

  const tmpFile = `${DB_FILE}.tmp`;
  await fs.promises.writeFile(tmpFile, JSON.stringify(updated, null, 2), 'utf-8');
  await fs.promises.rename(tmpFile, DB_FILE);
  return updated;
}

// Helper for timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Intelligent Clinic Operational Knowledge Engine (Deterministic Fallback & Augmentation)
function getClinicKnowledgeReply(userQuery: string, context?: any): string {
  const query = userQuery.toLowerCase();

  if (query.includes('collect') || query.includes('payment') || query.includes('balance') || query.includes('due') || query.includes('upi') || query.includes('cash')) {
    return `### 💳 How to Collect a Pending Balance Payment:

1. **Navigate to Tab 2:** Click **"Treatment Closures & Balances"** in the top navigation bar.
2. **Find the Patient:** Look through the active deal table or use the filter chips (*"Pending Balance"*).
3. **Click Collect:** Tap the amber **"+ Collect Balance"** button on the patient's row.
4. **Enter Amount:** The modal shows the remaining due (e.g. ₹40,000). You can enter the exact partial or full amount.
5. **Select Payment Mode:**
   - **UPI / QR:** Generates an instant Bharat/UPI QR code for scanning via Google Pay, PhonePe, or Paytm.
   - **Cash at Desk:** Enter drawer notes & physical cash count.
   - **POS Card:** Enter card terminal approval code.
   - **Bank / NEFT:** Enter transaction UTR number.
6. **Confirm:** Toggle *"Print Thermal Desk Slip"* or *"Paper Ledger Vol. Checked"* as needed, then click the green **"Confirm Payment Receipt"** button.

*Note: The ledger updates both the package closure and the patient's profile in real time!*`;
  }

  if (query.includes('paper') || query.includes('citation') || query.includes('diary') || query.includes('vol') || query.includes('page') || query.includes('register')) {
    return `### 📖 Understanding "Paper Register Citations":

In the patient cards and profiles, you will notice tags like **"📖 Vol 2, Page 15"** or **"Book A, Pg 42"**.

• **Why it exists:** Desk staff previously recorded all patient intakes and surgery agreements in physical paper bound diaries.
• **How to use it:** When a patient visits or an auditor checks records, this citation tells you the **exact Volume number and physical Page** where their original signed agreement, blood reports, or physical photograph is filed in the clinic cabinet.
• **When adding a patient:** In the **"+ New Patient"** modal, simply enter the Paper Register Vol. and Page # so the digital record stays synchronized with the physical file!`;
  }

  if (query.includes('inventory') || query.includes('stock') || query.includes('dispense') || query.includes('ot') || query.includes('restock') || query.includes('lignocaine') || query.includes('medicine') || query.includes('serum')) {
    return `### 📦 Managing Clinic Stocks & Inventory (Tab 4):

1. **Category Toggles:**
   - **Clinic Pharmacy:** Surgical anesthetics (Lignocaine), saline, PRP/GFC vacuum tubes, and micro-punches.
   - **Clinic Products:** Post-care shampoos, Minoxidil serums, and recovery creams.
2. **Quick Steppers:**
   - Click **"[-1 Sell / Dispense]"** to immediately deduct 1 unit when handed to an OT technician or patient. A live timestamp log is created automatically.
   - Click **"[+ Add Stock]"** when a courier or pharmaceutical vendor shipment arrives at reception.
3. **Low Stock Alerts:** Items below their minimum threshold show a red pulsing badge. Use the **"1-Click Reorder"** button or **"Export Vendor Order (CSV)"** to send purchase orders to suppliers.`;
  }

  if (query.includes('new patient') || query.includes('register') || query.includes('add patient') || query.includes('intake')) {
    return `### 👤 How to Register a New Patient:

1. Click the solid navy/teal **"+ New Patient"** button in the top-right header.
2. Fill in the intake details:
   - **Full Name, Age, and Gender**.
   - **Mobile Number:** (Enables direct 1-tap WhatsApp communication).
   - **Primary Concern:** FUE Hair Transplant, PRP Therapy, GFC, Laser Hair Reduction, or Acne Scars.
   - **Paper Register Citation:** Enter the Diary Volume & Page # where their physical intake was recorded.
3. Click **"Register Patient"**. The patient appears instantly in Tab 1!`;
  }

  if (query.includes('appointment') || query.includes('schedule') || query.includes('visit') || query.includes('follow-up') || query.includes('book')) {
    return `### 📅 Booking & Managing Appointments (Tab 3):

1. Click **"+ Book Visit"** in the top navigation or click **"+ Schedule"** on any patient card in Tab 1.
2. Choose:
   - **Time Slot & Procedure Type:** (OT Surgery, PRP Session, Laser Suite, or Doctor Consultation).
   - **Assigned Doctor:** Dr. A. V. Rao (Chief Hair Transplant Specialist) or Dr. Meera Reddy (Senior Aesthetic Dermatologist).
   - **Procedure Room:** OT-1, Laser Suite, or Consultation Rm 204.
3. On Tab 3, staff can click **"Send WhatsApp Reminder"** to message the patient on their phone, or click **"Mark Completed"** when the procedure is finished.`;
  }

  if (query.includes('closure') || query.includes('package') || query.includes('deal') || query.includes('graft') || query.includes('hair transplant')) {
    return `### 💼 Recording a Treatment Closure / Package Deal:

1. Click **"+ Record Closure"** in the header or click **"+ Record Deal"** on a patient's card.
2. Select the patient and choose the treatment package:
   - *FUE Hair Transplant (2,500 Grafts)*
   - *PRP Hair Restoration (4 Sessions)*
   - *GFC Advanced Therapy (3 Sessions)*
   - *Full Face Laser Resurfacing*
3. Enter the Agreed Total Price (₹), Advance Paid (₹), and Payment Mode.
4. The remaining balance is automatically calculated and placed in Tab 2 for milestone collections!`;
  }

  if (query.includes('shortcut') || query.includes('search') || query.includes('find') || query.includes('cmd') || query.includes('ctrl')) {
    return `### ⚡ Staff Search & Keyboard Shortcuts:

• **Omnibox Search:** Located at the center of the top header. You can type patient names (e.g. *Rajesh*), mobile numbers, or Patient IDs (*CQ-2401*).
• **Instant Shortcut:** Press **⌘K** (on Mac) or **Ctrl+K** (on Windows) from anywhere on the screen to immediately jump your cursor into the search bar.
• **WhatsApp:** Click the green WhatsApp button on any patient row to launch a pre-formatted chat on your desk WhatsApp Web!`;
  }

  // Default comprehensive portal manual response
  return `### 🩺 Welcome to COSMEDIQ Clinic Staff Desk!

Here is a quick overview of your 4 primary operational tabs:

1. **Tab 1: Patient Records**
   - Active directory with card & dense views, filter by concern, WhatsApp chat links, and physical paper citation tags (*"📖 Vol 2, Page 15"*).
   - Use the **"Daily Register Sheet"** button to print the daily OPD ledger to double-check physical diaries.
2. **Tab 2: Treatment Closures & Balances**
   - Track surgical package deals (Hair Transplants, PRP Courses).
   - View pending balances in bold amber.
   - Click **"+ Collect Balance"** to record payments via UPI / QR, Cash Desk, POS Card, or Bank NEFT.
3. **Tab 3: Appointments & Follow-ups**
   - Today's consultation and OT surgery queue with doctor & room assignments.
4. **Tab 4: Clinic Stocks & Inventory**
   - Track OT consumables and retail serums with live **[-1 Dispense]** and **[+ Add Stock]** steppers.

*Tip: Press **⌘K** anytime to search patients by name, mobile, or ID!*`;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // Initialize Google Gen AI client with User-Agent as per gemini-api skill
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
    : null;

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey),
      timestamp: new Date().toISOString(),
    });
  });

  // Database API: Get full live clinic database
  app.get('/api/data', async (_req: Request, res: Response) => {
    try {
      const data = await getDatabase();
      res.json(data);
    } catch (err: any) {
      console.error('Error in GET /api/data:', err);
      res.status(500).json({ error: 'Failed to retrieve database.' });
    }
  });

  // Database API: Persist updated clinic database
  app.post('/api/data', async (req: Request, res: Response) => {
    try {
      const updated = await saveDatabase(req.body);
      res.json({
        success: true,
        lastUpdated: updated.lastUpdated,
        patientCount: updated.patients.length,
        dealCount: updated.deals.length,
        appointmentCount: updated.appointments.length,
      });
    } catch (err: any) {
      console.error('Error in POST /api/data:', err);
      res.status(500).json({ error: 'Failed to save clinic data.' });
    }
  });

  // Database API: Clear all data for Clean Test Week (0 mock patients)
  app.post('/api/clear-all', async (_req: Request, res: Response) => {
    try {
      const cleanDb: ClinicDatabase = {
        patients: [],
        deals: [],
        appointments: [],
        inventory: INITIAL_INVENTORY,
        dispensationLogs: [],
        isCleanTestWeek: true,
        lastUpdated: new Date().toISOString(),
      };
      await fs.promises.writeFile(DB_FILE, JSON.stringify(cleanDb, null, 2), 'utf-8');
      res.json({
        success: true,
        message: 'Clinic database initialized to Clean Test Week state (0 patients, 0 deals, 0 appointments).',
        data: cleanDb,
      });
    } catch (err: any) {
      console.error('Error in POST /api/clear-all:', err);
      res.status(500).json({ error: 'Failed to clear database.' });
    }
  });

  // Database API: Seed sample demo data (for previewing or staff training)
  app.post('/api/seed-demo', async (_req: Request, res: Response) => {
    try {
      const demoDb: ClinicDatabase = {
        patients: INITIAL_PATIENTS,
        deals: INITIAL_CLOSURE_DEALS,
        appointments: INITIAL_APPOINTMENTS,
        inventory: INITIAL_INVENTORY,
        dispensationLogs: INITIAL_DISPENSATION_LOGS,
        isCleanTestWeek: false,
        lastUpdated: new Date().toISOString(),
      };
      await fs.promises.writeFile(DB_FILE, JSON.stringify(demoDb, null, 2), 'utf-8');
      res.json({
        success: true,
        message: 'Sample demo clinic records loaded successfully.',
        data: demoDb,
      });
    } catch (err: any) {
      console.error('Error in POST /api/seed-demo:', err);
      res.status(500).json({ error: 'Failed to seed demo data.' });
    }
  });

  // Database API: Database status & stats
  app.get('/api/database-status', async (_req: Request, res: Response) => {
    try {
      const data = await getDatabase();
      const stats = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE) : null;
      res.json({
        connected: true,
        isCleanTestWeek: data.isCleanTestWeek,
        patientCount: data.patients.length,
        dealCount: data.deals.length,
        appointmentCount: data.appointments.length,
        inventoryCount: data.inventory.length,
        fileSizeBytes: stats?.size || 0,
        lastUpdated: data.lastUpdated,
      });
    } catch (err: any) {
      res.status(500).json({ connected: false, error: err?.message || 'Database error' });
    }
  });

  // Staff Helpdesk Chatbot Endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    const { messages, currentContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage?.content || '';

    // If Gemini client is not initialized or API key is absent, use the built-in clinical knowledge engine
    if (!ai) {
      const fallbackReply = getClinicKnowledgeReply(userPrompt, currentContext);
      return res.json({ reply: fallbackReply });
    }

    // Try calling Gemini API with fallback across resilient models with 5 second timeout
    let reply = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    let contextString = '';
    if (currentContext) {
      contextString = `\n\nCURRENT LIVE CLINIC STATUS (from staff screen):
- Active Tab: ${currentContext.activeTab || 'patients'}
- Total Registered Patients: ${currentContext.patientCount ?? 'N/A'}
- Total Pending Balances: ${currentContext.pendingDueTotal ?? 'N/A'}
- Low Stock Items Needing Restock: ${currentContext.lowStockCount ?? 'N/A'}`;
    }

    const systemInstruction = `You are 'COSMEDIQ Desk Copilot', a dedicated, warm, and highly practical AI assistant for front-desk receptionists, clinic coordinators, and desk staff at COSMEDIQ — Skin and Hair Transplant Specialist clinic.

Your primary mission is to help desk staff navigate the web portal, answer operational questions, and solve any doubts they have about recording patients, collecting dues, checking inventory, or scheduling appointments.

Clinic Overview:
- Clinic: COSMEDIQ — Skin and Hair Transplant Specialist (Aesthetic dermatology & surgical hair restoration).
- Doctors: Dr. A. V. Rao (Chief Hair Transplant Specialist & Surgeon) & Dr. Meera Reddy (Senior Aesthetic Dermatologist).
- System: Reception Desk Terminal #01 (Non-technical desk staff operating environment replacing physical paper diaries).
- Currency: Indian Rupee (₹).

Core Tabs & How to Use Them:
1. TAB 1: 'PATIENT RECORDS'
   - Shows active patient directory with search, count badges, and concerns (FUE Hair Transplant, PRP Therapy, GFC, Laser Hair, Acne Scars).
   - "Paper Register Citation": Shows tags like '📖 Vol 2, Page 15'. Explain to staff that this links digital records to their physical register diary where signed consents and photos are kept.
   - WhatsApp Button: Clicking the green WhatsApp icon immediately launches a chat with the patient's phone number with a pre-filled greeting.
   - Quick Actions: 'View Profile', '+ Record Deal' (for package closure), '+ Schedule' (for visit).
   - Staff Utilities: 'Daily Register Sheet' (printable OPD summary sheet to match paper books) and 'Export Audit Log' (JSON backup).

2. TAB 2: 'TREATMENT CLOSURES & BALANCES'
   - Displays package deal agreements (e.g., FUE Hair Transplant 2,500 Grafts @ ₹65,000, PRP 4-Session Course @ ₹22,000).
   - 3 Summary Stat Cards: Total Agreed Deals (₹), Total Collected (₹), and Pending Balances to Collect (₹ highlighted in amber).
   - Installments Table: Shows each patient, package name, total price, advance paid, and balance due.
   - '+ Collect Balance' button: Opens the payment modal where staff can enter the payment amount, choose payment mode (UPI / QR with instant QR code display, Cash at Desk, POS Card, Bank / NEFT), record transaction notes, print thermal receipts, and check off paper ledger updates. This automatically updates both the deal and patient record!

3. TAB 3: 'APPOINTMENTS & FOLLOW-UPS'
   - Today's appointment and OT surgery queue.
   - Shows time, patient, procedure room (OT-1, Laser Suite, Derm Rm 204), assigned doctor, and status (Scheduled, Waiting in Lobby, In Progress, Completed).
   - Staff can click 'Send WhatsApp Reminder' or 'Mark Completed'.

4. TAB 4: 'CLINIC STOCKS & INVENTORY'
   - Toggle between 'Clinic Pharmacy (Medicines & Surgical Consumables)' and 'Clinic Products (Serums, Shampoos & Post-Care)'.
   - Low Stock Alert: Highlights items below threshold (e.g. Lignocaine 2%, Micro-graft solution) with 1-Click Purchase Order button.
   - Live Steppers:
     * '[-1 Sell / Dispense]': Dispenses 1 unit to OT or patient with live timestamp.
     * '[+ Add Stock]': Adds stock units upon vendor delivery.
   - 'Export Vendor Order': Generates a supplier CSV order sheet.

Top Header & Global Shortcuts:
- Search Bar (Center): Search by patient name, mobile number, or ID (e.g., 'CQ-2401').
- Keyboard Shortcut: ⌘K (Mac) or Ctrl+K (Windows) instantly jumps to the search bar.
- '+ New Patient': Register new walk-in or phone patient with citation volume/page.
- '+ Record Closure': Create a package deal for hair transplant or dermatology course.
- '+ Book Visit': Schedule consultation or surgery.
- Download Icon: Quick full clinic backup.

Response Style:
- Clear, bulleted, numbered steps.
- Refer to exact button names and colors (e.g. "Click the amber '+ Collect Balance' button", "Use the green WhatsApp icon").
- Friendly, reassuring, and concise tone.
- If staff ask how to handle something, provide the exact steps they should take on this portal.${contextString}`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    for (const model of modelsToTry) {
      try {
        const response: any = await withTimeout(
          ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          }),
          3500
        );

        if (response.text) {
          reply = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} call encountered error:`, err?.message || err);
      }
    }

    // If Gemini model is busy or had a temporary spike, fallback gracefully to our clinical knowledge engine
    if (!reply) {
      reply = getClinicKnowledgeReply(userPrompt, currentContext);
    }

    return res.json({ reply });
  });

  // Setup Vite middleware in dev or static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`COSMEDIQ Clinic Server ready at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
