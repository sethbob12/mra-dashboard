// DynamicGlobe.js
import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox'; // Note: v8+ requires this import path.
import 'mapbox-gl/dist/mapbox-gl.css'; // include default Mapbox styles
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

const DynamicGlobe = ({ reviewers }) => {
  // Use your provided access token and style URL:
  const mapboxToken = "pk.eyJ1Ijoic2V0aGJvYjEyIiwiYSI6ImNtOGk3cnhmbzA0NHcya3B4NzU2dGp6MWsifQ.E_sGAdTOTstPjMPFRxJA-A";
  const mapStyle = "mapbox://styles/sethbob12/cm8ibrhhg01cb01s5h3kk9ddz";

  // Set initial view state (globe projection) with auto-rotation
  const [viewState, setViewState] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 1.5,
    bearing: 0,
    pitch: 0
  });

  const [selectedReviewer, setSelectedReviewer] = useState(null);

  // Auto-rotate the globe by updating the bearing every 100ms.
  useEffect(() => {
    const interval = setInterval(() => {
      setViewState((prevState) => ({
        ...prevState,
        bearing: (prevState.bearing + 0.5) % 360
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ width: '100%', height: 500 }}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
        projection="globe"
      >
        {/* Optional: Include navigation controls */}
        <NavigationControl position="top-right" />

        {reviewers.map((reviewer) => {
          const { latitude, longitude } = reviewer.location || {};
          if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
          return (
            <Marker
              key={reviewer.mra_id}
              latitude={latitude}
              longitude={longitude}
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
        })}

        {selectedReviewer && selectedReviewer.location && (
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
                Workload: {selectedReviewer.currentWorkload}
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

export default DynamicGlobe;
