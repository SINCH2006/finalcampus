import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface MapContainerProps {
  vehicles?: Array<{
    id: string;
    location: { lat: number; lng: number };
    name?: string;
    status?: string;
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    label: string;
    color?: string;
  }>;
}

export default function MapContainer({ vehicles, center, zoom = 12, markers }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);

  useEffect(() => {
    // Check if token is in localStorage
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    } else {
      setShowTokenInput(true);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: center ? [center.lng, center.lat] : [-74.0060, 40.7128],
        zoom: zoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add vehicle markers
      if (vehicles) {
        vehicles.forEach((vehicle) => {
          const el = document.createElement('div');
          el.className = 'vehicle-marker';
          el.innerHTML = `
            <div style="
              background: hsl(var(--primary));
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              cursor: pointer;
            ">🚌</div>
          `;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <strong>${vehicle.name || vehicle.id}</strong><br/>
              <span style="color: #666;">${vehicle.status || 'Active'}</span>
            </div>`
          );

          new mapboxgl.Marker(el)
            .setLngLat([vehicle.location.lng, vehicle.location.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });
      }

      // Add custom markers
      if (markers) {
        markers.forEach((marker) => {
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.backgroundColor = marker.color || 'hsl(var(--accent))';
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

          const popup = new mapboxgl.Popup({ offset: 15 }).setText(marker.label);

          new mapboxgl.Marker(el)
            .setLngLat([marker.lng, marker.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });
      }

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Mapbox initialization error:', error);
      setShowTokenInput(true);
    }
  }, [vehicles, center, zoom, markers, mapboxToken]);

  const handleSaveToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken);
      setShowTokenInput(false);
      window.location.reload();
    }
  };

  if (showTokenInput) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border p-8">
        <div className="max-w-md w-full space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Mapbox Token Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To display maps, please enter your Mapbox public token. Get one free at{' '}
                <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  mapbox.com
                </a>
              </p>
            </div>
          </div>
          <Input
            type="text"
            placeholder="pk.eyJ1Ijoi..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="font-mono text-sm"
          />
          <Button onClick={handleSaveToken} className="w-full">
            Save Token & Load Map
          </Button>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full rounded-lg" />;
}
