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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function WorldMap({ reviewers }) {
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Callout styling – solid subtle gray background.
  const calloutBackground = 'rgba(240,240,240,1)';
  const calloutTextColor = "#000";
  const calloutBorder = "1px solid rgba(0,0,0,0.5)";

  // Popup styling.
  const popupBackground = isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)';
  const popupTextColor = '#fff';

  // Panel styling.
  const panelBackground = isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';
  const panelTextColor = isDarkMode ? '#fff' : '#333';
  const playPauseBg = isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';
  const playPauseColor = isDarkMode ? '#fff' : '#333';

  // Default toggles.
  const [showTimeLayer, setShowTimeLayer] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPerformanceLayer, setShowPerformanceLayer] = useState(false);
  const [showMRAsList, setShowMRAsList] = useState(true);
  // Global panel expansion state (for Global MRAs panel).
  const [globalPanelExpanded, setGlobalPanelExpanded] = useState(false);
  // Legend expansion state (for Layers tab) now controlled by hover.
  const [legendExpanded, setLegendExpanded] = useState(false);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeCountry, setActiveCountry] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const popupTimeoutRef = useRef(null);

  // Report dates.
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const startDate = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const initialViewState = useMemo(() => ({
    latitude: 20,
    longitude: 0,
    zoom: 1.5
  }), []);

  // Group reviewers by nearly identical coordinates.
  const groups = useMemo(() => {
    return reviewers.reduce((acc, reviewer) => {
      const { latitude, longitude } = reviewer.location || {};
      if (typeof latitude !== 'number' || typeof longitude !== 'number') return acc;
      const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(reviewer);
      return acc;
    }, {});
  }, [reviewers]);

  // Determine marker color.
  const getMarkerColor = (quality) => {
    if (quality < 75) return "#e74c3c";
    if (quality < 90) return "#f1c40f";
    return "#2ecc71";
  };

  // Compute performance metrics by country.
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

  // Compute performance colors.
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

  // Custom offsets for callout labels.
  const customOffsets = {
    "United States": [-80, 40],
    "Colombia": [-70, 30],
    "Lithuania": [-60, 30],
    "Turkey": [-60, 40],
    "Nigeria": [-60, 30],
    "Philippines": [-80, 30],
  };

  // Predefined animation locations.
  const animationLocations = useMemo(() => [
    { country: "United States", geoName: "United States of America", latitude: 33.5207, longitude: -86.8025, zoom: 4, timezone: "America/Chicago" },
    { country: "Colombia", geoName: "Colombia", latitude: 4.7110, longitude: -74.0721, zoom: 4, timezone: "America/Bogota" },
    { country: "Lithuania", geoName: "Lithuania", latitude: 54.6872, longitude: 25.2797, zoom: 4, timezone: "Europe/Vilnius" },
    { country: "Turkey", geoName: "Turkey", latitude: 41.0082, longitude: 28.9784, zoom: 4, timezone: "Europe/Istanbul" },
    { country: "Nigeria", geoName: "Nigeria", latitude: 6.5244, longitude: 3.3792, zoom: 4, timezone: "Africa/Lagos" },
    { country: "Philippines", geoName: "Philippines", latitude: 14.5995, longitude: 120.9842, zoom: 4, timezone: "Asia/Manila" }
  ], []);

  // Compute computed availability.
  const getComputedAvailability = (reviewer) => {
    if (reviewer.currentWorkload > reviewer.dailyCaseLimit) {
      return "Not Available";
    }
    return reviewer.availability || "Not Available";
  };

  // Color for availability text.
  const getAvailabilityColor = (availability) => {
    if (availability === "Available") return "green";
    if (availability === "Not Available") return "red";
    return "#333";
  };

  // Render callouts for avg quality (if Performance Layer is on) and local time (if Time is on).
  const renderCallouts = () => {
    return animationLocations.map(loc => {
      const countryName = loc.country;
      const metrics = metricsByCountry[countryName] || metricsByCountry[loc.geoName];
      if (!metrics) return null;
      const avg = parseFloat(metrics.average).toFixed(1);
      const localTime = showTimeLayer ? new Date().toLocaleTimeString('en-US', {
        timeZone: loc.timezone,
        hour: '2-digit',
        minute: '2-digit'
      }) : null;
      const offset = customOffsets[loc.country] || [-60, 30];
      return (
        <Marker
          key={`callout-${loc.country}`}
          latitude={loc.latitude}
          longitude={loc.longitude}
          anchor="bottom"
          offset={offset}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {showPerformanceLayer && (
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
            )}
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

  // Compute global MRA stats.
  const totalMRAs = reviewers.length;
  const mrAsByCountry = useMemo(() => {
    return reviewers.reduce((acc, reviewer) => {
      const country = reviewer.location.country;
      if (!acc[country]) {
        acc[country] = 0;
      }
      acc[country]++;
      return acc;
    }, {});
  }, [reviewers]);

  // Sorted countries in descending order by MRA count.
  const sortedCountries = useMemo(() => {
    return Object.entries(mrAsByCountry)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([country, count]) => ({ country, count }));
  }, [mrAsByCountry]);

  // When a country in the global panel is hovered, fly to that country and display its MRAs popup.
  const flyToCountry = (countryName) => {
    const target = animationLocations.find(loc => loc.country === countryName || loc.geoName === countryName);
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

  // MRAs list popup for the active country.
  const countryMRAs = useMemo(() => {
    if (!activeCountry) return [];
    return reviewers
      .filter(r => {
        if (activeCountry.geoName === "United States of America") {
          return r.location.country === "United States of America" || r.location.country === "United States";
        }
        return r.location.country === activeCountry.geoName;
      })
      .sort((a, b) => b.overallQualityScore - a.overallQualityScore);
  }, [activeCountry, reviewers]);

  // Use TerminatorSource for the night overlay.
  useEffect(() => {
    if (!mapLoaded || !showTimeLayer) return;
    const map = mapRef.current.getMap();
    try {
      if (map.getLayer('solar-terminator-layer')) {
        map.removeLayer('solar-terminator-layer');
      }
      if (map.getSource('solar-terminator')) {
        map.removeSource('solar-terminator');
      }
    } catch (error) {
      console.error("Error removing terminator source/layer:", error);
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
        fetchTileImageBitmap: async function(zxy) {
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
          paint: {
            'raster-opacity': 0.35
          }
        });
      } catch (error) {
        console.error("Error adding terminator source/layer:", error);
      }
    };
    updateTerminator();
    const intervalId = setInterval(() => {
      updateTerminator();
    }, 30000);
    return () => {
      clearInterval(intervalId);
      try {
        if (map.getLayer('solar-terminator-layer')) {
          map.removeLayer('solar-terminator-layer');
        }
        if (map.getSource('solar-terminator')) {
          map.removeSource('solar-terminator');
        }
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };
  }, [mapLoaded, showTimeLayer, mapboxToken]);

  // Update map symbol text color to black when Time toggle is on.
  useEffect(() => {
    if (!mapLoaded || !showTimeLayer) return;
    const map = mapRef.current.getMap();
    map.getStyle().layers.forEach(layer => {
      if (layer.type === 'symbol' && layer.paint && layer.paint['text-color']) {
        map.setPaintProperty(layer.id, 'text-color', '#000');
      }
    });
  }, [mapLoaded, showTimeLayer]);

  // Fly-around animation effect with global zoom-out between countries.
  useEffect(() => {
    let cancelled = false;
    async function runAnimation() {
      const map = mapRef.current && mapRef.current.getMap();
      if (!map) return;
      await map.flyTo({
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        speed: 0.2,
        curve: 1.2
      });
      await sleep(4000);
      while (!cancelled && animationPlaying) {
        for (const loc of animationLocations) {
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
  }, [animationPlaying, animationLocations, initialViewState]);

  const handleMoveEnd = (evt) => {
    const { longitude, latitude, zoom } = evt.viewState;
    if (zoom > 3.5) {
      let closest = null;
      let minDist = Infinity;
      animationLocations.forEach(loc => {
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

  // Render markers with hover events.
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
          <Marker
            key={reviewer.mra_id}
            latitude={markerLat}
            longitude={markerLng}
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
              <Box
                sx={{
                  backgroundColor: color,
                  borderRadius: '50%',
                  width: 12,
                  height: 12,
                  border: '2px solid #fff'
                }}
              />
            </Box>
          </Marker>
        );
      });
    });
  };

  const handlePopupMouseEnter = () => {
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    popupTimeoutRef.current = setTimeout(() => setSelectedReviewer(null), 2500);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 500, borderRadius: '8px', overflow: 'hidden' }}>
      {/* Global MRAs Info Panel in far top right (expands on hover) */}
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
      {/* Legend (Layers tab) at bottom right, expands on hover */}
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
          <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showMarkers}
                  onChange={(e) => setShowMarkers(e.target.checked)}
                  color="primary"
                />
              }
              label="Markers"
              sx={{ '& .MuiFormControlLabel-label': { color: panelTextColor, fontSize: '0.8rem' } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showPerformanceLayer}
                  onChange={(e) => setShowPerformanceLayer(e.target.checked)}
                  color="primary"
                />
              }
              label="Performance Layer"
              sx={{ '& .MuiFormControlLabel-label': { color: panelTextColor, fontSize: '0.8rem' } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showMRAsList}
                  onChange={(e) => setShowMRAsList(e.target.checked)}
                  color="primary"
                />
              }
              label="MRAs List"
              sx={{ '& .MuiFormControlLabel-label': { color: panelTextColor, fontSize: '0.8rem' } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showTimeLayer}
                  onChange={(e) => setShowTimeLayer(e.target.checked)}
                  color="primary"
                />
              }
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
                      `/reports?reviewer=${encodeURIComponent(selectedReviewer.name)}&clients=all&startDate=${startDate}&endDate=${endDate}&reportType=Cases%2FRevisions`
                    )
                  }
                >
                  {selectedReviewer.name}
                </Typography>
              </Box>
              <Box>
              <Typography variant="body2">
  <Box
    component="a"
    href={`mailto:${selectedReviewer.email}`}
    sx={{
      color: 'inherit',
      textDecoration: 'underline',
      outline: 'none',
      border: 'none',
      '&:focus, &:active': {
        outline: 'none',
        border: 'none',
      },
    }}
  >
    Email
  </Box>
</Typography>

                <Typography variant="body2" sx={{ color: getMarkerColor(selectedReviewer.overallQualityScore) }}>
                  Quality Score: {selectedReviewer.overallQualityScore.toFixed(1)}
                </Typography>
                <Typography variant="body2">
                  Current Workload: {selectedReviewer.currentWorkload}
                </Typography>
                <Typography variant="body2" sx={{ color: getAvailabilityColor(getComputedAvailability(selectedReviewer)) }}>
                  Availability: {getComputedAvailability(selectedReviewer)}
                </Typography>
              </Box>
            </Box>
          </Popup>
        )}
      </Map>
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1100 }}>
        <IconButton
          onClick={() => setAnimationPlaying(prev => !prev)}
          sx={{
            backgroundColor: playPauseBg,
            '&:hover': { backgroundColor: playPauseBg },
            color: playPauseColor
          }}
        >
          {animationPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      </Box>
      {/* MRAs List Popup for Active Country */}
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
