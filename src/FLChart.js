// src/FLChart.js
import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Tooltip as MuiTooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Popover,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  TableBody
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TimelineIcon from "@mui/icons-material/Timeline";
import GridViewIcon from "@mui/icons-material/GridView";

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
  Sankey
} from "recharts";
import InteractiveStackedBarChart from "./InteractiveStackedBarChart";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Icons and assets
import pdfIcon from "./assets/pdfIcon.png";

// ----- Chart Colors / Helpers -----
const pieColors = [
  "#1E73BE",
  "#FF8042",
  "#FFBB28",
  "#00C49F",
  "#FF6384",
  "#36A2EB"
];

const renderTriangleBackground = () => null;

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
    color: pieColors[index % pieColors.length]
  }));
};

// Helper: Generate scatter data for Revision Rate vs. Cases Past 30 Days.
const generateRevisionRateScatterData = (data) =>
  data.map((reviewer) => ({
    x: reviewer.casesPast30Days || 0,
    y: reviewer.revisionRate || 0,
    reviewer: reviewer.name
  }));

// Helper: Generate scatter data for Accuracy vs. Timeliness.
const generatePerformanceScatterData = (data) =>
  data
    .filter(
      (reviewer) =>
        typeof reviewer.accuracyScore === "number" &&
        typeof reviewer.timelinessScore === "number"
    )
    .map((reviewer) => ({
      accuracy: reviewer.accuracyScore || 50,
      timeliness: reviewer.timelinessScore || 50,
      reviewer: reviewer.name
    }));

// ----- Custom Node Renderer for Sankey Diagram with MUI Tooltip -----
const CustomSankeyNode = (props) => {
  const { x, y, width, height, payload } = props;
  let infoText = "";
  if (payload.name === "Received" || payload.name === "Completed") {
    infoText = `${payload.value || 0}`;
  } else {
    infoText = `${payload.percent ? payload.percent.toFixed(1) : 0}%`;
  }
  return (
    <MuiTooltip title={`${payload.name}: ${infoText}`} arrow enterDelay={100} leaveDelay={100}>
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={payload.color || "#8884d8"}
          stroke="#fff"
          strokeWidth={2}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#000"
          fontSize={12}
          fontWeight="bold"
          dy={4}
        >
          {payload.name}
        </text>
      </g>
    </MuiTooltip>
  );
};

// ----- Component: ClientReviewerGrid (Sortable Table) -----
const ClientReviewerGrid = ({ data }) => {
  const fixedClientOrder = [
    "PFR",
    "Lincoln",
    "Hartford",
    "Peer Review",
    "NYL",
    "Telco",
    "Standard",
    "LTC",
    "Muckleshoot"
  ];
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("Reviewer");

  const rows = data.map((reviewer) => {
    const reviewerClients = reviewer.clients.split(",").map((c) => c.trim());
    let row = { Reviewer: reviewer.name };
    fixedClientOrder.forEach((client) => {
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
    <TableContainer component={Paper} sx={{ mt: 2, border: "1px solid #ccc" }}>
      <Typography variant="h6" sx={{ p: 2, color: "#1E73BE" }}>
        Reviewer - Client Assignments
      </Typography>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#1976d2" }}>
            <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
              <TableSortLabel
                active={orderBy === "Reviewer"}
                direction={orderBy === "Reviewer" ? order : "asc"}
                onClick={() => handleRequestSort("Reviewer")}
              >
                Reviewer
              </TableSortLabel>
            </TableCell>
            {fixedClientOrder.map((client) => (
              <TableCell key={client} align="center" sx={{ color: "white", fontWeight: "bold" }}>
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
            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#bbdefb" }}>
                {row["Reviewer"]}
              </TableCell>
              {fixedClientOrder.map((client) => (
                <TableCell key={client} align="center">
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

// ----- Main FLChart Component -----
const FLChart = ({ data }) => {
  // Expand/Collapse state for Accordions
  const [expandedPanels, setExpandedPanels] = useState([]);
  const handleChange = (panel) => {
    setExpandedPanels((prev) =>
      prev.includes(panel) ? prev.filter((p) => p !== panel) : [...prev, panel]
    );
  };

  // ---------- For existing sections (Panels 1-5) ----------
  const containerRef = useRef(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverData, setPopoverData] = useState(null);
  const handleSliceClick = (payload) => {
    setPopoverData(payload);
    setPopoverOpen(true);
  };
  const handlePopoverClose = () => {
    setPopoverOpen(false);
    setPopoverData(null);
  };
  const handleCopy = () => {
    if (popoverData && popoverData.names) {
      const textToCopy = popoverData.names.join(", ");
      navigator.clipboard.writeText(textToCopy);
      alert(`Copied: ${textToCopy}`);
    }
  };

  const pieData = generatePieData(data);
  const revisionScatterData = generateRevisionRateScatterData(data);
  const performanceScatterData = generatePerformanceScatterData(data);

  // ---------- Update boundary line for Revisions vs. Case Volume chart ----------
  const xValues = revisionScatterData.map((d) => d.x);
  const minXData = Math.min(...xValues);
  const maxXData = Math.max(...xValues);
  let lineData = [];
  if (maxXData > 90) {
    lineData = [
      { x: minXData, y: 0 },
      { x: minXData, y: 20 },
      { x: 90, y: 30 },
      { x: maxXData, y: 30 }
    ];
  } else {
    const slope = (30 - 20) / (90 - minXData);
    lineData = [
      { x: minXData, y: 0 },
      { x: minXData, y: 20 },
      { x: maxXData, y: 20 + slope * (maxXData - minXData) }
    ];
  }
  const renderCustomDot = (props) => {
    const { cx, cy, payload } = props;
    let expectedY;
    if (payload.x <= minXData) {
      expectedY = 20;
    } else if (payload.x >= 90) {
      expectedY = 30;
    } else {
      const slope = (30 - 20) / (90 - minXData);
      expectedY = 20 + slope * (payload.x - minXData);
    }
    const fillColor = payload.y < expectedY ? "green" : "red";
    return <circle cx={cx} cy={cy} r={5} fill={fillColor} stroke="#fff" strokeWidth={1} />;
  };
  const renderCustomDotForPerformance = (props) => {
    const { cx, cy, payload } = props;
    const isGreen = payload.accuracy >= 75 && payload.timeliness >= 75;
    return <circle cx={cx} cy={cy} r={5} fill={isGreen ? "green" : "red"} stroke="#fff" strokeWidth={1} />;
  };

  // ---------- 7) Workflow Sankey Section ----------
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [sankeyData, setSankeyData] = useState(null);
  const handleGenerateSankey = () => {
    if (!selectedReviewer) return;
    const row = data.find((r) => r.name === selectedReviewer);
    if (!row) {
      alert("Reviewer not found in data.");
      return;
    }
    const total = row.casesPast30Days || 0;
    const revised = Math.round(((row.revisionRate || 0) * total) / 100);
    const late = Math.round(((row.lateCasePercentage || 0) * total) / 100);
    const directCompleted = Math.max(0, total - revised - late);
    const percentDirect = total ? (directCompleted / total) * 100 : 0;
    const percentRevised = total ? (revised / total) * 100 : 0;
    const percentLate = total ? (late / total) * 100 : 0;
    const sankey = {
      nodes: [
        { name: "Received", color: "#1E73BE", value: total },
        { name: "Direct Completed", color: "#66BB6A", value: directCompleted, percent: percentDirect },
        { name: "Revised", color: "#FFBB28", value: revised, percent: percentRevised },
        { name: "Late", color: "#FF8042", value: late, percent: percentLate },
        { name: "Completed", color: "#9C27B0", value: total }
      ],
      links: [
        { source: 0, target: 1, value: directCompleted },
        { source: 0, target: 2, value: revised },
        { source: 0, target: 3, value: late },
        { source: 1, target: 4, value: directCompleted },
        { source: 2, target: 4, value: revised },
        { source: 3, target: 4, value: late }
      ]
    };
    setSankeyData(sankey);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, color: "#333", fontWeight: "bold" }}>
        Data Visualizations
      </Typography>

      {/* Panel 1: Quality Scores (Stacked Bar Chart) */}
      <Accordion
        expanded={expandedPanels.includes("panel1")}
        onChange={() => handleChange("panel1")}
        sx={{ mb: 2, borderRadius: 2, backgroundColor: "#fafafa", "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
          sx={{
            background: "linear-gradient(90deg, #0C3B70 0%, #1E73BE 100%)",
            color: "#fff",
            "&:hover": { opacity: 0.95 },
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <BarChartIcon />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Quality Scores (Stacked Bar Chart)
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              This stacked bar chart shows each reviewer’s overall quality scores. Hover over a bar for details.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <InteractiveStackedBarChart data={data} />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
              *Methodology: Quality Score = Accuracy (60%) + Timeliness (20%) + Efficiency (20%)*
            </Typography>
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Panel 2: Reviewer Distribution (Pie Chart) */}
      <Accordion
        expanded={expandedPanels.includes("panel2")}
        onChange={() => handleChange("panel2")}
        sx={{ mb: 2, borderRadius: 2, backgroundColor: "#fafafa", "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
          sx={{
            background: "linear-gradient(90deg, #0C3B70 0%, #1E73BE 100%)",
            color: "#fff",
            "&:hover": { opacity: 0.95 },
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <PieChartIcon />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Reviewer Distribution (Pie Chart)
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }} ref={containerRef}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              This pie chart depicts the distribution of reviewers per client. Click on a slice for more details.
            </Typography>
            <Divider sx={{ mb: 2 }} />
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
          <Popover
            open={popoverOpen}
            anchorEl={containerRef.current}
            onClose={handlePopoverClose}
            anchorOrigin={{ vertical: "center", horizontal: "left" }}
            transformOrigin={{ vertical: "center", horizontal: "right" }}
          >
            {popoverData && (
              <Box sx={{ p: 2, maxWidth: 300 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {popoverData.name} ({popoverData.value} reviewer{popoverData.value > 1 ? "s" : ""})
                </Typography>
                <Box component="ul" sx={{ pl: 3, mt: 1 }}>
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
        </AccordionDetails>
      </Accordion>

      {/* Panel 3: Revisions vs. Case Volume Chart */}
      <Accordion
        expanded={expandedPanels.includes("panel3")}
        onChange={() => handleChange("panel3")}
        sx={{ mb: 2, borderRadius: 2, backgroundColor: "#fafafa", "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
          sx={{
            background: "linear-gradient(90deg, #0C3B70 0%, #1E73BE 100%)",
            color: "#fff",
            "&:hover": { opacity: 0.95 },
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <AssessmentIcon />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Revisions vs. Case Volume Chart
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Paper elevation={4} sx={{ p: 3, mb: 2, borderRadius: 2 }} id="revisionChartRef">
            <Typography variant="h6" sx={{ mb: 1 }}>
              This chart compares the number of cases each reviewer handled (past 30 days) to their revision rate.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={revisionScatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x">
                  <Label value="Cases Past 30 Days" offset={-5} position="insideBottom" />
                </XAxis>
                <YAxis type="number" dataKey="y" domain={[0, 50]}>
                  <Label value="Revision Rate (%)" angle={-90} position="insideLeft" />
                </YAxis>
                <Customized content={renderTriangleBackground} />
                <RechartsTooltip content={<CustomTooltipRevision />} />
                <Scatter data={revisionScatterData} shape={renderCustomDot} />
                <Line data={lineData} dataKey="y" stroke="#000" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <MuiTooltip title="Export Revision Chart to PDF">
                <IconButton
                  onClick={async () => {
                    const ref = document.getElementById("revisionChartRef");
                    if (!ref) return;
                    const canvas = await html2canvas(ref);
                    const imgData = canvas.toDataURL("image/png");
                    const doc = new jsPDF();
                    doc.setFontSize(16);
                    doc.text("Revision Rate vs. Cases Past 30 Days", 14, 20);
                    doc.addImage(imgData, "PNG", 10, 30, 190, 100);
                    doc.save("revision_chart.pdf");
                  }}
                >
                  <Box component="img" src={pdfIcon} alt="PDF Icon" sx={{ width: 40, height: 40 }} />
                </IconButton>
              </MuiTooltip>
            </Box>
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Panel 4: Timeliness vs. Accuracy Chart */}
      <Accordion
        expanded={expandedPanels.includes("panel4")}
        onChange={() => handleChange("panel4")}
        sx={{ mb: 2, borderRadius: 2, backgroundColor: "#fafafa", "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
          sx={{
            background: "linear-gradient(90deg, #0C3B70 0%, #1E73BE 100%)",
            color: "#fff",
            "&:hover": { opacity: 0.95 },
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <TimelineIcon />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Timeliness vs. Accuracy Chart
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2 }} id="performanceChartRef">
            <Typography variant="h6" sx={{ mb: 1 }}>
              This chart plots each reviewer’s timeliness and accuracy. Green dots indicate strong performance.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="accuracy" domain={[20, "dataMax"]}>
                  <Label value="Accuracy (%)" offset={-5} position="insideBottom" />
                </XAxis>
                <YAxis type="number" dataKey="timeliness" domain={[50, "dataMax"]}>
                  <Label value="Timeliness (%)" angle={-90} position="insideLeft" />
                </YAxis>
                <ReferenceArea x1={75} y1={75} fill="rgba(0,255,0,0.2)" />
                <RechartsTooltip content={<CustomTooltipPerformance />} />
                <Scatter data={performanceScatterData} shape={renderCustomDotForPerformance} />
              </ScatterChart>
            </ResponsiveContainer>
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <MuiTooltip title="Export Performance Chart to PDF">
                <IconButton
                  onClick={async () => {
                    const ref = document.getElementById("performanceChartRef");
                    if (!ref) return;
                    const canvas = await html2canvas(ref);
                    const imgData = canvas.toDataURL("image/png");
                    const doc = new jsPDF();
                    doc.setFontSize(16);
                    doc.text("Accuracy vs. Timeliness", 14, 20);
                    doc.addImage(imgData, "PNG", 10, 30, 190, 100);
                    doc.save("performance_chart.pdf");
                  }}
                >
                  <Box component="img" src={pdfIcon} alt="PDF Icon" sx={{ width: 40, height: 40 }} />
                </IconButton>
              </MuiTooltip>
            </Box>
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Panel 5: Clients Per Reviewer - Grid */}
      <Accordion
        expanded={expandedPanels.includes("panel5")}
        onChange={() => handleChange("panel5")}
        sx={{ mb: 2, borderRadius: 2, backgroundColor: "#fafafa", "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
          sx={{
            background: "linear-gradient(90deg, #0C3B70 0%, #1E73BE 100%)",
            color: "#fff",
            "&:hover": { opacity: 0.95 },
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <GridViewIcon />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Clients Per Reviewer - Grid
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              This grid shows which clients each reviewer handles. Click column headers to sort.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ClientReviewerGrid data={data} />
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Panel 7: Workflow Sankey */}
      <Accordion
        expanded={expandedPanels.includes("panel7")}
        onChange={() => handleChange("panel7")}
        sx={{ mb: 2, borderRadius: 2, backgroundColor: "#fafafa", "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#1E73BE" }} />}
          sx={{
            background: "linear-gradient(90deg, #0C3B70 0%, #1E73BE 100%)",
            color: "#fff",
            "&:hover": { opacity: 0.95 },
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <AssessmentIcon />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Workflow Sankey
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Generate a workflow Sankey diagram for a selected reviewer.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Reviewer</InputLabel>
              <Select
                value={selectedReviewer}
                label="Reviewer"
                onChange={(e) => setSelectedReviewer(e.target.value)}
              >
                <MenuItem value="">(None)</MenuItem>
                {data.map((rev) => (
                  <MenuItem key={rev.name} value={rev.name}>
                    {rev.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleGenerateSankey} sx={{ mb: 2 }}>
              Generate Workflow Sankey
            </Button>
            {sankeyData && (
              <Box sx={{ mt: 2 }}>
                <ResponsiveContainer width="90%" height={350}>
                  <Sankey
                    data={sankeyData}
                    nodeWidth={20}
                    nodePadding={5}
                    margin={{ top: 20, bottom: 20, left: 50, right: 50 }}
                    link={{ stroke: "#8884d8", strokeWidth: 4 }}
                    node={<CustomSankeyNode />}
                  />
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FLChart;
