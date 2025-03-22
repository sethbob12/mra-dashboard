// GlobeMap.js
import React, { useState, useCallback } from 'react';
import { Map, Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

const GlobeMap = ({ reviewers }) => {
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  const [selectedReviewer, setSelectedReviewer] = useState(null);

  const initialViewState = {
    latitude: 20,
    longitude: 0,
    zoom: 1.5
  };

  // Group reviewers by rounded coordinates (to 4 decimals)
  const groups = reviewers.reduce((acc, reviewer) => {
    const { latitude, longitude } = reviewer.location || {};
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return acc;
    const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(reviewer);
    return acc;
  }, {});

  // When the map loads, set the projection to globe.
  const handleMapLoad = useCallback((e) => {
    const map = e.target;
    if (map.setProjection) {
      map.setProjection({ name: 'globe' });
    }
  }, []);

  return (
    <Box sx={{ width: '100%', height: 500 }}>
      <Map
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/sethbob12/cm8ibrhhg01cb01s5h3kk9ddz"
        mapboxAccessToken={mapboxToken}
        onLoad={handleMapLoad}
      >
        {/* Render grouped markers (with slight offsets if more than one reviewer per location) */}
        {Object.values(groups).map((group) => {
          const baseLat = group[0].location.latitude;
          const baseLng = group[0].location.longitude;
          return group.map((reviewer, index) => {
            let markerLat = baseLat;
            let markerLng = baseLng;
            if (group.length > 1) {
              const offsetDistance = 0.02; // adjust this value as needed
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
                  sx={{ width: 60, height: 60, borderRadius: '50%', mb: 1, ml: 'auto' }}
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
};

export default GlobeMap;
