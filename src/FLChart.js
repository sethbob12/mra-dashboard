import React, { useState, useRef } from "react";
import { Box, Typography, Paper, Button, Popover } from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ScatterTooltip,
} from "recharts";

// Define pie chart colors
const pieColors = [
  "#1E73BE",
  "#FF8042",
  "#FFBB28",
  "#00C49F",
  "#FF6384",
  "#36A2EB",
];

// Generate pie chart data including reviewer names for each client.
const generatePieData = (data) => {
  const clientData = {};
  data.forEach((reviewer) => {
    const clients = reviewer.clients.split(",").map((c) => c.trim());
    clients.forEach((client) => {
      if (!clientData[client]) {
        clientData[client] = { count: 0, names: [] };
      }
      clientData[client].count++;
      clientData[client].names.push(reviewer.name);
    });
  });
  return Object.keys(clientData).map((client, index) => ({
    name: client,
    value: clientData[client].count,
    names: clientData[client].names,
    color: pieColors[index % pieColors.length],
  }));
};

// Generate scatter plot data for revision request trends over 30 days.
const generateScatterData = (data) => {
  return data.map((reviewer, index) => ({
    x: index + 1,
    y: reviewer.clientRevisions30Days || 0,
    reviewer: reviewer.name,
  }));
};

const FLChart = ({ data }) => {
  // Ref for the container that wraps the pie chart.
  const containerRef = useRef(null);
  // State for managing the popover.
  const [popoverData, setPopoverData] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const pieChartData = generatePieData(data);
  const scatterData = generateScatterData(data);

  // When a slice is clicked, update the popover content and open it.
  const handleSliceClick = (entry) => {
    setPopoverData(entry);
    setPopoverOpen(true);
  };

  // Handler to close the popover.
  const handlePopoverClose = () => {
    setPopoverOpen(false);
    setPopoverData(null);
  };

  // Copy the list of reviewer names.
  const handleCopy = () => {
    if (popoverData) {
      const textToCopy = popoverData.names.join(", ");
      navigator.clipboard.writeText(textToCopy);
      alert(`Copied: ${textToCopy}`);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#333" }}>
        Quality Assurance Data Visualizations
      </Typography>

      {/* Pie Chart Container with Subtle Shadow */}
      <Box ref={containerRef} sx={{ position: "relative" }}>
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            boxShadow: 3, // Subtle shadow for depth
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#1E73BE" }}>
            Reviewer Distribution Across Clients
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(1)}%)`
                }
                outerRadius={150}
                dataKey="value"
                onClick={(e) => handleSliceClick(e.payload)}
              >
                {pieChartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSliceClick(entry)}
                  />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Popover anchored to the left side of the chart container */}
        <Popover
          open={popoverOpen}
          anchorEl={containerRef.current}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
          disablePortal
          PaperProps={{
            sx: { pointerEvents: "auto", m: 1, borderRadius: 2, boxShadow: 3 },
          }}
        >
          {popoverData && (
            <Box sx={{ p: 2, maxWidth: 300 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {popoverData.name} ({popoverData.value} reviewer
                {popoverData.value > 1 ? "s" : ""})
              </Typography>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", fontSize: "0.9em" }}>
                {popoverData.names.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </Box>
              <Button variant="outlined" size="small" onClick={handleCopy} sx={{ mt: 1 }}>
                Copy Names
              </Button>
            </Box>
          )}
        </Popover>
      </Box>

      {/* Scatter Plot: Revision Request Trends Over 30 Days */}
      <Paper
        elevation={4}
        sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: "#1E73BE" }}>
          Revision Request Trends (Past 30 Days)
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Reviewer Index"
              label={{
                value: "Reviewers",
                position: "insideBottom",
                offset: -5,
              }}
              tick={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Revision Requests (30 Days)"
              label={{
                value: "Revision Requests",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ScatterTooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter name="Revisions (30 Days)" data={scatterData} fill="#1E73BE" />
          </ScatterChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default FLChart;
