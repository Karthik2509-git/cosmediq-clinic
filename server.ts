











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
    // For test week: Clean database with 0 mock patients/deals/appointments/stock
    const cleanDb: ClinicDatabase = {
      patients: [],
      deals: [],
      appointments: [],
      inventory: [],
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
      inventory: [],
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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'COSMEDIQ Clinic Management System',
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

  // Database API: Clear all data for Clean Test Week (0 mock patients / stock)
  app.post('/api/clear-all', async (_req: Request, res: Response) => {
    try {
      const cleanDb: ClinicDatabase = {
        patients: [],
        deals: [],
        appointments: [],
        inventory: [],
        dispensationLogs: [],
        isCleanTestWeek: true,
        lastUpdated: new Date().toISOString(),
      };
      await fs.promises.writeFile(DB_FILE, JSON.stringify(cleanDb, null, 2), 'utf-8');
      res.json({
        success: true,
        message: 'Clinic database initialized to Clean Test Week state (0 patients, 0 deals, 0 appointments, 0 stock).',
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
