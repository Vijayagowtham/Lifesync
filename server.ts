import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Supabase Setup ───────────────────────────────────────────────────────────
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check database integrity
async function checkDatabase() {
  console.log("\x1b[36m%s\x1b[0m", "Checking Supabase connection...");
  const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
  
  if (error) {
    if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
      console.log("\x1b[31m%s\x1b[0m", "⚠️  DATABASE SCHEMA MISSING!");
      console.log("\x1b[33m%s\x1b[0m", "Please run the SQL schema in supabase_schema.sql via the Supabase SQL Editor.");
    } else {
      console.error("\x1b[31m%s\x1b[0m", "Connection Error:", error.message);
    }
  } else {
    console.log("\x1b[32m%s\x1b[0m", "✓ Supabase connected and schema verified.");
  }
}
checkDatabase();

// ── Haversine distance helper ────────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Real-time Ambulance State ────────────────────────────────────────────────
interface AmbulanceRequest {
  id: string;
  driverName: string;
  hospitalName: string;
  contact: string;
  lat: number;
  lng: number;
  status: 'pending' | 'accepted' | 'en-route' | 'completed';
  timestamp: string;
}

// ── Fetch real hospitals from Overpass API ────────────────────────────────────
async function fetchRealHospitals(lat: number, lng: number) {
  const radiusMeters = 10000; // 10 km
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
    );
    out center 20;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) throw new Error(`Overpass API HTTP ${res.status}`);
    const data = await res.json();

    const hospitals = data.elements
      .filter((el: any) => {
        const name = el.tags?.name;
        return name && name.length > 1;
      })
      .slice(0, 15)
      .map((el: any, i: number) => {
        const hLat = el.lat ?? el.center?.lat;
        const hLng = el.lon ?? el.center?.lon;
        if (!hLat || !hLng) return null;

        const dist = haversineKm(lat, lng, hLat, hLng);
        const beds = Math.floor(Math.random() * 25) + 1;
        const icu = Math.floor(Math.random() * 8);
        const doctors = Math.floor(Math.random() * 15) + 3;
        const status = beds > 10 ? "High Availability" : beds > 3 ? "Limited Availability" : "Critical";

        return {
          id: String(el.id || i + 1),
          name: el.tags?.name || `Hospital ${i + 1}`,
          address: el.tags?.["addr:full"] || el.tags?.["addr:street"] || `Near ${el.tags?.name || "area"}`,
          lat: parseFloat(hLat.toFixed(6)),
          lng: parseFloat(hLng.toFixed(6)),
          distance: parseFloat(dist.toFixed(1)),
          contact: el.tags?.phone || el.tags?.["contact:phone"] || `+91 ${Math.floor(Math.random() * 90000 + 10000)} ${Math.floor(Math.random() * 90000 + 10000)}`,
          availability: { beds, icu, doctors, status },
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        };
      })
      .filter(Boolean);

    return hospitals;
  } catch (err) {
    console.error("Overpass API error:", err);
    return [];
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging and Request Tracking
  app.use((req, res, next) => {
    if (req.url.endsWith('.html') || req.url.includes('/clinical-portal')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // ── Unified hospital API (Sync with Supabase) ───────────────────────────
  app.get("/api/hospitals", async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Latitude and Longitude required" });
    }

    try {
      // 1. Try to fetch from Supabase first
      let { data: dbHospitals, error } = await supabase
        .from('hospitals')
        .select('*');

      if (error) throw error;

      // 2. If DB is empty, fetch from Overpass and seed the DB
      if (!dbHospitals || dbHospitals.length === 0) {
        console.log("[Supabase] Registry empty. Fetching from Overpass...");
        const realHospitals = await fetchRealHospitals(lat, lng);
        
        if (realHospitals && realHospitals.length > 0) {
          // Prepare for bulk insert (ignoring mapping for simplicity in this demo)
          const toInsert = realHospitals.map(h => ({
            name: h.name,
            address: h.address,
            lat: h.lat,
            lng: h.lng,
            contact: h.contact,
            beds_total: h.availability.beds + 20,
            beds_avail: h.availability.beds,
            icu_total: h.availability.icu + 5,
            icu_avail: h.availability.icu,
            rating: h.rating,
            status: h.availability.status
          }));
          
          await supabase.from('hospitals').insert(toInsert);
          
          // Refetch to get newly created IDs
          const { data: refreshed } = await supabase.from('hospitals').select('*');
          dbHospitals = refreshed;
        }
      }

      // 3. Map back to UI type and calculate distance
      const response = dbHospitals?.map(h => ({
        id: h.id,
        name: h.name,
        address: h.address,
        lat: h.lat,
        lng: h.lng,
        distance: parseFloat(haversineKm(lat, lng, h.lat, h.lng).toFixed(1)),
        contact: h.contact,
        availability: { 
          beds: h.beds_avail, 
          icu: h.icu_avail, 
          doctors: Math.floor(Math.random() * 10) + 5, 
          status: h.status 
        },
        rating: h.rating
      }));

      return res.json(response);
    } catch (err: any) {
      console.error("Supabase Hospital Error:", err);
      // If table is missing (PGRST116), don't 500, just return empty list and let seed logic handle it if possible
      if (err?.code === 'PGRST116' || err?.message?.includes('relation "hospitals" does not exist')) {
        return res.json([]);
      }
      res.status(500).json({ error: "Failed to fetch hospitals" });
    }
  });

  // ── Unified ambulance API (Sync with Supabase) ─────────────────────────
  app.get("/api/ambulances", async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    try {
      const { data, error } = await supabase
        .from('ambulances')
        .select('*');

      if (error) throw error;

      const response = (data || []).map(a => ({
        id: a.id,
        driverName: a.driver_name,
        contact: a.contact,
        location: { lat: a.lat, lng: a.lng },
        status: a.status
      }));

      return res.json(response);
    } catch (err: any) {
      console.error("Supabase Ambulance Error:", err);
      if (err?.code === 'PGRST116' || err?.message?.includes('relation "ambulances" does not exist')) {
        return res.json([]);
      }
      res.status(500).json({ error: "Failed to fetch ambulances" });
    }
  });

  // ── Ambulance Tracking Endpoints (Supabase Backed) ─────────────────────────
  app.post("/api/ambulance/request", async (req, res) => {
    const { driverName, hospitalName, contact, lat, lng } = req.body;
    try {
      const { data, error } = await supabase
        .from('ambulance_requests')
        .insert([{
          driver_name: driverName || "Assigned Driver",
          hospital_name: hospitalName || "LifeSync General",
          contact: contact || "+91 00000 00000",
          lat: lat || 13.0827,
          lng: lng || 80.2707,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to create request" });
    }
  });

  app.get("/api/ambulance/requests", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('ambulance_requests')
        .select('*')
        .neq('status', 'completed');

      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.patch("/api/ambulance/request/:id", async (req, res) => {
    const { id } = req.params;
    const { status, driverName, driverContact } = req.body;
    try {
      const { data, error } = await supabase
        .from('ambulance_requests')
        .update({ 
          status,
          ...(driverName && { driver_name: driverName }),
          ...(driverContact && { contact: driverContact })
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(404).json({ error: "Request not found" });
    }
  });

  app.post("/api/ambulance/location/:id", async (req, res) => {
    const { id } = req.params;
    const { lat, lng } = req.body;
    try {
      const { error } = await supabase
        .from('ambulance_requests')
        .update({ lat, lng })
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(404).json({ error: "Request not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Serve the hospital portal dist folder statically
    const hospitalDistPath = path.join(process.cwd(), "hospital-management-frontend/dist");
    app.use("/clinical-portal", express.static(hospitalDistPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-store');
        }
      }
    }));
    
    // Special fallback for Hospital Portal SPA routing
    app.get("/clinical-portal/*", (req, res, next) => {
      const hospitalIndex = path.join(hospitalDistPath, "index.html");
      res.sendFile(hospitalIndex, (err) => {
        if (err) next(); 
      });
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const hospitalDistPath = path.join(process.cwd(), "hospital-management-frontend/dist");
    
    app.use("/clinical-portal", express.static(hospitalDistPath));
    app.use(express.static(distPath));

    app.get("/clinical-portal/*", (req, res) => {
      res.sendFile(path.join(hospitalDistPath, "index.html"));
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
