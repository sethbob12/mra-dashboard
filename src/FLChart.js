import React, { useState, useRef } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Popover, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TableSortLabel 
} from "@mui/material";
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
  Label
} from "recharts";
import InteractiveStackedBarChart from "./InteractiveStackedBarChart";

// Define pie chart colors
const pieColors = [
  "#1E73BE",
  "#FF8042",
  "#FFBB28",
  "#00C49F",
  "#FF6384",
  "#36A2EB",
];

// Custom tooltip for Revision Rate vs. Cases Past 30 Days scatter chart
const CustomTooltipRevision = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const { reviewer, x, y } = payload[0].payload;
    return (
      <div style={{ backgroundColor: "#fff", padding: 5, border: "1px solid #ccc" }}>
        <p>{`Reviewer: ${reviewer}`}</p>
        <p>{`Cases Past 30 Days: ${x}`}</p>
        <p>{`Revision Rate: ${y}`}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for Accuracy vs. Timeliness scatter chart
const CustomTooltipPerformance = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const { reviewer, accuracy, timeliness } = payload[0].payload;
    return (
      <div style={{ backgroundColor: "#fff", padding: 5, border: "1px solid #ccc" }}>
        <p>{`Reviewer: ${reviewer}`}</p>
        <p>{`Accuracy: ${accuracy}`}</p>
        <p>{`Timeliness: ${timeliness}`}</p>
      </div>
    );
  }
  return null;
};

// Helper: Generate pie chart data by grouping reviewers by client.
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

// Helper: Generate scatter data for Revision Rate vs. Cases Past 30 Days.
const generateRevisionRateScatterData = (data) => {
  return data.map((reviewer) => ({
    x: reviewer.casesPast30Days || 0,
    y: reviewer.revisionRate || 0,
    reviewer: reviewer.name,
  }));
};

// Helper: Generate scatter data for Accuracy vs. Timeliness.
const generatePerformanceScatterData = (data) => {
  return data.filter((reviewer) =>
    typeof reviewer.accuracyScore === "number" &&
    typeof reviewer.timelinessScore === "number"
  ).map((reviewer) => ({
    accuracy: reviewer.accuracyScore || 50,
    timeliness: reviewer.timelinessScore || 50,
    reviewer: reviewer.name,
  }));
};

// Component: ClientReviewerGrid (Sortable Table)
const ClientReviewerGrid = ({ data }) => {
  const clientOrder = ["PFR", "Lincoln", "Hartford", "Peer Review", "NYL", "Standard", "Telco", "LTC", "Muckleshoot"];
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("Reviewer");

  const rows = data.map((reviewer) => {
    const reviewerClients = reviewer.clients.split(",").map(c => c.trim());
    let row = { Reviewer: reviewer.name };
    clientOrder.forEach((client) => {
      row[client] = reviewerClients.includes(client) ? "X" : "";
    });
    return row;
  });

  const comparator = (a, b) => {
    const aVal = a[orderBy];
    const bVal = b[orderBy];
    if (orderBy === "Reviewer") {
      return aVal.localeCompare(bVal);
    } else {
      const aNum = aVal === "X" ? 1 : 0;
      const bNum = bVal === "X" ? 1 : 0;
      return aNum - bNum;
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    const cmp = comparator(a, b);
    return order === "asc" ? cmp : -cmp;
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 4, border: "1px solid #ccc" }}>
      <Typography variant="h6" sx={{ p: 2, color: "#1E73BE" }}>
        Reviewer - Client Assignments
      </Typography>
      <Table sx={{ borderCollapse: "collapse" }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#1976d2" }}>
            <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center", border: "1px solid #ccc" }}>
              <TableSortLabel
                active={orderBy === "Reviewer"}
                direction={orderBy === "Reviewer" ? order : "asc"}
                onClick={() => handleRequestSort("Reviewer")}
              >
                Reviewer
              </TableSortLabel>
            </TableCell>
            {clientOrder.map((client) => (
              <TableCell key={client} align="center" sx={{ color: "white", fontWeight: "bold", border: "1px solid #ccc" }}>
                <TableSortLabel
                  active={orderBy === client}
                  direction={orderBy === client ? order : "asc"}
                  onClick={() => handleRequestSort(client)}
                >
                  {client}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((row, index) => (
            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f5f5f5", border: "1px solid #ccc" }}>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#bbdefb", border: "1px solid #ccc" }}>
                {row["Reviewer"]}
              </TableCell>
              {clientOrder.map((client) => (
                <TableCell key={client} align="center" sx={{ border: "1px solid #ccc" }}>
                  {row[client]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Main FLChart Component: Integrates all visualizations.
const FLChart = ({ data }) => {
  const pieData = generatePieData(data);
  const revisionScatterData = generateRevisionRateScatterData(data);
  const performanceScatterData = generatePerformanceScatterData(data);

  const containerRef = useRef(null);
  const [popoverData, setPopoverData] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSliceClick = (entry) => {
    setPopoverData(entry);
    setPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
    setPopoverData(null);
  };

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

      {/* Interactive Stacked Bar Chart */}
      <InteractiveStackedBarChart data={data} />

      {/* Pie Chart: Reviewer Distribution */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1E73BE" }}>
          Reviewer Distribution Across Clients
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              outerRadius={150}
              dataKey="value"
              onClick={(e) => handleSliceClick(e.payload)}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} style={{ cursor: "pointer" }} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>

      {/* Popover for Pie Chart */}
      <Popover
        open={popoverOpen}
        anchorEl={containerRef.current}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: "center", horizontal: "left" }}
        transformOrigin={{ vertical: "center", horizontal: "right" }}
      >
        {popoverData && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {popoverData.name} ({popoverData.value} reviewer{popoverData.value > 1 ? "s" : ""})
            </Typography>
            <Box sx={{ m: 0, p: 0, listStyle: "none", fontSize: "0.9em" }} component="ul">
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

      {/* Scatter Plot: Revision Rate vs. Cases Past 30 Days */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1E73BE" }}>
          Revision Rate vs. Cases Past 30 Days
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" domain={[30, "dataMax"]}>
              <Label value="Cases Past 30 Days" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis type="number" dataKey="y" domain={[0, "dataMax"]}>
              <Label value="Revision Rate (%)" angle={-90} position="insideLeft" />
            </YAxis>
            <ScatterTooltip content={<CustomTooltipRevision />} />
            <Scatter data={revisionScatterData} fill="#1E73BE" />
          </ScatterChart>
        </ResponsiveContainer>
      </Paper>

      {/* Scatter Plot: Accuracy vs. Timeliness */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1E73BE" }}>
          Accuracy vs. Timeliness (Reviewer Performance)
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="accuracy" domain={[20, "dataMax"]}>
              <Label value="Accuracy (%)" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis type="number" dataKey="timeliness" domain={[50, "dataMax"]}>
              <Label value="Timeliness (%)" angle={-90} position="insideLeft" />
            </YAxis>
            <ScatterTooltip content={<CustomTooltipPerformance />} />
            <Scatter data={performanceScatterData} fill="#FF8042" />
          </ScatterChart>
        </ResponsiveContainer>
      </Paper>

      {/* Client-Reviewer Grid */}
      <ClientReviewerGrid data={data} />
      
    </Box>
  );
};

export default FLChart;
