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
  Customized
} from "recharts";

const InteractiveStackedBarChart = ({ data }) => {
  const theme = useTheme();
  const textColor = theme.palette.mode === "dark" ? "#fff" : "#000";

  // Process the data using the new methodology:
  // Quality Score = (0.6 * accuracyScore) + (0.2 * timelinessScore) + (0.1 * efficiencyScore)
  //                + (min(clientCount,6)) + (caseTypePoints)
  // where caseTypePoints = 4 if caseType==="Both", else 2.
  const processedData = useMemo(() => {
    return data.map((reviewer) => {
      const accuracy = reviewer.accuracyScore || 0;
      const timeliness = reviewer.timelinessScore || 0;
      const efficiency = reviewer.efficiencyScore || 0;
      const clientList = reviewer.clients.split(",").map(c => c.trim());
      const coveragePoints = Math.min(clientList.length, 6);
      const typePoints = reviewer.caseType === "Both" ? 4 : 2;
      const accuracyContrib = 0.6 * accuracy;
      const timelinessContrib = 0.2 * timeliness;
      const efficiencyContrib = 0.1 * efficiency;
      const computedQualityScore =
        accuracyContrib + timelinessContrib + efficiencyContrib + coveragePoints + typePoints;
      return {
        name: reviewer.name,
        accuracyScore: accuracy,
        timelinessScore: timeliness,
        efficiencyScore: efficiency,
        accuracyContrib,
        timelinessContrib,
        efficiencyContrib,
        coverageContrib: coveragePoints,
        typeContrib: typePoints,
        qualityScore: computedQualityScore,
        costPerCase: reviewer.costPerCase,
        clientList,
        caseType: reviewer.caseType || "Non-Psych"
      };
    });
  }, [data]);

  // Fixed client order
  const allClients = useMemo(() => {
    const fixedOrder = [
      "PFR", "Lincoln", "Hartford", "Peer Review", "NYL", "Standard", "Telco", "LTC", "Muckleshoot"
    ];
    const present = new Set();
    data.forEach((reviewer) => {
      reviewer.clients
        .split(",")
        .map(c => c.trim())
        .forEach(client => present.add(client));
    });
    return fixedOrder.filter(client => present.has(client));
  }, [data]);

  const [selectedClient, setSelectedClient] = useState("All");

  const filteredData = useMemo(() => {
    if (selectedClient === "All") return processedData;
    return processedData.filter((reviewer) =>
      reviewer.clientList.includes(selectedClient)
    );
  }, [processedData, selectedClient]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => b.qualityScore - a.qualityScore);
  }, [filteredData]);

  // We assume a fixed row height of 40px per reviewer for the BarChart.
  const rowHeight = 40;
  const chartHeight = Math.max(400, sortedData.length * rowHeight);

  const colors = {
    accuracyContrib: "#82ca9d",    // green
    timelinessContrib: "#ffc658",  // yellow/orange
    efficiencyContrib: "#8884d8",  // purple/blue
    coverageContrib: "#FF8042",    // orange
    typeContrib: "#00C49F"         // teal
  };

  // Custom tooltip: displays raw scores first (with "%" appended) then the computed contribution in parentheses.
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const reviewerData = sortedData.find((d) => d.name === label);
      let costText = "";
      if (selectedClient !== "All" && reviewerData && reviewerData.costPerCase) {
        const cost = reviewerData.costPerCase[selectedClient] || 0;
        costText = `Cost (${selectedClient}): $${cost}`;
      }
      return (
        <div style={{ background: "#fff", border: "1px solid #ccc", padding: 5 }}>
          <p><strong>{`Reviewer: ${label}`}</strong></p>
          {payload.map((entry, idx) => {
            let displayText = "";
            if (entry.name === "Accuracy") {
              displayText = `Accuracy: ${reviewerData.accuracyScore.toFixed(1)}% (${reviewerData.accuracyContrib.toFixed(1)})`;
            } else if (entry.name === "Timeliness") {
              displayText = `Timeliness: ${reviewerData.timelinessScore.toFixed(1)}% (${reviewerData.timelinessContrib.toFixed(1)})`;
            } else if (entry.name === "Efficiency") {
              displayText = `Efficiency: ${reviewerData.efficiencyScore.toFixed(1)}% (${reviewerData.efficiencyContrib.toFixed(1)})`;
            } else if (entry.name === "Coverage") {
              displayText = `Coverage: ${reviewerData.clientList.length} (#Clients) (${reviewerData.coverageContrib.toFixed(1)})`;
            } else if (entry.name === "Type") {
              displayText = `Type: ${reviewerData.caseType === "Both" ? "Both" : reviewerData.caseType + " only"} (${reviewerData.typeContrib})`;
            } else {
              displayText = `${entry.name}: ${entry.value.toFixed(1)}`;
            }
            return (
              <p key={idx} style={{ color: entry.fill, margin: 0 }}>
                {displayText}
              </p>
            );
          })}
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

  // Custom renderer to display overall quality scores in a fixed column to the right of the chart.
  // We'll compute the effective row height based on the chart's margins and number of rows.
  const renderQualityScores = () => {
    // The available vertical space for the YAxis is (chartHeight - topMargin - bottomMargin)
    // where we used top = 20 and bottom = 20 in the BarChart margin.
    const effectiveRowHeight = (chartHeight - 70) / sortedData.length;
    return (
      <g>
        {sortedData.map((entry, index) => {
          const yPos = 25 + (index + 0.5) * effectiveRowHeight;
          return (
            <text
              key={entry.name}
              x={1030 + 10} // fixed x = 1040 (1030 as requested plus a 10px offset)
              y={yPos}
              fill={textColor}
              fontWeight="bold"
              fontSize={16}
              textAnchor="start"
            >
              {entry.qualityScore.toFixed(1)}
            </text>
          );
        })}
      </g>
    );
  };

  return (
    <Paper elevation={4} style={{ padding: 16, marginTop: 16, overflowY: "auto" }}>
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
            "& .MuiOutlinedInput-notchedOutline": { borderColor: textColor },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: textColor },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: textColor }
          }}
        >
          <MenuItem value="All" sx={{ color: textColor }}>
            All
          </MenuItem>
          {allClients.map((client) => (
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
          <Bar dataKey="accuracyContrib" stackId="a" fill={colors.accuracyContrib} name="Accuracy" />
          <Bar dataKey="timelinessContrib" stackId="a" fill={colors.timelinessContrib} name="Timeliness" />
          <Bar dataKey="efficiencyContrib" stackId="a" fill={colors.efficiencyContrib} name="Efficiency" />
          <Bar dataKey="coverageContrib" stackId="a" fill={colors.coverageContrib} name="Coverage" />
          <Bar dataKey="typeContrib" stackId="a" fill={colors.typeContrib} name="Type" />
          <Customized component={renderQualityScores} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default InteractiveStackedBarChart;
