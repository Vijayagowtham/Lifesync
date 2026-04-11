import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Hospital Data
  const hospitals = [
    {
      id: "1",
      name: "City General Hospital",
      address: "123 Healthcare Ave, Downtown",
      lat: 40.7128,
      lng: -74.006,
      distance: 1.2,
      contact: "+1 (555) 123-4567",
      availability: {
        beds: 15,
        icu: 4,
        doctors: 12,
        status: "High Availability"
      },
      rating: 4.8
    },
    {
      id: "2",
      name: "St. Mary's Medical Center",
      address: "456 Wellness Blvd, Northside",
      lat: 40.7282,
      lng: -73.9942,
      distance: 3.5,
      contact: "+1 (555) 987-6543",
      availability: {
        beds: 5,
        icu: 1,
        doctors: 8,
        status: "Limited Availability"
      },
      rating: 4.5
    },
    {
      id: "3",
      name: "LifeCare Specialist Clinic",
      address: "789 Recovery Rd, West End",
      lat: 40.705,
      lng: -74.015,
      distance: 0.8,
      contact: "+1 (555) 456-7890",
      availability: {
        beds: 20,
        icu: 6,
        doctors: 15,
        status: "High Availability"
      },
      rating: 4.9
    },
    {
      id: "4",
      name: "Metropolitan Emergency Hub",
      address: "321 Urgent Way, Eastside",
      lat: 40.72,
      lng: -73.98,
      distance: 5.2,
      contact: "+1 (555) 222-3333",
      availability: {
        beds: 2,
        icu: 0,
        doctors: 5,
        status: "Critical"
      },
      rating: 4.2
    }
  ];

  // Mock Ambulance Data
  const ambulances = [
    {
      id: "amb-1",
      driverName: "John Smith",
      contact: "+1 (555) 001-0022",
      location: { lat: 40.715, lng: -74.008 },
      status: "available"
    },
    {
      id: "amb-2",
      driverName: "Sarah Connor",
      contact: "+1 (555) 001-0033",
      location: { lat: 40.725, lng: -73.995 },
      status: "en-route"
    },
    {
      id: "amb-3",
      driverName: "Mike Ross",
      contact: "+1 (555) 001-0044",
      location: { lat: 40.708, lng: -74.012 },
      status: "busy"
    }
  ];

  // API Routes
  app.get("/api/hospitals", (req, res) => {
    res.json(hospitals);
  });

  app.get("/api/ambulances", (req, res) => {
    res.json(ambulances);
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
