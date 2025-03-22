// src/WorldMap.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Map, Marker, Popup, Source, Layer } from 'react-map-gl/mapbox'; // v8+ requires this import path.
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Box,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

// Simple sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function WorldMap({ reviewers }) {
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const [activeCountry, setActiveCountry] = useState(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPerformanceLayer, setShowPerformanceLayer] = useState(true);

  // Compute start and end dates for the reports (past 60 days)
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const startDate = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Global initial view state (wrapped in useMemo so it doesn’t change on every render)
  const initialViewState = useMemo(() => ({
    latitude: 20,
    longitude: 0,
    zoom: 1.5
  }), []);

  // Group reviewers by nearly identical coordinates (rounded to 4 decimals)
  const groups = useMemo(() => {
    return reviewers.reduce((acc, reviewer) => {
      const { latitude, longitude } = reviewer.location ?? {};
      if (typeof latitude !== 'number' || typeof longitude !== 'number') return acc;
      const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(reviewer);
      return acc;
    }, {});
  }, [reviewers]);

  // Determine marker color based on overall quality score:
  // <75: red, 75 to <90: yellow, 90+: green
  const getMarkerColor = (quality) => {
    if (quality < 75) return "#e74c3c";
    if (quality < 90) return "#f1c40f";
    return "#2ecc71";
  };

  // Compute performance metrics by country (for the performance layer overlay)
  const metricsByCountry = useMemo(() => {
    const metrics = {};
    reviewers.forEach((r) => {
      const country = r.location.country;
      if (!metrics[country]) {
        metrics[country] = { total: 0, count: 0 };
      }
      metrics[country].total += r.overallQualityScore;
      metrics[country].count++;
    });
    Object.keys(metrics).forEach((country) => {
      metrics[country].average = metrics[country].total / metrics[country].count;
    });
    return metrics;
  }, [reviewers]);

  // Define performance colors based on average quality score (<70 red, 70–84.9 yellow, 85+ green)
  const performanceColors = useMemo(() => {
    const colors = {};
    Object.keys(metricsByCountry).forEach((country) => {
      const avg = metricsByCountry[country].average;
      if (avg < 70) colors[country] = "#e74c3c";
      else if (avg < 85) colors[country] = "#f1c40f";
      else colors[country] = "#2ecc71";
    });
    return colors;
  }, [metricsByCountry]);

  // Define a performance layer style (assuming your GeoJSON has a "name" property)
  const performanceLayer = useMemo(() => ({
    id: 'performance-layer',
    type: 'fill',
    paint: {
      'fill-color': [
        "case",
        ["==", ["get", "name"], "Philippines"], performanceColors["Philippines"] || "#ccc",
        ["==", ["get", "name"], "United States of America"], performanceColors["United States"] || "#ccc",
        ["==", ["get", "name"], "Nigeria"], performanceColors["Nigeria"] || "#ccc",
        ["==", ["get", "name"], "Turkey"], performanceColors["Turkey"] || "#ccc",
        ["==", ["get", "name"], "Colombia"], performanceColors["Colombia"] || "#ccc",
        ["==", ["get", "name"], "Lithuania"], performanceColors["Lithuania"] || "#ccc",
        "#ccc"
      ],
      "fill-opacity": 0.5,
      "fill-outline-color": "#ffffff"
    }
  }), [performanceColors]);

  // Preset animation locations (with associated timezone)
  const animationLocations = useMemo(() => [
    { country: "United States", geoName: "United States of America", latitude: 33.5207, longitude: -86.8025, zoom: 4, timezone: "America/Chicago" },
    { country: "Colombia", geoName: "Colombia", latitude: 4.7110, longitude: -74.0721, zoom: 4, timezone: "America/Bogota" },
    { country: "Lithuania", geoName: "Lithuania", latitude: 54.6872, longitude: 25.2797, zoom: 4, timezone: "Europe/Vilnius" },
    { country: "Turkey", geoName: "Turkey", latitude: 41.0082, longitude: 28.9784, zoom: 4, timezone: "Europe/Istanbul" },
    { country: "Nigeria", geoName: "Nigeria", latitude: 6.5244, longitude: 3.3792, zoom: 4, timezone: "Africa/Lagos" },
    { country: "Philippines", geoName: "Philippines", latitude: 14.5995, longitude: 120.9842, zoom: 4, timezone: "Asia/Manila" }
  ], []);

  // Animation loop: global view -> fly to each location -> global view -> next...
  useEffect(() => {
    let cancelled = false;
    async function runAnimation() {
      const map = mapRef.current && mapRef.current.getMap();
      if (!map) return;
      // Start at global view
      await map.flyTo({
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        speed: 0.3,
        curve: 1.2
      });
      await sleep(3000);
      while (!cancelled && animationPlaying) {
        for (const loc of animationLocations) {
          if (cancelled || !animationPlaying) break;
          // Fly to country
          await map.flyTo({
            center: [loc.longitude, loc.latitude],
            zoom: loc.zoom,
            speed: 0.4,
            curve: 1.5
          });
          setActiveCountry(loc);
          await sleep(6000);
          setActiveCountry(null);
          // Fly back to global view
          await map.flyTo({
            center: [initialViewState.longitude, initialViewState.latitude],
            zoom: initialViewState.zoom,
            speed: 0.3,
            curve: 1.2
          });
          await sleep(3000);
        }
      }
    }
    if (animationPlaying) runAnimation();
    return () => { cancelled = true; };
  }, [animationPlaying, animationLocations, initialViewState]);

  // Render markers with offset if needed. (No per-marker local time now.)
  const renderMarkers = () => {
    return Object.values(groups).map((group) => {
      const baseLat = group[0].location.latitude;
      const baseLng = group[0].location.longitude;
      return group.map((reviewer, index) => {
        let markerLat = baseLat;
        let markerLng = baseLng;
        if (group.length > 1) {
          const offsetDistance = 0.02;
          const angle = (2 * Math.PI * index) / group.length;
          markerLat = baseLat + offsetDistance * Math.cos(angle);
          markerLng = baseLng + offsetDistance * Math.sin(angle);
        }
        const color = getMarkerColor(reviewer.overallQualityScore);
        return (
          <Marker key={reviewer.mra_id} latitude={markerLat} longitude={markerLng} anchor="bottom">
            <div
              style={{
                backgroundColor: color,
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
    });
  };

  // For the active country overlay, show performance metrics and local time (computed from the country's timezone)
  const activeCountryOverlay = useMemo(() => {
    if (!activeCountry) return null;
    const { country, timezone } = activeCountry;
    const metrics = metricsByCountry[country];
    const localTime = new Date().toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit"
    });
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: '#fff',
          p: 2,
          borderRadius: 2,
          minWidth: 220
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>{country}</Typography>
        {metrics && (
          <>
            <Typography variant="body2">
              Writers: {metrics.count}
            </Typography>
            <Typography variant="body2">
              Avg Quality: {metrics.average.toFixed(1)}
            </Typography>
          </>
        )}
        <Typography variant="body2">
          Local Time: {localTime}
        </Typography>
      </Box>
    );
  }, [activeCountry, metricsByCountry]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 500 }}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={mapboxToken}
      >
        {/* Performance Layer */}
        {showPerformanceLayer && (
          <Source
            id="countries"
            type="geojson"
            data="https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
          >
            <Layer {...performanceLayer} />
          </Source>
        )}

        {/* Markers */}
        {showMarkers && renderMarkers()}

        {/* Popup for selected reviewer */}
        {selectedReviewer?.location && (
          <Popup
            latitude={selectedReviewer.location.latitude}
            longitude={selectedReviewer.location.longitude}
            onClose={() => setSelectedReviewer(null)}
            closeOnClick={false}
            offset={[0, -10]}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1, maxWidth: 300 }}>
              <Box sx={{ mr: 2 }}>
                {selectedReviewer.profilePic ? (
                  <Box
                    component="img"
                    src={selectedReviewer.profilePic}
                    alt={selectedReviewer.name}
                    sx={{ width: 60, height: 60, borderRadius: '50%' }}
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
                      justifyContent: 'center'
                    }}
                  >
                    <PersonIcon sx={{ color: '#000' }} />
                  </Box>
                )}
              </Box>
              <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate(`/reports?reviewer=${encodeURIComponent(selectedReviewer.name)}&clients=all&startDate=${startDate}&endDate=${endDate}&reportType=Cases%2FRevisions`)}
                >
                  {selectedReviewer.name}
                </Typography>
                <Typography variant="body2">
                  <a href={`mailto:${selectedReviewer.email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                    {selectedReviewer.email}
                  </a>
                </Typography>
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
              <IconButton onClick={() => setSelectedReviewer(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Popup>
        )}
      </Map>

      {/* Play/Pause Animation Button (Top Left) */}
      <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
        <IconButton
          onClick={() => setAnimationPlaying(prev => !prev)}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.8)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
            color: '#333'
          }}
        >
          {animationPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      </Box>

      {/* Layers Control Panel (Bottom Right) */}
      <Paper sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(255,255,255,0.9)'
        }}>
        <FormControlLabel
          control={
            <Switch
              checked={showMarkers}
              onChange={() => setShowMarkers(prev => !prev)}
              color="primary"
            />
          }
          label="Markers"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showPerformanceLayer}
              onChange={() => setShowPerformanceLayer(prev => !prev)}
              color="primary"
            />
          }
          label="Performance Layer"
        />
      </Paper>

      {/* Active Country Metrics Overlay (Bottom Left) */}
      {activeCountryOverlay}
    </Box>
  );
}
