import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, Navigation, MapPin, LocateFixed } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon (broken by bundlers)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
  onLocationChange: (lat: number, lng: number) => void;
}

// Reverse geocode using Nominatim (free, no API key)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await resp.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India center
const DEFAULT_ZOOM = 5;
const LOCATED_ZOOM = 17;

export default function LocationPicker({ address, onAddressChange, onLocationChange }: LocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Place or move marker and reverse-geocode
  const placeMarker = useCallback(
    async (lat: number, lng: number, panTo = true) => {
      setCoords({ lat, lng });
      onLocationChange(lat, lng);
      setShowStreetView(true);

      if (mapRef.current) {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true })
            .addTo(mapRef.current)
            .bindPopup('📍 Your Cafe Location')
            .openPopup();

          // Allow dragging the marker
          markerRef.current.on('dragend', async () => {
            const pos = markerRef.current!.getLatLng();
            setCoords({ lat: pos.lat, lng: pos.lng });
            onLocationChange(pos.lat, pos.lng);
            const addr = await reverseGeocode(pos.lat, pos.lng);
            onAddressChange(addr);
          });
        }

        if (panTo) {
          mapRef.current.flyTo([lat, lng], LOCATED_ZOOM, { duration: 1.2 });
        }
      }

      const addr = await reverseGeocode(lat, lng);
      onAddressChange(addr);
    },
    [onAddressChange, onLocationChange]
  );

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Click to place marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    // Resize fix
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        placeMarker(latitude, longitude);
        setLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Unable to get your location. Please allow location access.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Address field */}
      <div className="space-y-2">
        <Label>Cafe Address *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-orange-500" />
          <Input
            className="pl-10"
            placeholder="Click on map or use GPS to set your cafe location"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
        </div>
      </div>

      {/* Current Location button */}
      <Button
        type="button"
        variant="outline"
        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
        onClick={handleCurrentLocation}
        disabled={locating}
      >
        {locating ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Detecting your location...
          </>
        ) : (
          <>
            <Navigation className="mr-2 size-4" />
            Use Current Location
          </>
        )}
      </Button>

      {/* Interactive Map */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <LocateFixed className="size-3" />
          Click on the map to set your cafe location, or drag the marker to adjust
        </p>
        <div
          ref={mapContainerRef}
          className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm"
          style={{ height: '300px', width: '100%', zIndex: 0 }}
        />
      </div>

      {/* Google Street View */}
      {showStreetView && coords && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="size-4 text-orange-500" />
            Street View
          </Label>
          <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
            <iframe
              title="Google Street View"
              width="100%"
              height="280"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed?pb=!4v0!6m8!1m7!1s!2m2!1d${coords.lat}!2d${coords.lng}!3f0!4f0!5f0.7820865974627469`}
              allowFullScreen
            />
          </div>
          <p className="text-xs text-gray-400 text-center">
            Street View may not be available for all locations
          </p>
        </div>
      )}
    </div>
  );
}
