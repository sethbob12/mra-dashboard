// WorldMap.js
import React, { useState } from 'react';
import { Map, Marker, Popup } from 'react-map-gl/mapbox'; // Note: v8+ requires this import path.
import 'mapbox-gl/dist/mapbox-gl.css'; // necessary for map styles
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

export default function WorldMap({ reviewers }) {
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  const [selectedReviewer, setSelectedReviewer] = useState(null);

  // Set initial view state for the map
  const initialViewState = {
    latitude: 20,
    longitude: 0,
    zoom: 1.5
  };

  // Group reviewers by their coordinates.
  // We round coordinates to 4 decimal places to group very similar ones.
  const groups = reviewers.reduce((acc, reviewer) => {
    const { latitude, longitude } = reviewer.location ?? {};
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return acc;
    const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(reviewer);
    return acc;
  }, {});

  return (
    <Box sx={{ width: '100%', height: 500 }}>
      <Map
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={mapboxToken}
      >
        {/* Loop through each group */}
        {Object.values(groups).map((group) => {
          // Use the first reviewer's coordinates as the base
          const baseLat = group[0].location.latitude;
          const baseLng = group[0].location.longitude;
          return group.map((reviewer, index) => {
            let markerLat = baseLat;
            let markerLng = baseLng;
            if (group.length > 1) {
              // Apply an offset if there are multiple reviewers at the same location.
              // Adjust the offsetDistance (in degrees) as needed.
              const offsetDistance = 0.02; 
              const angle = (2 * Math.PI * index) / group.length;
              markerLat = baseLat + offsetDistance * Math.cos(angle);
              markerLng = baseLng + offsetDistance * Math.sin(angle);
            }
            return (
              <Marker
                key={reviewer.mra_id}
                latitude={markerLat}
                longitude={markerLng}
                anchor="bottom"
              >
                <div
                  style={{
                    backgroundColor: '#e74c3c',
                    borderRadius: '50%',
                    width: 12,
                    height: 12,
                    border: '2px solid #fff',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedReviewer(reviewer)}
                />
              </Marker>
            );
          });
        })}

        {/* Popup for selected reviewer */}
        {selectedReviewer?.location && (
          <Popup
            latitude={selectedReviewer.location.latitude}
            longitude={selectedReviewer.location.longitude}
            onClose={() => setSelectedReviewer(null)}
            closeOnClick={false}
            offset={[0, -10]}
          >
            <Box sx={{ p: 2, maxWidth: 250 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {selectedReviewer.name}
                </Typography>
                <IconButton onClick={() => setSelectedReviewer(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              {selectedReviewer.profilePic ? (
                <Box
                  component="img"
                  src={selectedReviewer.profilePic}
                  alt={selectedReviewer.name}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    mb: 1,
                    ml: 'auto'
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    ml: 'auto'
                  }}
                >
                  <PersonIcon sx={{ color: '#000' }} />
                </Box>
              )}
              <Typography variant="body2">
                Quality Score: {selectedReviewer.overallQualityScore}
              </Typography>
              <Typography variant="body2">
                Current Workload: {selectedReviewer.currentWorkload}
              </Typography>
              <Typography variant="body2">
                Availability: {selectedReviewer.availability}
              </Typography>
            </Box>
          </Popup>
        )}
      </Map>
    </Box>
  );
}
