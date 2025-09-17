import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Create custom icons for different collaboration strengths
const createCustomIcon = (color: string, isMain = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${isMain ? '20px' : '16px'};
      height: ${isMain ? '20px' : '16px'};
      border-radius: 50%;
      background-color: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    "></div>`,
    iconSize: [isMain ? 20 : 16, isMain ? 20 : 16],
    iconAnchor: [isMain ? 10 : 8, isMain ? 10 : 8],
  });
};

// Collaboration data with real coordinates
const collaborations = [
  {
    id: 'fsb-usa',
    source: { name: 'Vietnam (FSB)', coordinates: [10.8231, 106.6297] as [number, number] },
    target: { name: 'United States', coordinates: [40.7128, -74.0060] as [number, number] },
    strength: 'high' as const,
    projectCount: 12,
    institutions: ['Harvard University', 'MIT', 'Stanford University']
  },
  {
    id: 'fsb-uk',
    source: { name: 'Vietnam (FSB)', coordinates: [10.8231, 106.6297] as [number, number] },
    target: { name: 'United Kingdom', coordinates: [51.5074, -0.1278] as [number, number] },
    strength: 'medium' as const,
    projectCount: 8,
    institutions: ['University of Oxford', 'London School of Economics', 'Imperial College London']
  },
  {
    id: 'fsb-singapore',
    source: { name: 'Vietnam (FSB)', coordinates: [10.8231, 106.6297] as [number, number] },
    target: { name: 'Singapore', coordinates: [1.3521, 103.8198] as [number, number] },
    strength: 'high' as const,
    projectCount: 15,
    institutions: ['National University of Singapore', 'Nanyang Technological University']
  },
  {
    id: 'fsb-japan',
    source: { name: 'Vietnam (FSB)', coordinates: [10.8231, 106.6297] as [number, number] },
    target: { name: 'Japan', coordinates: [35.6762, 139.6503] as [number, number] },
    strength: 'medium' as const,
    projectCount: 6,
    institutions: ['University of Tokyo', 'Keio University', 'Waseda University']
  },
  {
    id: 'fsb-australia',
    source: { name: 'Vietnam (FSB)', coordinates: [10.8231, 106.6297] as [number, number] },
    target: { name: 'Australia', coordinates: [-33.8688, 151.2093] as [number, number] },
    strength: 'low' as const,
    projectCount: 4,
    institutions: ['University of Sydney', 'UNSW Sydney', 'Macquarie University']
  }
];

// Custom component for curved animated connection lines using Leaflet's built-in curve library
const CurvedConnectionLine: React.FC<{
  map: L.Map;
  sourceCoords: [number, number];
  targetCoords: [number, number];
  color: string;
  weight: number;
  id: string;
}> = ({ map, sourceCoords, targetCoords, color, weight, id }) => {
  useEffect(() => {
    // Use a timeout to ensure map is fully loaded
    const timer = setTimeout(() => {
      // Remove existing polyline if it exists
      const existingLayer = (map as any)._layers;
      Object.keys(existingLayer).forEach(layerKey => {
        const layer = existingLayer[layerKey];
        if (layer.options && layer.options.curveId === id) {
          map.removeLayer(layer);
        }
      });

      // Create curved path using bezier curve approximation with multiple points
      const createCurvedPath = (start: [number, number], end: [number, number]) => {
        const points = [];
        const steps = 50;
        
        // Calculate control point for curve
        const midLat = (start[0] + end[0]) / 2;
        const midLng = (start[1] + end[1]) / 2;
        
        // Add arc height based on distance, but make it smarter for ocean routes
        const distance = Math.sqrt(
          Math.pow(end[0] - start[0], 2) + 
          Math.pow(end[1] - start[1], 2)
        );
        
        // Reduce arc height significantly and adjust direction based on geography
        const arcHeight = distance * 0.15; // Much lower arc
        
        // For trans-Pacific routes, curve southward; for trans-Atlantic, northward
        const isTransPacific = (start[1] > 90 && end[1] < -90) || (start[1] < -90 && end[1] > 90);
        const controlLatOffset = isTransPacific ? -arcHeight : arcHeight;
        
        const controlLat = midLat + controlLatOffset;
        const controlLng = midLng;
        
        // Generate bezier curve points
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const lat = Math.pow(1 - t, 2) * start[0] + 
                    2 * (1 - t) * t * controlLat + 
                    Math.pow(t, 2) * end[0];
          const lng = Math.pow(1 - t, 2) * start[1] + 
                    2 * (1 - t) * t * controlLng + 
                    Math.pow(t, 2) * end[1];
          points.push([lat, lng] as [number, number]);
        }
        
        return points;
      };

      const curvedPoints = createCurvedPath(sourceCoords, targetCoords);
      
      // Create animated polyline with custom options
      const polyline = L.polyline(curvedPoints, {
        color: color,
        weight: Math.max(2, weight - 1), // Slightly thinner lines
        opacity: 0.6, // More transparent
        dashArray: '8, 12', // Shorter dashes
        className: 'animated-curve-line',
        curveId: id // Custom property for identification
      } as any);
      
      // Add to map
      polyline.addTo(map);
      
      // Add CSS animation class for flowing effect
      setTimeout(() => {
        const pathElement = document.querySelector(`.animated-curve-line path`);
        if (pathElement) {
          (pathElement as HTMLElement).style.animation = 'dashFlow 3s linear infinite';
          (pathElement as HTMLElement).style.filter = `drop-shadow(0 0 8px ${color}80)`;
        }
      }, 100);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [map, sourceCoords, targetCoords, color, weight, id]);

  return null;
};

const WorldMap: React.FC = () => {
  const [map, setMap] = React.useState<L.Map | null>(null);
  
  useEffect(() => {
    // Fix for default marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerRetina,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);

  // Set default zoom view centered on Vietnam
  useEffect(() => {
    if (map) {
      setTimeout(() => {
        // Center on Southeast Asia to show Vietnam prominently
        map.setView([15, 105], 3.0);
      }, 300);
    }
  }, [map]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return '#00ff88'; // Neon green
      case 'medium': return '#00bcd4'; // Cyan  
      case 'low': return '#9c27b0'; // Purple
      default: return '#00bcd4';
    }
  };

  const getLineWeight = (strength: string) => {
    switch (strength) {
      case 'high': return 4;
      case 'medium': return 3;
      case 'low': return 2;
      default: return 3;
    }
  };

  // FSB headquarters marker
  const fsbIcon = createCustomIcon('#ff0080', true); // Hot pink neon for FSB
  const fsbPosition: [number, number] = [10.8231, 106.6297];

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[15, 105]}
        zoom={3.0}
        minZoom={2.0}
        maxZoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        worldCopyJump={true}
        maxBounds={[[-70, -180], [80, 180]]}
        maxBoundsViscosity={1.0}
        bounceAtZoomLimits={true}
        wheelPxPerZoomLevel={120}
        ref={setMap}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution=""
          noWrap={true}
          maxZoom={19}
          bounds={[[-70, -180], [80, 180]]}
          keepBuffer={1}
          updateWhenIdle={false}
          updateWhenZooming={true}
          updateInterval={100}
        />
        
        {/* FSB Headquarters Marker */}
        <Marker position={fsbPosition} icon={fsbIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-orange-900">Vietnam (FSB)</h3>
              <p className="text-sm text-gray-600">Foreign Studies Bank Headquarters</p>
              <p className="text-xs mt-2">Total Partnerships: {collaborations.length}</p>
            </div>
          </Popup>
        </Marker>

        {/* Collaboration markers and lines */}
        {collaborations.map((collab) => {
          const targetIcon = createCustomIcon(getStrengthColor(collab.strength));
          
          return (
            <React.Fragment key={collab.id}>
              {/* Curved animated connection line */}
              {map && (
                <CurvedConnectionLine
                  map={map}
                  sourceCoords={collab.source.coordinates}
                  targetCoords={collab.target.coordinates}
                  color={getStrengthColor(collab.strength)}
                  weight={getLineWeight(collab.strength)}
                  id={collab.id}
                />
              )}
              
              {/* Target marker */}
              <Marker position={collab.target.coordinates} icon={targetIcon}>
                <Popup>
                  <div className="p-2 max-w-xs">
                    <h3 className="font-bold text-blue-900">{collab.target.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {collab.strength.charAt(0).toUpperCase() + collab.strength.slice(1)} Partnership
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Projects:</strong> {collab.projectCount}
                    </p>
                    <div className="text-xs">
                      <strong>Institutions:</strong>
                      <ul className="mt-1 space-y-1">
                        {collab.institutions.map((inst, idx) => (
                          <li key={idx} className="text-gray-600">• {inst}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default WorldMap;