import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../../supabase';

// ── Custom Icons ─────────────────────────────────────────────────────────────

// Driver live position — green pulse
const driverPulseIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;">
      <div style="position:absolute;width:44px;height:44px;background:rgba(16,185,129,0.18);border-radius:50%;animation:ping 1.4s ease-in-out infinite;"></div>
      <div style="position:absolute;width:30px;height:30px;background:rgba(16,185,129,0.28);border-radius:50%;animation:pulse 2s ease-in-out infinite;"></div>
      <div style="position:relative;width:18px;height:18px;background:#10b981;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 0 3px rgba(16,185,129,0.3),0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;">
        <div style="width:6px;height:6px;background:#fff;border-radius:50%;"></div>
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

// Hospital pin — red cross
const hospitalIcon = L.divIcon({
  className: '',
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:36px;height:36px;background:#dc2626;border-radius:50% 50% 50% 4px;border:2.5px solid #fff;box-shadow:0 4px 14px rgba(220,38,38,0.4);display:flex;align-items:center;justify-content:center;transform:rotate(-45deg);">
        <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="10" y="4" width="4" height="16" rx="1.5" fill="white"/>
            <rect x="4" y="10" width="16" height="4" rx="1.5" fill="white"/>
          </svg>
        </div>
      </div>
      <div style="width:2px;height:8px;background:#dc2626;margin-top:-2px;"></div>
    </div>
  `,
  iconSize: [36, 52],
  iconAnchor: [18, 52],
});

// Emergency patient / SOS pin — red pulsing
const patientPulseIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:52px;height:52px;">
      <div style="position:absolute;width:52px;height:52px;background:rgba(239,68,68,0.15);border-radius:50%;animation:ping 1s ease-in-out infinite;"></div>
      <svg width="32" height="40" viewBox="0 0 34 42" fill="none" style="position:relative;filter:drop-shadow(0 4px 12px rgba(239,68,68,0.5));">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="#ef4444"/>
        <circle cx="17" cy="17" r="8" fill="white"/>
        <rect x="14" y="9" width="6" height="16" rx="2" fill="#ef4444"/>
        <rect x="9" y="14" width="16" height="6" rx="2" fill="#ef4444"/>
      </svg>
    </div>
  `,
  iconSize: [52, 52],
  iconAnchor: [26, 52],
});

// ── Map auto-pan controller ──────────────────────────────────────────────────
const MapController = ({ center, driverLocation, patientLocation }) => {
  const map = useMap();
  React.useEffect(() => {
    if (patientLocation && driverLocation) {
      const bounds = L.latLngBounds(
        [driverLocation.lat, driverLocation.lng],
        [patientLocation.lat, patientLocation.lng]
      );
      map.fitBounds(bounds, { padding: [80, 80], animate: true });
    } else if (driverLocation) {
      map.flyTo([driverLocation.lat, driverLocation.lng], 14, { animate: true, duration: 1.2 });
    } else if (center) {
      map.flyTo(center, map.getZoom(), { animate: true, duration: 0.8 });
    }
  }, [driverLocation?.lat, driverLocation?.lng, patientLocation?.lat, center?.[0]]);
  return null;
};

// ── Main MapView Component ────────────────────────────────────────────────────
// Supports two usage modes:
//   1. Driver HUD:     <MapView driverLocation={...} patientLocation={...} activeRide={...} />
//   2. User Dashboard: <MapView center={[lat,lng]} zoom={13} markers={hospitalsArray} />
export default function MapView({ driverLocation, patientLocation, activeRide, center, zoom = 13, markers = [] }) {
  const [hospitals, setHospitals] = React.useState([]);
  const [ambulances, setAmbulances] = React.useState([]);

  // Determine initial map center
  const initialCenter = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : center || [13.0827, 80.2707];

  const initialZoom = driverLocation ? 12 : zoom;

  // Fetch real hospital locations from Supabase
  React.useEffect(() => {
    const fetchHospitals = async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, address, lat, lng, beds_avail, icu_avail, status')
        .not('lat', 'is', null)
        .not('lng', 'is', null);
      if (error) console.error('[MapView] Hospital fetch error:', error);
      console.log('[MapView] Hospitals loaded:', data);
      setHospitals(data || []);
    };
    fetchHospitals();
  }, []);

  // Fetch ambulances + realtime updates (driver mode only)
  React.useEffect(() => {
    if (!driverLocation) return;

    const fetchAmbs = async () => {
      const { data } = await supabase.from('ambulances').select('*');
      setAmbulances(data || []);
    };
    fetchAmbs();

    const channel = supabase.channel('maps-telemetry')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ambulances' }, (payload) => {
        setAmbulances(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [!!driverLocation]);

  const routePositions = patientLocation && driverLocation ? [
    [driverLocation.lat, driverLocation.lng],
    [patientLocation.lat, patientLocation.lng]
  ] : [];

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* ── Light Tile Layer ── */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        <ZoomControl position="bottomright" />

        {/* ── Real Hospital Markers ── */}
        {hospitals.map(hosp => (
          hosp.lat && hosp.lng && (
            <Marker
              key={hosp.id}
              position={[hosp.lat, hosp.lng]}
              icon={hospitalIcon}
            >
              <Popup className="hospital-popup">
                <div style={{ padding: '8px 4px', minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: hosp.status === 'Stable' ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
                    <p style={{ fontWeight: 800, fontSize: 12, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{hosp.name}</p>
                  </div>
                  <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px', fontWeight: 500 }}>{hosp.address}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                      🛏 {hosp.beds_avail ?? '—'} beds
                    </span>
                    <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                      ICU {hosp.icu_avail ?? '—'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* ── UserDashboard mode: extra markers array ── */}
        {markers.map(m => (
          m.lat && m.lng && (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={hospitalIcon}>
              <Popup className="hospital-popup">
                <div style={{ padding: '6px 4px' }}>
                  <p style={{ fontWeight: 800, fontSize: 12, color: '#0f172a', margin: 0 }}>{m.name}</p>
                  <p style={{ fontSize: 10, color: '#64748b', margin: '3px 0 0', fontWeight: 500 }}>{m.distance} • {m.status}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* ── Driver Mode: fleet vehicles ── */}
        {driverLocation && ambulances.map(amb => (
          amb.lat && amb.lng && (
            <Marker
              key={amb.id}
              position={[amb.lat, amb.lng]}
              icon={driverPulseIcon}
            >
              <Popup className="hospital-popup">
                <div style={{ padding: '6px 4px' }}>
                  <p style={{ fontWeight: 800, fontSize: 12, color: '#0f172a', margin: 0 }}>{amb.vehicle_no}</p>
                  <p style={{ fontSize: 10, color: '#10b981', fontWeight: 700, margin: '2px 0 0', textTransform: 'uppercase' }}>{amb.status}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* ── Patient / SOS Pin ── */}
        {patientLocation && (
          <>
            <Marker position={[patientLocation.lat, patientLocation.lng]} icon={patientPulseIcon}>
              <Popup className="hospital-popup">
                <div style={{ padding: '6px 4px' }}>
                  <p style={{ fontWeight: 800, fontSize: 12, color: '#ef4444', margin: 0 }}>🚨 Emergency Signal</p>
                  <p style={{ fontSize: 10, color: '#64748b', margin: '3px 0 0', fontWeight: 500 }}>{patientLocation.address}</p>
                </div>
              </Popup>
            </Marker>

            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#ef4444',
                weight: 4,
                opacity: 0.75,
                dashArray: '10, 14',
                lineCap: 'round'
              }}
            />
          </>
        )}

        <MapController
          center={center}
          driverLocation={driverLocation}
          patientLocation={patientLocation}
        />
      </MapContainer>

      {/* Keyframe styles for icons */}
      <style>{`
        @keyframes ping {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.2; }
        }
        .hospital-popup .leaflet-popup-content-wrapper {
          background: #ffffff;
          border-radius: 16px;
          padding: 4px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
          border: none;
        }
        .hospital-popup .leaflet-popup-tip {
          background: #ffffff;
          box-shadow: none;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
          font-size: 16px !important;
          top: 8px !important;
          right: 8px !important;
        }
      `}</style>
    </div>
  );
};
