import React, { useState, useMemo } from "react";
import { 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from "@mui/material";
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
  // Process the data: compute overall qualityScore and keep individual scores.
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
        clientList: reviewer.clients.split(",").map(c => c.trim())
      };
    });
  }, [data]);

  // Fixed client order (you can adjust as needed)
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

  // Dynamic height: 35 pixels per reviewer, with a minimum height of 400.
  const chartHeight = Math.max(400, sortedData.length * 40);

  // Colors for the stacked segments.
  const colors = {
    accuracyScore: "#82ca9d",    // green
    timelinessScore: "#ffc658",  // yellow/orange
    efficiencyScore: "#8884d8"   // purple/blue
  };

  // Custom tooltip: shows reviewer name, each component value, and the overall Quality Score.
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const reviewerData = sortedData.find(d => d.name === label);
      return (
        <div style={{ background: "#fff", border: "1px solid #ccc", padding: 5 }}>
          <p><strong>{`Reviewer: ${label}`}</strong></p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.fill }}>{`${entry.name}: ${entry.value.toFixed(1)}`}</p>
          ))}
          {reviewerData && (
            <p style={{ fontWeight: "bold" }}>{`Quality Score: ${reviewerData.qualityScore.toFixed(1)}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Paper elevation={4} style={{ padding: 16, marginTop: 16, overflowY: "auto" }}>
      <Typography variant="h6" style={{ marginBottom: 16, color: "#1E73BE" }}>
        Reviewer Performance Stacked Bar Chart
      </Typography>
      <FormControl style={{ marginBottom: 16, minWidth: 200 }}>
        <InputLabel id="client-select-label">Filter by Client</InputLabel>
        <Select
          labelId="client-select-label"
          value={selectedClient}
          label="Filter by Client"
          onChange={(e) => setSelectedClient(e.target.value)}
        >
          <MenuItem value="All">All</MenuItem>
          {allClients.map(client => (
            <MenuItem key={client} value={client}>{client}</MenuItem>
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
          {/* Hide the X-axis ticks and labels */}
          <XAxis type="number" domain={[0, 100]} tick={false} />
          <YAxis type="category" dataKey="name" width={150} />
          <Tooltip content={<CustomTooltip />} />
          {/* Remove the legend as requested */}
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
