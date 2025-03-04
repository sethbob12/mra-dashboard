// src/FLChart.js
import React, { useState, useRef } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Popover, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TableSortLabel,
  Button
} from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Customized,
  ReferenceArea,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ComposedChart,
  Line,
  Label,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import InteractiveStackedBarChart from "./InteractiveStackedBarChart";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable"; // Now imported as a function

// Define pie chart colors
const pieColors = [
  "#1E73BE",
  "#FF8042",
  "#FFBB28",
  "#00C49F",
  "#FF6384",
  "#36A2EB",
];

// Custom tooltip for Revision Rate vs. Cases Past 30 Days
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

// Custom tooltip for Accuracy vs. Timeliness
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

const FLChart = ({ data }) => {
  const pieData = generatePieData(data);
  const revisionScatterData = generateRevisionRateScatterData(data);
  const performanceScatterData = generatePerformanceScatterData(data);

  // For the popover attached to the PieChart.
  const containerRef = useRef(null);
  const [popoverData, setPopoverData] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Refs for chart containers (for export)
  const revisionChartRef = useRef(null);
  const performanceChartRef = useRef(null);

  const handleSliceClick = (entry) => {
    setPopoverData(entry);
    setPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
    setPopoverData(null);
  };

  // Local handleCopy for the popover.
  const handleCopy = () => {
    if (popoverData) {
      const textToCopy = popoverData.names.join(", ");
      navigator.clipboard.writeText(textToCopy);
      alert(`Copied: ${textToCopy}`);
    }
  };

  // Compute min and max x values from revision scatter data.
  const xValues = revisionScatterData.map((d) => d.x);
  const minXData = Math.min(...xValues);
  const maxXData = Math.max(...xValues);

  // Prepare line data for the piecewise revision line:
  // (minXData, 0) -> (minXData, 20) -> (maxXData, 40)
  const lineData = [
    { x: minXData, y: 0 },
    { x: minXData, y: 20 },
    { x: maxXData, y: 40 },
  ];

  // Custom dot renderer for revision chart.
  const renderCustomDot = (props) => {
    const { cx, cy, payload } = props;
    const slope = 20 / (maxXData - minXData);
    const expectedY = payload.x === minXData 
      ? 20 
      : 20 + slope * (payload.x - minXData);
    const fillColor = payload.y < expectedY ? "green" : "red";
    return <circle cx={cx} cy={cy} r={5} fill={fillColor} stroke="#fff" strokeWidth={1} />;
  };

  // Custom dot renderer for performance chart.
  const renderCustomDotForPerformance = (props) => {
    const { cx, cy, payload } = props;
    const isInGreenArea = payload.accuracy >= 75 && payload.timeliness >= 75 && payload.timeliness <= 99;
    return <circle cx={cx} cy={cy} r={5} fill={isInGreenArea ? "green" : "red"} stroke="#fff" strokeWidth={1} />;
  };

  // Compute max accuracy from performance scatter data.
  const accuracyValues = performanceScatterData.map((d) => d.accuracy);
  const maxAccuracy = Math.max(...accuracyValues);

  // Build lists for revision chart dots.
  const getRevisionChartDotLists = () => {
    const green = [];
    const red = [];
    const slope = 20 / (maxXData - minXData);
    revisionScatterData.forEach((d) => {
      const expectedY = d.x === minXData ? 20 : 20 + slope * (d.x - minXData);
      if (d.y < expectedY) {
        green.push(d.reviewer);
      } else {
        red.push(d.reviewer);
      }
    });
    return { green, red };
  };

  // Build lists for performance chart dots.
  const getPerformanceChartDotLists = () => {
    const green = [];
    const red = [];
    performanceScatterData.forEach((d) => {
      if (d.accuracy >= 75 && d.timeliness >= 75 && d.timeliness <= 99) {
        green.push(d.reviewer);
      } else {
        red.push(d.reviewer);
      }
    });
    return { green, red };
  };

  // Export function for Revision Chart.
  const exportRevisionChartPDF = async () => {
    if (!revisionChartRef.current) return;
    const canvas = await html2canvas(revisionChartRef.current);
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Revision Rate vs. Cases Past 30 Days", 14, 20);
    doc.addImage(imgData, "PNG", 10, 30, 190, 100);
    const { green, red } = getRevisionChartDotLists();
    const maxRows = Math.max(green.length, red.length);
    const tableBody = [];
    for (let i = 0; i < maxRows; i++) {
      tableBody.push([green[i] || "", red[i] || ""]);
    }
    autoTable(doc, {
      head: [["Green Dots", "Red Dots"]],
      body: tableBody,
      startY: 140,
      theme: "grid",
    });
    doc.save("revision_chart.pdf");
  };

  // Export function for Performance Chart.
  const exportPerformanceChartPDF = async () => {
    if (!performanceChartRef.current) return;
    const canvas = await html2canvas(performanceChartRef.current);
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Accuracy vs. Timeliness", 14, 20);
    doc.addImage(imgData, "PNG", 10, 30, 190, 100);
    const { green, red } = getPerformanceChartDotLists();
    const maxRows = Math.max(green.length, red.length);
    const tableBody = [];
    for (let i = 0; i < maxRows; i++) {
      tableBody.push([green[i] || "", red[i] || ""]);
    }
    autoTable(doc, {
      head: [["Green Dots", "Red Dots"]],
      body: tableBody,
      startY: 140,
      theme: "grid",
    });
    doc.save("performance_chart.pdf");
  };

  // Render a triangle covering the area below the piecewise revision line.
  // Triangle vertices in data coordinates: A: (minXData, 0), B: (minXData, 20), C: (maxXData, 40), D: (maxXData, 0)
  const renderTriangleBackground = (props) => {
    if (!props || !props.viewBox) return null;
    const { x, y, width, height } = props.viewBox;
    const minDomain = 30;
    const maxDomain = maxXData;
    const mapX = (val) => x + ((val - minDomain) / (maxDomain - minDomain)) * width;
    const mapY = (val) => y + height - ((val - 0) / 50) * height;
    const A = { x: mapX(minXData), y: mapY(0) };
    const B = { x: mapX(minXData), y: mapY(20) };
    const C = { x: mapX(maxXData), y: mapY(40) };
    const D = { x: mapX(maxXData), y: mapY(0) };
    return (
      <polygon
        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`}
        fill="rgba(0,255,0,0.5)"
        stroke="green"
        strokeWidth={2}
      />
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#333" }}>
        Quality Assurance Data Visualizations
      </Typography>

      {/* Interactive Stacked Bar Chart */}
      <InteractiveStackedBarChart data={data} />

      {/* Pie Chart: Reviewer Distribution */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }} ref={containerRef}>
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

      {/* Revision Chart with Export Button */}
      <Paper elevation={4} sx={{ p: 3, mb: 2, borderRadius: 2, boxShadow: 3 }} ref={revisionChartRef}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1E73BE" }}>
          Revision Rate vs. Cases Past 30 Days
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={revisionScatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" domain={[30, maxXData]}>
              <Label value="Cases Past 30 Days" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis type="number" dataKey="y" domain={[0, 50]}>
              <Label value="Revision Rate (%)" angle={-90} position="insideLeft" />
            </YAxis>
            <Customized content={renderTriangleBackground} />
            <RechartsTooltip content={<CustomTooltipRevision />} />
            <Scatter data={revisionScatterData} shape={renderCustomDot} />
            <Line type="linear" data={lineData} dataKey="y" stroke="#000" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button variant="contained" color="primary" onClick={exportRevisionChartPDF}>
            Export Revision Chart to PDF
          </Button>
        </Box>
      </Paper>

      {/* Performance Chart with Export Button */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }} ref={performanceChartRef}>
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
            <ReferenceArea x1={75} x2={maxAccuracy} y1={75} y2={99} fill="rgba(0,255,0,0.3)" stroke="green" strokeOpacity={0.6} />
            <RechartsTooltip content={<CustomTooltipPerformance />} />
            <Scatter data={performanceScatterData} shape={renderCustomDotForPerformance} />
          </ScatterChart>
        </ResponsiveContainer>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button variant="contained" color="primary" onClick={exportPerformanceChartPDF}>
            Export Performance Chart to PDF
          </Button>
        </Box>
      </Paper>

      {/* Client-Reviewer Grid */}
      <ClientReviewerGrid data={data} />
      
    </Box>
  );
};

export default FLChart;
