// src/FLChart.js
import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  TableBody,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Popover
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

// Import your custom PDF icon (40x40)
import pdfIcon from "./assets/pdfIcon.png";

// Define pie chart colors
const pieColors = [
  "#1E73BE",
  "#FF8042",
  "#FFBB28",
  "#00C49F",
  "#FF6384",
  "#36A2EB",
];

// Dummy implementation for renderTriangleBackground to fix the error.
const renderTriangleBackground = (props) => null;

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
  return data.filter(
    (reviewer) =>
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
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("Reviewer");
  const clientOrder = [
    "PFR",
    "Lincoln",
    "Hartford",
    "Peer Review",
    "NYL",
    "Standard",
    "Telco",
    "LTC",
    "Muckleshoot",
  ];

  const rows = data.map((reviewer) => {
    const reviewerClients = reviewer.clients.split(",").map((c) => c.trim());
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
            <TableCell
              sx={{
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
                border: "1px solid #ccc",
              }}
            >
              <TableSortLabel
                active={orderBy === "Reviewer"}
                direction={orderBy === "Reviewer" ? order : "asc"}
                onClick={() => handleRequestSort("Reviewer")}
              >
                Reviewer
              </TableSortLabel>
            </TableCell>
            {clientOrder.map((client) => (
              <TableCell
                key={client}
                align="center"
                sx={{ color: "white", fontWeight: "bold", border: "1px solid #ccc" }}
              >
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
            <TableRow
              key={index}
              sx={{
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#f5f5f5",
                border: "1px solid #ccc",
              }}
            >
              <TableCell
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#bbdefb",
                  border: "1px solid #ccc",
                }}
              >
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
  // Generate chart data
  const pieData = generatePieData(data);
  const revisionScatterData = generateRevisionRateScatterData(data);
  const performanceScatterData = generatePerformanceScatterData(data);

  // For the popover attached to the PieChart
  const containerRef = useRef(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverData, setPopoverData] = useState(null);

  // Refs for chart containers (for export)
  const revisionChartRef = useRef(null);
  const performanceChartRef = useRef(null);

  // Pie slice click => show popover
  const handleSliceClick = (payload) => {
    setPopoverData(payload);
    setPopoverOpen(true);
  };

  // Close popover
  const handlePopoverClose = () => {
    setPopoverOpen(false);
    setPopoverData(null);
  };

  // Copy button in the popover
  const handleCopy = () => {
    if (popoverData && popoverData.names) {
      const textToCopy = popoverData.names.join(", ");
      navigator.clipboard.writeText(textToCopy);
      alert(`Copied: ${textToCopy}`);
    }
  };

  // For the revision chart
  const xValues = revisionScatterData.map((d) => d.x);
  const minXData = Math.min(...xValues);
  const maxXData = Math.max(...xValues);

  // Piecewise line data
  const lineData = [
    { x: minXData, y: 0 },
    { x: minXData, y: 20 },
    { x: maxXData, y: 40 },
  ];

  // Dot renderer for revision chart
  const renderCustomDot = (props) => {
    const { cx, cy, payload } = props;
    const slope = 20 / (maxXData - minXData);
    const expectedY =
      payload.x === minXData ? 20 : 20 + slope * (payload.x - minXData);
    const fillColor = payload.y < expectedY ? "green" : "red";
    return <circle cx={cx} cy={cy} r={5} fill={fillColor} stroke="#fff" strokeWidth={1} />;
  };

  // Dot renderer for performance chart
  const renderCustomDotForPerformance = (props) => {
    const { cx, cy, payload } = props;
    const isInGreenArea =
      payload.accuracy >= 75 && payload.timeliness >= 75 && payload.timeliness <= 99;
    return (
      <circle cx={cx} cy={cy} r={5} fill={isInGreenArea ? "green" : "red"} stroke="#fff" strokeWidth={1} />
    );
  };

  // Max accuracy for performance chart
  const accuracyValues = performanceScatterData.map((d) => d.accuracy);
  const maxAccuracy = Math.max(...accuracyValues);

  // For exporting the revision chart
  const getRevisionChartDotLists = () => {
    const green = [];
    const red = [];
    const slope = 20 / (maxXData - minXData);
    revisionScatterData.forEach((d) => {
      const expectedY = d.x === minXData ? 20 : 20 + slope * (d.x - minXData);
      if (d.y < expectedY) green.push(d.reviewer);
      else red.push(d.reviewer);
    });
    return { green, red };
  };

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

  // For exporting the performance chart
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

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#333" }}>
        Quality Assurance Data Visualizations
      </Typography>

      {/* Accordion-based layout with styling */}
      <Box>
        {/* 1) Quality Scores (Stacked Bar Chart) */}
        <Accordion
          defaultExpanded={false}
          sx={{
            mb: 2,
            borderRadius: 2,
            backgroundColor: "#fafafa",
            "&:before": { display: "none" }, // Removes default MUI divider line
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
            sx={{
              borderLeft: "4px solid transparent",
              "&.Mui-expanded": {
                borderLeft: "4px solid #1E73BE",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "#1E73BE", fontWeight: 600 }}>
              Quality Scores (Stacked Bar Chart)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <InteractiveStackedBarChart data={data} />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
              *Methodology: Quality Score = Accuracy (60%) + Timeliness (20%) + Efficiency (20%)
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* 2) Reviewer Distribution (Pie Chart) */}
        <Accordion
          defaultExpanded={false}
          sx={{
            mb: 2,
            borderRadius: 2,
            backgroundColor: "#fafafa",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
            sx={{
              borderLeft: "4px solid transparent",
              "&.Mui-expanded": {
                borderLeft: "4px solid #1E73BE",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "#1E73BE", fontWeight: 600 }}>
              Reviewer Distribution (Pie Chart)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper
              elevation={4}
              sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}
              ref={containerRef}
            >
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
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
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>

            {/* Popover for listing all reviewers in the slice */}
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
                    {popoverData.name} ({popoverData.value} reviewer
                    {popoverData.value > 1 ? "s" : ""})
                  </Typography>
                  <Box
                    sx={{ m: 0, p: 0, listStyle: "none", fontSize: "0.9em" }}
                    component="ul"
                  >
                    {popoverData.names.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCopy}
                    sx={{ mt: 1 }}
                  >
                    Copy Names
                  </Button>
                </Box>
              )}
            </Popover>
          </AccordionDetails>
        </Accordion>

        {/* 3) Revisions vs. Case Volume Chart */}
        <Accordion
          defaultExpanded={false}
          sx={{
            mb: 2,
            borderRadius: 2,
            backgroundColor: "#fafafa",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
            sx={{
              borderLeft: "4px solid transparent",
              "&.Mui-expanded": {
                borderLeft: "4px solid #1E73BE",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "#1E73BE", fontWeight: 600 }}>
              Revisions vs. Case Volume Chart
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper
              elevation={4}
              sx={{ p: 3, mb: 2, borderRadius: 2, boxShadow: 3 }}
              ref={revisionChartRef}
            >
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                  data={revisionScatterData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" domain={[30, maxXData]}>
                    <Label
                      value="Cases Past 30 Days"
                      offset={-5}
                      position="insideBottom"
                    />
                  </XAxis>
                  <YAxis type="number" dataKey="y" domain={[0, 50]}>
                    <Label
                      value="Revision Rate (%)"
                      angle={-90}
                      position="insideLeft"
                    />
                  </YAxis>
                  <Customized content={renderTriangleBackground} />
                  <RechartsTooltip content={<CustomTooltipRevision />} />
                  <Scatter data={revisionScatterData} shape={renderCustomDot} />
                  <Line
                    type="linear"
                    data={lineData}
                    dataKey="y"
                    stroke="#000"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Tooltip title="Export Revision Chart to PDF">
                  <IconButton onClick={exportRevisionChartPDF}>
                    <Box
                      component="img"
                      src={pdfIcon}
                      alt="PDF Icon"
                      sx={{ width: 40, height: 40 }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* 4) Timeliness vs. Accuracy Chart */}
        <Accordion
          defaultExpanded={false}
          sx={{
            mb: 2,
            borderRadius: 2,
            backgroundColor: "#fafafa",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
            sx={{
              borderLeft: "4px solid transparent",
              "&.Mui-expanded": {
                borderLeft: "4px solid #1E73BE",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "#1E73BE", fontWeight: 600 }}>
              Timeliness vs. Accuracy Chart
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper
              elevation={4}
              sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}
              ref={performanceChartRef}
            >
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="accuracy" domain={[20, "dataMax"]}>
                    <Label
                      value="Accuracy (%)"
                      offset={-5}
                      position="insideBottom"
                    />
                  </XAxis>
                  <YAxis type="number" dataKey="timeliness" domain={[50, "dataMax"]}>
                    <Label
                      value="Timeliness (%)"
                      angle={-90}
                      position="insideLeft"
                    />
                  </YAxis>
                  <ReferenceArea
                    x1={75}
                    x2={maxAccuracy}
                    y1={75}
                    y2={99}
                    fill="rgba(0,255,0,0.3)"
                    stroke="green"
                    strokeOpacity={0.6}
                  />
                  <RechartsTooltip content={<CustomTooltipPerformance />} />
                  <Scatter
                    data={performanceScatterData}
                    shape={renderCustomDotForPerformance}
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Tooltip title="Export Performance Chart to PDF">
                  <IconButton onClick={exportPerformanceChartPDF}>
                    <Box
                      component="img"
                      src={pdfIcon}
                      alt="PDF Icon"
                      sx={{ width: 40, height: 40 }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* 5) Clients Per Reviewer - Grid */}
        <Accordion
          defaultExpanded={false}
          sx={{
            mb: 2,
            borderRadius: 2,
            backgroundColor: "#fafafa",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
            sx={{
              borderLeft: "4px solid transparent",
              "&.Mui-expanded": {
                borderLeft: "4px solid #1E73BE",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "#1E73BE", fontWeight: 600 }}>
              Clients Per Reviewer - Grid
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ClientReviewerGrid data={data} />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default FLChart;
