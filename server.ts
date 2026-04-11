import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// ── Generate realistic mock data near a location ─────────────────────────────
function generateNearbyHospitals(lat: number, lng: number) {
  const hospitalNames = [
    "City General Hospital",
    "St. Mary's Medical Center",
    "LifeCare Specialist Clinic",
    "Metropolitan Emergency Hub",
    "Apollo Health Center",
    "Green Cross Hospital",
    "Sunrise Medical Institute",
    "PrimeCare Hospital",
  ];

  return hospitalNames.map((name, i) => {
    // Scatter hospitals 1–8 km around the user
    const angle = (i / hospitalNames.length) * 2 * Math.PI;
    const radiusKm = 1 + Math.random() * 7;
    const dLat = (radiusKm / 111) * Math.cos(angle);
    const dLng = (radiusKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    const hLat = lat + dLat;
    const hLng = lng + dLng;

    const beds = Math.floor(Math.random() * 25) + 1;
    const icu = Math.floor(Math.random() * 8);
    const doctors = Math.floor(Math.random() * 15) + 3;
    const status = beds > 10 ? "High Availability" : beds > 3 ? "Limited Availability" : "Critical";

    return {
      id: String(i + 1),
      name,
      address: `${Math.floor(Math.random() * 999) + 1} Medical Ave, Area ${i + 1}`,
      lat: parseFloat(hLat.toFixed(6)),
      lng: parseFloat(hLng.toFixed(6)),
      distance: parseFloat(haversineKm(lat, lng, hLat, hLng).toFixed(1)),
      contact: `+91 ${Math.floor(Math.random() * 90000 + 10000)} ${Math.floor(Math.random() * 90000 + 10000)}`,
      availability: { beds, icu, doctors, status },
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    };
  });
}

function generateNearbyAmbulances(lat: number, lng: number) {
  const drivers = [
    "Ravi Kumar", "Priya Sharma", "Arjun Reddy",
    "Sneha Patel", "Manoj Singh",
  ];
  const statuses: Array<"available" | "en-route" | "busy"> = ["available", "en-route", "busy"];

  return drivers.map((name, i) => {
    const angle = (i / drivers.length) * 2 * Math.PI + Math.random();
    const radiusKm = 0.5 + Math.random() * 4;
    const dLat = (radiusKm / 111) * Math.cos(angle);
    const dLng = (radiusKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);

    return {
      id: `amb-${i + 1}`,
      driverName: name,
      contact: `+91 ${Math.floor(Math.random() * 90000 + 10000)} ${Math.floor(Math.random() * 90000 + 10000)}`,
      location: {
        lat: parseFloat((lat + dLat).toFixed(6)),
        lng: parseFloat((lng + dLng).toFixed(6)),
      },
      status: statuses[i % statuses.length],
    };
  });
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

    if (hospitals.length >= 3) return hospitals;
    return null; // fallback to mock
  } catch (err) {
    console.error("Overpass API error, falling back to mock data:", err);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ── Location-aware hospital API ──────────────────────────────────────────
  app.get("/api/hospitals", async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (!isNaN(lat) && !isNaN(lng)) {
      // Try to fetch real hospitals first
      const realHospitals = await fetchRealHospitals(lat, lng);
      if (realHospitals) {
        return res.json(realHospitals);
      }
      // Fallback: generate realistic mock data near the user
      return res.json(generateNearbyHospitals(lat, lng));
    }

    // No location provided, return generic data (shouldn't happen normally)
    return res.json(generateNearbyHospitals(13.0827, 80.2707));
  });

  // ── Location-aware ambulance API ─────────────────────────────────────────
  app.get("/api/ambulances", (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (!isNaN(lat) && !isNaN(lng)) {
      return res.json(generateNearbyAmbulances(lat, lng));
    }

    return res.json(generateNearbyAmbulances(13.0827, 80.2707));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
