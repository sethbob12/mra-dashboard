// src/InteractiveStackedBarChart.js
import React, { useState, useMemo } from "react";
import { 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList
} from "recharts";

const InteractiveStackedBarChart = ({ data }) => {
  const theme = useTheme();
  // Set text color: white in dark mode, black in light mode.
  const textColor = theme.palette.mode === "dark" ? "#fff" : "#000";

  // Process the data: compute overall qualityScore and include individual scores and cost.
  const processedData = useMemo(() => {
    return data.map((reviewer) => {
      const accuracy = reviewer.accuracyScore || 0;
      const timeliness = reviewer.timelinessScore || 0;
      const efficiency = reviewer.efficiencyScore || 0;
      const quality = reviewer.qualityScore || (0.6 * accuracy + 0.2 * timeliness + 0.2 * efficiency);
      return {
        name: reviewer.name,
        accuracyScore: accuracy,
        timelinessScore: timeliness,
        efficiencyScore: efficiency,
        qualityScore: quality,
        clientList: reviewer.clients.split(",").map(c => c.trim()),
        costPerCase: reviewer.costPerCase // assume costPerCase is an object like { PFR:20, Lincoln:15, ... }
      };
    });
  }, [data]);

  // Fixed client order (if needed)
  const allClients = useMemo(() => {
    const fixedOrder = ["PFR", "Lincoln", "Hartford", "Peer Review", "NYL", "Standard", "Telco", "LTC", "Muckleshoot"];
    const present = new Set();
    data.forEach((reviewer) => {
      reviewer.clients.split(",").map(c => c.trim()).forEach(client => present.add(client));
    });
    return fixedOrder.filter(client => present.has(client));
  }, [data]);

  // State for filtering by client.
  const [selectedClient, setSelectedClient] = useState("All");

  const filteredData = useMemo(() => {
    if (selectedClient === "All") return processedData;
    return processedData.filter(reviewer => reviewer.clientList.includes(selectedClient));
  }, [processedData, selectedClient]);

  // Sort data descending by overall qualityScore.
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => b.qualityScore - a.qualityScore);
  }, [filteredData]);

  // Dynamic height: 40 pixels per reviewer (min 400px).
  const chartHeight = Math.max(400, sortedData.length * 40);

  // Colors for the stacked segments.
  const colors = {
    accuracyScore: "#82ca9d",    // green
    timelinessScore: "#ffc658",  // yellow/orange
    efficiencyScore: "#8884d8"   // purple/blue
  };

  // Custom tooltip: displays the reviewer's scores and, if a specific client is selected, its cost.
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Find reviewer object from sorted data by name.
      const reviewerData = sortedData.find(d => d.name === label);
      let costText = "";
      if (selectedClient !== "All" && reviewerData && reviewerData.costPerCase) {
        const cost = reviewerData.costPerCase[selectedClient] || 0;
        costText = `Cost (${selectedClient}): $${cost}`;
      }
      return (
        <div style={{ background: "#fff", border: "1px solid #ccc", padding: 5 }}>
          <p><strong>{`Reviewer: ${label}`}</strong></p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.fill, margin: 0 }}>
              {`${entry.name}: ${entry.value.toFixed(1)}`}
            </p>
          ))}
          {reviewerData && (
            <p style={{ fontWeight: "bold", margin: 0 }}>
              {`Quality Score: ${reviewerData.qualityScore.toFixed(1)}`}
            </p>
          )}
          {costText && <p style={{ fontWeight: "bold", margin: 0 }}>{costText}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <Paper elevation={4} style={{ padding: 16, marginTop: 16, overflowY: "auto" }}>
      {/* Optionally add a title here */}
      <Typography variant="h6" style={{ marginBottom: 16, color: textColor }}>
        Quality Scores
      </Typography>
      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel
          id="client-select-label"
          sx={{ color: textColor, "&.Mui-focused": { color: textColor } }}
        >
          Filter by Client
        </InputLabel>
        <Select
          labelId="client-select-label"
          value={selectedClient}
          label="Filter by Client"
          onChange={(e) => setSelectedClient(e.target.value)}
          sx={{
            color: textColor,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: textColor,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: textColor,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: textColor,
            },
          }}
        >
          <MenuItem value="All" sx={{ color: textColor }}>All</MenuItem>
          {allClients.map(client => (
            <MenuItem key={client} value={client} sx={{ color: textColor }}>
              {client}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <ResponsiveContainer width={1115} height={chartHeight}>
        <BarChart 
          layout="vertical" 
          data={sortedData} 
          margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} tick={false} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fill: textColor }} />
          <Tooltip content={<CustomTooltip />} />
          {/* No Legend */}
          <Bar dataKey="accuracyScore" stackId="a" fill={colors.accuracyScore} name="Accuracy" />
          <Bar dataKey="timelinessScore" stackId="a" fill={colors.timelinessScore} name="Timeliness" />
          <Bar dataKey="efficiencyScore" stackId="a" fill={colors.efficiencyScore} name="Efficiency">
            <LabelList dataKey="qualityScore" position="right" formatter={(value) => value.toFixed(1)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default InteractiveStackedBarChart;
