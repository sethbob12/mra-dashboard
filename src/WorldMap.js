import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Map, Marker, Popup, Source, Layer } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Typography, IconButton, Switch, FormControlLabel, Paper } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { TerminatorSource } from '@vicmartini/mapbox-gl-terminator';
import FLMasterData from './FLMasterData';
import FLTransactionalData from './FLTransactionalData';

// Helper: delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Callout styling constants
const calloutBackground = 'rgba(240,240,240,1)';
const calloutTextColor = "#000";
const calloutBorder = "1px solid rgba(0,0,0,0.5)";

// Helper: choose marker color based on quality
function getMarkerColor(quality) {
  if (quality < 75) return "#e74c3c";
  if (quality < 90) return "#f1c40f";
  return "#2ecc71";
}

export default function WorldMap() {
  // --- Merge Data ---
  // We iterate over FLMasterData (static) and for each record find a matching dynamic record.
  // We also log the keys of the static record so we can verify that "location" exists.
  const mergedReviewers = useMemo(() => {
    return FLMasterData.map(staticRecord => {
      console.log("Static record keys for mra_id", staticRecord.mra_id, Object.keys(staticRecord));
      // Ensure mra_id is compared as numbers.
      const dynamicRecord = FLTransactionalData.find(d => Number(d.mra_id) === Number(staticRecord.mra_id)) || {};
      // Return merged record with location forced from static data.
      return {
        ...staticRecord,
        ...dynamicRecord,
        location: staticRecord.location
      };
    });
  }, []);

  useEffect(() => {
    console.log("Merged Reviewers:", mergedReviewers);
  }, [mergedReviewers]);

  // --- Compute Overall Quality Score (if needed) ---
  const reviewers = useMemo(() => {
    return mergedReviewers.map(r => {
      const location = r.location; // Should be defined from static data
      let clientCount = 0;
      if (typeof r.clients === 'string') {
        clientCount = r.clients.split(',').map(s => s.trim()).filter(Boolean).length;
      } else if (Array.isArray(r.clients)) {
        clientCount = r.clients.length;
      }
      const caseType = r.caseType || "Non-Psych";
      const revisionRate = r.revisionRate || 0;
      const lateCasePercentage = r.lateCasePercentage || 0;
      const avg = r.avgCasesDay || 0;
      const accuracyScore = 100 - revisionRate;
      const timelinessScore = 100 - lateCasePercentage;
      const efficiencyScore = Math.min((avg / 5) * 100, 100);
      const coveragePoints = Math.min(clientCount, 6);
      const typePoints = caseType === "Both" ? 4 : 2;
      const overallQualityScore =
        (accuracyScore * 0.6) +
        (timelinessScore * 0.2) +
        (efficiencyScore * 0.1) +
        coveragePoints +
        typePoints;
      return { ...r, overallQualityScore, location };
    });
  }, [mergedReviewers]);

  // --- Map Setup ---
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const popupBackground = isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)';
  const popupTextColor = '#fff';
  const panelBackground = isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';
  const panelTextColor = isDarkMode ? '#fff' : '#333';
  const playPauseBg = isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';
  const playPauseColor = isDarkMode ? '#fff' : '#333';

  const [showTimeLayer, setShowTimeLayer] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPerformanceLayer, setShowPerformanceLayer] = useState(false);
  const [showMRAsList, setShowMRAsList] = useState(true);
  const [globalPanelExpanded, setGlobalPanelExpanded] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeCountry, setActiveCountry] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const popupTimeoutRef = useRef(null);

  const todayDate = new Date();
  const endDateStr = todayDate.toISOString().split('T')[0];
  const startDateStr = new Date(todayDate.getTime() - 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const initialViewState = useMemo(() => ({
    latitude: 20,
    longitude: 0,
    zoom: 1.5
  }), []);

  // --- Performance Layer Setup ---
  const metricsByCountry = useMemo(() => {
    const metrics = {};
    reviewers.forEach(r => {
      if (!r.location || !r.location.country) return;
      const country = r.location.country;
      if (!metrics[country]) metrics[country] = { total: 0, count: 0 };
      metrics[country].total += r.overallQualityScore;
      metrics[country].count++;
    });
    Object.keys(metrics).forEach(country => {
      metrics[country].average = metrics[country].total / metrics[country].count;
    });
    return metrics;
  }, [reviewers]);

  const performanceColors = useMemo(() => {
    const colors = {};
    Object.keys(metricsByCountry).forEach(country => {
      const avg = metricsByCountry[country].average;
      if (avg < 70) colors[country] = "#e74c3c";
      else if (avg < 85) colors[country] = "#f1c40f";
      else colors[country] = "#2ecc71";
    });
    return colors;
  }, [metricsByCountry]);

  const performanceLayer = useMemo(() => ({
    id: 'performance-layer',
    type: 'fill',
    paint: {
      'fill-color': [
        "case",
        ["==", ["get", "name"], "Philippines"], performanceColors["Philippines"] || "#ccc",
        // Updated condition for US: check if name equals "United States" OR "United States of America"
        ["any",
          ["==", ["get", "name"], "United States"],
          ["==", ["get", "name"], "United States of America"]
        ], performanceColors["United States"] || "#ccc",
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

  // --- Predefined Animation Locations ---
  const memoAnimationLocations = useMemo(() => ([
    { country: "United States", geoName: "United States of America", latitude: 33.5207, longitude: -86.8025, zoom: 4, timezone: "America/Chicago" },
    { country: "Colombia", geoName: "Colombia", latitude: 4.7110, longitude: -74.0721, zoom: 4, timezone: "America/Bogota" },
    { country: "Lithuania", geoName: "Lithuania", latitude: 54.6872, longitude: 25.2797, zoom: 4, timezone: "Europe/Vilnius" },
    { country: "Turkey", geoName: "Turkey", latitude: 41.0082, longitude: 28.9784, zoom: 4, timezone: "Europe/Istanbul" },
    { country: "Nigeria", geoName: "Nigeria", latitude: 6.5244, longitude: 3.3792, zoom: 4, timezone: "Africa/Lagos" },
    { country: "Philippines", geoName: "Philippines", latitude: 14.5995, longitude: 120.9842, zoom: 4, timezone: "Asia/Manila" }
  ]), []);

  // --- Popup Handlers ---
  const handlePopupMouseEnter = () => {
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    popupTimeoutRef.current = setTimeout(() => setSelectedReviewer(null), 2500);
  };

  // --- Render Markers ---
  const renderMarkers = () => {
    return reviewers.map(reviewer => {
      if (!reviewer.location || typeof reviewer.location.latitude !== 'number' || typeof reviewer.location.longitude !== 'number') {
        return null;
      }
      const color = getMarkerColor(reviewer.overallQualityScore);
      return (
        <Marker
          key={reviewer.mra_id}
          latitude={reviewer.location.latitude}
          longitude={reviewer.location.longitude}
          anchor="bottom"
        >
          <Box
            sx={{
              cursor: 'pointer',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
            onMouseEnter={() => {
              if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
              setSelectedReviewer(reviewer);
            }}
            onMouseLeave={() => {
              popupTimeoutRef.current = setTimeout(() => setSelectedReviewer(null), 2500);
            }}
          >
            <Box sx={{ backgroundColor: color, borderRadius: '50%', width: 12, height: 12, border: '2px solid #fff' }} />
          </Box>
        </Marker>
      );
    });
  };

  // --- Render Callouts ---
  const renderCallouts = () => {
    const customOffsets = {
      "United States": [-80, 40],
      "Colombia": [-70, 30],
      "Lithuania": [-60, 30],
      "Turkey": [-60, 40],
      "Nigeria": [-60, 30],
      "Philippines": [-80, 30],
    };
    const metrics = reviewers.reduce((acc, r) => {
      if (!r.location || !r.location.country) return acc;
      const country = r.location.country;
      if (!acc[country]) acc[country] = { total: 0, count: 0 };
      acc[country].total += r.overallQualityScore;
      acc[country].count++;
      return acc;
    }, {});
    Object.keys(metrics).forEach(country => {
      metrics[country].average = metrics[country].total / metrics[country].count;
    });
    return memoAnimationLocations.map(loc => {
      const m = metrics[loc.country] || metrics[loc.geoName];
      if (!m) return null;
      const avg = parseFloat(m.average).toFixed(1);
      const localTime = showTimeLayer ? new Date().toLocaleTimeString('en-US', {
        timeZone: loc.timezone,
        hour: '2-digit',
        minute: '2-digit'
      }) : null;
      const offset = customOffsets[loc.country] || [-60, 30];
      return (
        <Marker key={`callout-${loc.country}`} latitude={loc.latitude} longitude={loc.longitude} anchor="bottom" offset={offset}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Box sx={{
              backgroundColor: calloutBackground,
              color: calloutTextColor,
              p: 0.5,
              borderRadius: 1,
              fontSize: '0.7rem',
              fontWeight: 'bold',
              border: calloutBorder,
              whiteSpace: 'nowrap'
            }}>
              Avg: {avg}
            </Box>
            {showTimeLayer && localTime && (
              <Box sx={{
                backgroundColor: calloutBackground,
                color: calloutTextColor,
                p: 0.5,
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: 'bold',
                border: calloutBorder,
                whiteSpace: 'nowrap',
                mt: 0.25
              }}>
                Local: {localTime}
              </Box>
            )}
          </Box>
        </Marker>
      );
    });
  };

  // --- Global Panel ---
  const totalMRAs = reviewers.length;
  const mrAsByCountryStats = useMemo(() => {
    return reviewers.reduce((acc, reviewer) => {
      if (!reviewer.location || !reviewer.location.country) return acc;
      const country = reviewer.location.country;
      if (!acc[country]) acc[country] = 0;
      acc[country]++;
      return acc;
    }, {});
  }, [reviewers]);
  const sortedCountries = useMemo(() => {
    return Object.entries(mrAsByCountryStats)
      .sort(([, a], [, b]) => b - a)
      .map(([country, count]) => ({ country, count }));
  }, [mrAsByCountryStats]);

  // --- Fly-to Functionality ---
  const flyToCountry = (countryName) => {
    const target = memoAnimationLocations.find(loc => loc.country === countryName || loc.geoName === countryName);
    if (target) {
      const map = mapRef.current.getMap();
      map.flyTo({
        center: [target.longitude, target.latitude],
        zoom: target.zoom,
        speed: 0.3,
        curve: 1.5
      });
      setActiveCountry(target);
      setAnimationPlaying(false);
    }
  };

  // --- Active Country MRAs ---
  const countryMRAs = useMemo(() => {
    if (!activeCountry) return [];
    return reviewers
      .filter(r => {
        if (!r.location || !r.location.country) return false;
        if (activeCountry.geoName === "United States of America") {
          return r.location.country === "United States of America" || r.location.country === "United States";
        }
        return r.location.country === activeCountry.geoName;
      })
      .sort((a, b) => b.overallQualityScore - a.overallQualityScore);
  }, [activeCountry, reviewers]);

  // --- Terminator (Night Overlay) ---
  useEffect(() => {
    if (!mapLoaded || !showTimeLayer) return;
    const map = mapRef.current.getMap();
    try {
      if (map.getLayer('solar-terminator-layer')) map.removeLayer('solar-terminator-layer');
      if (map.getSource('solar-terminator')) map.removeSource('solar-terminator');
    } catch (error) {
      console.error("Error removing terminator layer:", error);
    }
    const is2x = window.devicePixelRatio > 1;
    const tileSize = 256;
    const tileURL = `https://api.mapbox.com/v4/rreusser.black-marble/{z}/{x}/{y}.webp?sku={sku}&access_token=${mapboxToken}`;
    const updateTerminator = async () => {
      const terminatorRenderer = new TerminatorSource({
        date: Date.now(),
        tileSize,
        is2x,
        stepping: 0,
        fadeRange: [6, -6],
        fetchTileImageBitmap: async (zxy) => {
          const sku = map._requestManager._skuToken;
          const response = await fetch(
            tileURL
              .replace('{z}/{x}/{y}', zxy)
              .replace('{sku}', sku)
              .replace('.webp', is2x ? '@2x.webp' : '.webp')
          );
          if (!response.ok) throw response.body;
          return await createImageBitmap(await response.blob());
        }
      });
      try {
        map.addSource('solar-terminator', terminatorRenderer);
        map.addLayer({
          id: 'solar-terminator-layer',
          type: 'raster',
          source: 'solar-terminator',
          paint: { 'raster-opacity': 0.35 }
        });
      } catch (error) {
        console.error("Error adding terminator layer:", error);
      }
    };
    updateTerminator();
    const intervalId = setInterval(() => updateTerminator(), 30000);
    return () => {
      clearInterval(intervalId);
      try {
        if (map.getLayer('solar-terminator-layer')) map.removeLayer('solar-terminator-layer');
        if (map.getSource('solar-terminator')) map.removeSource('solar-terminator');
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };
  }, [mapLoaded, showTimeLayer, mapboxToken]);

  useEffect(() => {
    if (!mapLoaded || !showTimeLayer) return;
    const map = mapRef.current.getMap();
    map.getStyle().layers.forEach(layer => {
      if (layer.type === 'symbol' && layer.paint && layer.paint['text-color']) {
        map.setPaintProperty(layer.id, 'text-color', '#000');
      }
    });
  }, [mapLoaded, showTimeLayer]);

  useEffect(() => {
    let cancelled = false;
    async function runAnimation() {
      const map = mapRef.current.getMap();
      if (!map) return;
      await map.flyTo({
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        speed: 0.2,
        curve: 1.2
      });
      await sleep(4000);
      while (!cancelled && animationPlaying) {
        for (const loc of memoAnimationLocations) {
          if (cancelled || !animationPlaying) break;
          await map.flyTo({
            center: [loc.longitude, loc.latitude],
            zoom: loc.zoom,
            speed: 0.3,
            curve: 1.5
          });
          setActiveCountry(loc);
          await sleep(7000);
          await map.flyTo({
            center: [initialViewState.longitude, initialViewState.latitude],
            zoom: 1.2,
            speed: 0.2,
            curve: 1.2
          });
          await sleep(4000);
        }
      }
    }
    if (animationPlaying) {
      runAnimation();
    }
    return () => { cancelled = true; };
  }, [animationPlaying, initialViewState, memoAnimationLocations]);

  const handleMoveEnd = (evt) => {
    const { longitude, latitude, zoom } = evt.viewState;
    if (zoom > 3.5) {
      let closest = null;
      let minDist = Infinity;
      memoAnimationLocations.forEach(loc => {
        const dist = Math.sqrt((loc.latitude - latitude) ** 2 + (loc.longitude - longitude) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closest = loc;
        }
      });
      if (minDist < 5) {
        setActiveCountry(closest);
      } else {
        setActiveCountry(null);
      }
    } else {
      setActiveCountry(null);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 500, borderRadius: '8px', overflow: 'hidden' }}>
      {/* Global MRAs Info Panel */}
      <Paper
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          p: 0.5,
          backgroundColor: panelBackground,
          color: panelTextColor,
          maxWidth: 220,
          zIndex: 1200
        }}
        onMouseEnter={() => setGlobalPanelExpanded(true)}
        onMouseLeave={() => setGlobalPanelExpanded(false)}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.3, color: panelTextColor }}>
          Global MRAs: {totalMRAs}
        </Typography>
        {globalPanelExpanded &&
          sortedCountries.map(({ country, count }) => (
            <Box
              key={country}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2, cursor: 'pointer' }}
              onClick={() => flyToCountry(country)}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: panelTextColor }}>
                {country}
              </Typography>
              <Typography variant="caption" sx={{ color: panelTextColor }}>
                {count}
              </Typography>
            </Box>
          ))}
      </Paper>
      {/* Legend Panel */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          backgroundColor: panelBackground,
          color: panelTextColor,
          maxWidth: 220,
          zIndex: 1100,
          p: 0.5
        }}
        onMouseEnter={() => setLegendExpanded(true)}
        onMouseLeave={() => setLegendExpanded(false)}
      >
        <Box sx={{ cursor: 'pointer' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: panelTextColor }}>
            Layers {legendExpanded ? "▲" : "▼"}
          </Typography>
        </Box>
        {legendExpanded && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <FormControlLabel
              control={<Switch checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} color="primary" />}
              label="Markers"
              sx={{ '& .MuiFormControlLabel-label': { color: panelTextColor, fontSize: '0.8rem' } }}
            />
            <FormControlLabel
              control={<Switch checked={showPerformanceLayer} onChange={(e) => setShowPerformanceLayer(e.target.checked)} color="primary" />}
              label="Performance Layer"
              sx={{ '& .MuiFormControlLabel-label': { color: panelTextColor, fontSize: '0.8rem' } }}
            />
            <FormControlLabel
              control={<Switch checked={showMRAsList} onChange={(e) => setShowMRAsList(e.target.checked)} color="primary" />}
              label="MRAs List"
              sx={{ '& .MuiFormControlLabel-label': { color: panelTextColor, fontSize: '0.8rem' } }}
            />
            <FormControlLabel
              control={<Switch checked={showTimeLayer} onChange={(e) => setShowTimeLayer(e.target.checked)} color="primary" />}
              label="Time"
              sx={{ '& .MuiFormControlLabel-label': { color: panelTextColor, fontSize: '0.8rem' } }}
            />
          </Box>
        )}
      </Paper>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={mapboxToken}
        mapLib={mapboxgl}
        onLoad={() => setMapLoaded(true)}
        onMoveEnd={handleMoveEnd}
      >
        {showPerformanceLayer && (
          <Source
            id="countries"
            type="geojson"
            data="https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
          >
            <Layer {...performanceLayer} />
          </Source>
        )}
        {showMarkers && renderMarkers()}
        {mapLoaded && showMarkers && renderCallouts()}
        {mapLoaded && selectedReviewer?.location && (
          <Popup
            ref={popupRef}
            latitude={selectedReviewer.location.latitude}
            longitude={selectedReviewer.location.longitude}
            onClose={() => setSelectedReviewer(null)}
            closeOnClick={true}
            offset={[0, -10]}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                maxWidth: 400,
                backgroundColor: popupBackground,
                color: popupTextColor,
                borderRadius: 2,
                boxShadow: 3,
                border: `2px solid ${getMarkerColor(selectedReviewer.overallQualityScore)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {selectedReviewer.profilePic ? (
                  <Box
                    component="img"
                    src={selectedReviewer.profilePic}
                    alt={selectedReviewer.name}
                    sx={{ width: 80, height: 80, borderRadius: '50%', mr: 2 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: '#ccc',
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PersonIcon sx={{ color: '#000' }} />
                  </Box>
                )}
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() =>
                    navigate(
                      `/reports?reviewer=${encodeURIComponent(selectedReviewer.name)}&clients=all&startDate=${startDateStr}&endDate=${endDateStr}&reportType=Cases%2FRevisions`
                    )
                  }
                >
                  {selectedReviewer.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  <a href={`mailto:${selectedReviewer.email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                    Email
                  </a>
                </Typography>
                <Typography variant="body2" sx={{ color: getMarkerColor(selectedReviewer.overallQualityScore) }}>
                  Quality Score: {selectedReviewer.overallQualityScore.toFixed(1)}
                </Typography>
                <Typography variant="body2">
                  Current Workload: {selectedReviewer.currentWorkload}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333" }}>
                  Availability: {selectedReviewer.availability || "Not Available"}
                </Typography>
              </Box>
            </Box>
          </Popup>
        )}
      </Map>
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1100 }}>
        <IconButton
          onClick={() => setAnimationPlaying(prev => !prev)}
          sx={{ backgroundColor: playPauseBg, '&:hover': { backgroundColor: playPauseBg }, color: playPauseColor }}
        >
          {animationPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      </Box>
      {activeCountry && showMRAsList && countryMRAs.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            maxWidth: 300,
            maxHeight: 400,
            overflowY: 'auto',
            p: 2,
            backgroundColor: panelBackground,
            color: panelTextColor,
            boxShadow: 3,
            borderRadius: 2,
            zIndex: 1050
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: panelTextColor, borderBottom: '1px solid ' + panelTextColor, pb: 1 }}>
            MRAs in {activeCountry.country}
          </Typography>
          {countryMRAs.map((reviewer) => (
            <Box key={reviewer.mra_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, borderBottom: '1px solid rgba(0,0,0,0.1)', pb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', textAlign: 'left', color: panelTextColor }}>
                {reviewer.name}
              </Typography>
              <Typography variant="caption" sx={{ color: panelTextColor }}>
                {reviewer.overallQualityScore.toFixed(1)}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}
