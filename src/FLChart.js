// src/FLChart.js

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tooltip as MuiTooltip,
  IconButton,
  Button,
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
  TableBody,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Collapse,
  Popover
} from "@mui/material";

import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TimelineIcon from "@mui/icons-material/Timeline";
import GridViewIcon from "@mui/icons-material/GridView";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useSearchParams } from "react-router-dom";

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
import pdfIcon from "./assets/pdfIcon.png";

// Chart preview images
import QABarChartImg from "./assets/QABarChart.jpg";
import PieChartImg from "./assets/PieChart.jpg";
import RevvCasesImg from "./assets/REvVCases.jpg";
import TimeVAccuracyImg from "./assets/TimeVAccuracy.jpg";
import GridImg from "./assets/Grid.jpg";
import SankeyImg from "./assets/Sankey.jpg";

// -------------------- Chart Colors / Helpers --------------------
const pieColors = [
  "#1E73BE",
  "#FF8042",
  "#FFBB28",
  "#00C49F",
  "#FF6384",
  "#36A2EB"
];

// -------------------- Custom Tooltips --------------------
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

// -------------------- Data Generators --------------------
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

const generateRevisionRateScatterData = (data) =>
  data.map((reviewer) => ({
    x: reviewer.casesPast30Days || 0,
    y: reviewer.revisionRate || 0,
    reviewer: reviewer.name
  }));

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

// Simple no-op for the ComposedChart "Customized" placeholder
const renderTriangleBackground = () => null;

// ---------- MiniImage for Previews ----------
function MiniImage({ src, alt }) {
  return (
    <Box
      sx={{
        borderRadius: 1,
        height: 112,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}
    >
      <Box component="img" src={src} alt={alt} sx={{ height: "100%", width: "auto" }} />
    </Box>
  );
}

// -------------------- ClientReviewerGrid --------------------
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
              <TableCell
                key={client}
                align="center"
                sx={{ color: "white", fontWeight: "bold" }}
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
              sx={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f5f5f5" }}
            >
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

// -------------------- handleExportPDF --------------------
const handleExportPDF = async (elementId, title, event) => {
  event.stopPropagation();
  const ref = document.getElementById(elementId);
  if (!ref) return;
  const canvas = await html2canvas(ref);
  const imgData = canvas.toDataURL("image/png");
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.addImage(imgData, "PNG", 10, 30, 190, 100);
  doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
};

// -------------------- Main FLChart Component --------------------
const FLChart = ({ data }) => {
  // -------------------- 1) Hooks: Unconditional at Top --------------------
  // Panels & expansions
  const [expandedPanels, setExpandedPanels] = useState({});

  // Sankey & KPI states (Card 6)
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [sankeyData, setSankeyData] = useState(null);
  const [kpiData, setKpiData] = useState(null);

  // Pie chart popover (Card 2)
  const containerRef = useRef(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverData, setPopoverData] = useState(null);

  // Searching param (e.g. "?reviewer=John") for Sankey
  const [searchParams] = useSearchParams();

  // ---------- 2) Effects (Unconditional) ----------
  useEffect(() => {
    const reviewerParam = searchParams.get("reviewer");
    if (reviewerParam) {
      setSelectedReviewer(reviewerParam);
      setExpandedPanels((prev) => ({ ...prev, panel6: true }));
      setTimeout(() => {
        const sankeyElem = document.getElementById("sankeyPaperRef");
        if (sankeyElem) {
          sankeyElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (selectedReviewer && expandedPanels["panel6"]) {
      handleGenerateSankey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReviewer, expandedPanels]);

  // ---------- 3) Utility Functions ----------

  const togglePanel = (panel, event) => {
    event.stopPropagation();
    setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const handleSliceClick = (payload, event) => {
    event.stopPropagation();
    setPopoverAnchor(event.currentTarget);
    setPopoverData(payload);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverData(null);
  };

  const handleCopyNames = () => {
    if (popoverData && popoverData.names) {
      const textToCopy = popoverData.names.join(", ");
      navigator.clipboard.writeText(textToCopy);
      alert(`Copied: ${textToCopy}`);
    }
  };

  // Sankey & KPI logic
  const computeOverallKPIs = (allData) => {
    let totalCases = 0,
      totalRevised = 0,
      totalLate = 0;
    allData.forEach((row) => {
      const total = row.casesPast30Days || 0;
      const revised = Math.round(((row.revisionRate || 0) * total) / 100);
      const late = Math.round(((row.lateCasePercentage || 0) * total) / 100);
      totalCases += total;
      totalRevised += revised;
      totalLate += late;
    });
    const overallDirect = Math.max(0, totalCases - totalRevised - totalLate);
    return {
      totalCases,
      overallDirect,
      totalRevised,
      totalLate,
      percentDirect: totalCases ? (overallDirect / totalCases) * 100 : 0,
      percentRevised: totalCases ? (totalRevised / totalCases) * 100 : 0,
      percentLate: totalCases ? (totalLate / totalCases) * 100 : 0
    };
  };

  const overallKPIs = Array.isArray(data) ? computeOverallKPIs(data) : null;

  const getColor = (reviewerValue, overallValue, isHigherBetter = true) => {
    if (isHigherBetter) {
      return reviewerValue >= overallValue ? "green" : "red";
    } else {
      return reviewerValue <= overallValue ? "green" : "red";
    }
  };

  const handleGenerateSankey = () => {
    if (!selectedReviewer || !Array.isArray(data)) return;
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
        {
          name: "Direct Completed",
          color: "#66BB6A",
          value: directCompleted,
          percent: percentDirect
        },
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
    setKpiData({
      total,
      directCompleted,
      revised,
      late,
      percentDirect,
      percentRevised,
      percentLate
    });
  };

  // ---------- 4) Prepare Chart Data ----------
  const pieDataGenerated = Array.isArray(data) ? generatePieData(data) : [];
  const revisionScatterData = Array.isArray(data)
    ? generateRevisionRateScatterData(data)
    : [];
  const performanceScatterData = Array.isArray(data)
    ? generatePerformanceScatterData(data)
    : [];

  // Revisions vs. Case Volume boundary line (can optimize in practice)
  const xValues = revisionScatterData.map((d) => d.x);
  const minXData = xValues.length ? Math.min(...xValues) : 0;
  const maxXData = xValues.length ? Math.max(...xValues) : 100;
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

  // ---------- 5) Conditional Rendering (AFTER Hooks) ----------
  if (!Array.isArray(data) || data.length === 0) {
    return <Typography sx={{ ml: 2, mt: 2 }}>No data available.</Typography>;
  }

  // Otherwise, render the full chart UI
  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Grid container spacing={3}>
        {/* ---------- CARD 1: Quality Scores (Stacked Bar Chart) ---------- */}
        <Grid item xs={12} md={expandedPanels["panel1"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<BarChartIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Quality Scores
                </Typography>
              }
              subheader="(Stacked Bar Chart)"
              action={
                expandedPanels["panel1"] ? (
                  <KeyboardArrowUpIcon sx={{ color: "black" }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ color: "black" }} />
                )
              }
              sx={{
                background: "linear-gradient(to right, #E3F2FD, #90CAF9)",
                borderBottom: "1px solid #0D47A1",
                cursor: "pointer"
              }}
              onClick={(e) => togglePanel("panel1", e)}
            />
            {!expandedPanels["panel1"] && (
              <CardContent>
                <MiniImage src={QABarChartImg} alt="Mini preview of Quality Scores" />
              </CardContent>
            )}
            <Collapse in={expandedPanels["panel1"]} timeout="auto" unmountOnExit>
              <CardContent id="qualityScoresRef" sx={{ backgroundColor: "#fff" }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    This stacked bar chart shows each reviewer’s overall quality scores.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <InteractiveStackedBarChart data={data} />

                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    *Methodology: Quality Score = Accuracy (60%) + Timeliness (20%) + Efficiency
                    (20%)*  
                  </Typography>
                </Paper>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <MuiTooltip title="Export Quality Scores to PDF">
                  <IconButton
                    onClick={(e) => handleExportPDF("qualityScoresRef", "Quality Scores", e)}
                  >
                    <Box
                      component="img"
                      src={pdfIcon}
                      alt="PDF Icon"
                      sx={{ width: 40, height: 40 }}
                    />
                  </IconButton>
                </MuiTooltip>
              </CardActions>
            </Collapse>
          </Card>
        </Grid>

        {/* ---------- CARD 2: Reviewer Distribution (Pie Chart) ---------- */}
        <Grid item xs={12} md={expandedPanels["panel2"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<PieChartIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Reviewer Distribution
                </Typography>
              }
              subheader="(Pie Chart)"
              action={
                expandedPanels["panel2"] ? (
                  <KeyboardArrowUpIcon sx={{ color: "black" }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ color: "black" }} />
                )
              }
              sx={{
                background: "linear-gradient(to right, #E1F5FE, #81D4FA)",
                borderBottom: "1px solid #0D47A1",
                cursor: "pointer"
              }}
              onClick={(e) => togglePanel("panel2", e)}
            />
            {!expandedPanels["panel2"] && (
              <CardContent>
                <MiniImage src={PieChartImg} alt="Mini preview of Reviewer Distribution" />
              </CardContent>
            )}
            <Collapse in={expandedPanels["panel2"]} timeout="auto" unmountOnExit>
              <CardContent ref={containerRef} sx={{ backgroundColor: "#fff" }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    This pie chart depicts the distribution of reviewers per client.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={pieDataGenerated}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(1)}%)`
                        }
                        outerRadius={150}
                        dataKey="value"
                        onClick={(dataObj, index, event) =>
                          handleSliceClick(dataObj.payload, event)
                        }
                      >
                        {pieDataGenerated.map((entry) => (
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
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <MuiTooltip title="Export Reviewer Distribution to PDF">
                  <IconButton
                    onClick={(e) =>
                      handleExportPDF("reviewerDistRef", "Reviewer Distribution", e)
                    }
                  >
                    <Box
                      component="img"
                      src={pdfIcon}
                      alt="PDF Icon"
                      sx={{ width: 40, height: 40 }}
                    />
                  </IconButton>
                </MuiTooltip>
              </CardActions>
            </Collapse>
          </Card>
        </Grid>

        <Popover
          open={Boolean(popoverAnchor)}
          anchorEl={popoverAnchor}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: "center", horizontal: "left" }}
          transformOrigin={{ vertical: "center", horizontal: "right" }}
        >
          {popoverData && (
            <Box sx={{ p: 2, maxWidth: 300 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {popoverData.name} ({popoverData.value} reviewer
                {popoverData.value > 1 ? "s" : ""})
              </Typography>
              <Box component="ul" sx={{ pl: 3, mt: 1 }}>
                {popoverData.names.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCopyNames}
                sx={{ mt: 1 }}
              >
                Copy Names
              </Button>
            </Box>
          )}
        </Popover>

        {/* ---------- CARD 3: Revisions vs. Case Volume ---------- */}
        <Grid item xs={12} md={expandedPanels["panel3"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<AssessmentIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Revisions vs. Case Volume
                </Typography>
              }
              subheader="(Composed Chart)"
              action={
                expandedPanels["panel3"] ? (
                  <KeyboardArrowUpIcon sx={{ color: "black" }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ color: "black" }} />
                )
              }
              sx={{
                background: "linear-gradient(to right, #F1F8E9, #C5E1A5)",
                borderBottom: "1px solid #0D47A1",
                cursor: "pointer"
              }}
              onClick={(e) => togglePanel("panel3", e)}
            />
            {!expandedPanels["panel3"] && (
              <CardContent>
                <MiniImage src={RevvCasesImg} alt="Mini preview of Revisions vs. Case Volume" />
              </CardContent>
            )}
            <Collapse in={expandedPanels["panel3"]} timeout="auto" unmountOnExit>
              <CardContent id="revisionChartRef" sx={{ backgroundColor: "#fff" }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    "Yield". This chart compares the number of cases each reviewer handled
                    (past 30 days) to their revision rate.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                      data={revisionScatterData}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
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
                </Paper>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <MuiTooltip title="Export Revision Chart to PDF">
                  <IconButton
                    onClick={(e) =>
                      handleExportPDF(
                        "revisionChartRef",
                        "Revision Rate vs. Cases Past 30 Days",
                        e
                      )
                    }
                  >
                    <Box
                      component="img"
                      src={pdfIcon}
                      alt="PDF Icon"
                      sx={{ width: 40, height: 40 }}
                    />
                  </IconButton>
                </MuiTooltip>
              </CardActions>
            </Collapse>
          </Card>
        </Grid>

        {/* ---------- CARD 4: Timeliness vs. Accuracy ---------- */}
        <Grid item xs={12} md={expandedPanels["panel4"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<TimelineIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Timeliness vs. Accuracy
                </Typography>
              }
              subheader="(Scatter Chart with Quadrant Analysis)"
              action={
                expandedPanels["panel4"] ? (
                  <KeyboardArrowUpIcon sx={{ color: "black" }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ color: "black" }} />
                )
              }
              sx={{
                background: "linear-gradient(to right, #FCE4EC, #F8BBD0)",
                borderBottom: "1px solid #0D47A1",
                cursor: "pointer"
              }}
              onClick={(e) => togglePanel("panel4", e)}
            />
            {!expandedPanels["panel4"] && (
              <CardContent>
                <MiniImage src={TimeVAccuracyImg} alt="Mini preview of Timeliness vs. Accuracy" />
              </CardContent>
            )}
            <Collapse in={expandedPanels["panel4"]} timeout="auto" unmountOnExit>
              <CardContent id="performanceChartRef" sx={{ backgroundColor: "#fff" }}>
                <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    "Effectiveness". This chart plots each reviewer’s timeliness and accuracy.
                    Green dots indicate strong performance.
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
                      <Scatter
                        data={performanceScatterData}
                        shape={renderCustomDotForPerformance}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </Paper>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <MuiTooltip title="Export Performance Chart to PDF">
                  <IconButton
                    onClick={(e) =>
                      handleExportPDF("performanceChartRef", "Accuracy vs. Timeliness", e)
                    }
                  >
                    <Box
                      component="img"
                      src={pdfIcon}
                      alt="PDF Icon"
                      sx={{ width: 40, height: 40 }}
                    />
                  </IconButton>
                </MuiTooltip>
              </CardActions>
            </Collapse>
          </Card>
        </Grid>

        {/* ---------- CARD 5: Clients Per Reviewer ---------- */}
        <Grid item xs={12} md={expandedPanels["panel5"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<GridViewIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Clients Per Reviewer
                </Typography>
              }
              subheader="(Grid)"
              action={
                expandedPanels["panel5"] ? (
                  <KeyboardArrowUpIcon sx={{ color: "black" }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ color: "black" }} />
                )
              }
              sx={{
                background: "linear-gradient(to right, #FFF3E0, #FFCC80)",
                borderBottom: "1px solid #0D47A1",
                cursor: "pointer"
              }}
              onClick={(e) => togglePanel("panel5", e)}
            />
            {!expandedPanels["panel5"] && (
              <CardContent>
                <MiniImage src={GridImg} alt="Mini preview of Clients Per Reviewer" />
              </CardContent>
            )}
            <Collapse in={expandedPanels["panel5"]} timeout="auto" unmountOnExit>
              <CardContent sx={{ backgroundColor: "#fff" }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    This grid shows which clients each reviewer handles.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ClientReviewerGrid data={data} />
                </Paper>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* ---------- CARD 6: Workflow Sankey ---------- */}
        <Grid item xs={12} md={expandedPanels["panel6"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<AssessmentIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Workflow Sankey
                </Typography>
              }
              subheader="(Flow Diagram)"
              action={
                expandedPanels["panel6"] ? (
                  <KeyboardArrowUpIcon sx={{ color: "black" }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ color: "black" }} />
                )
              }
              sx={{
                background: "linear-gradient(to right, #E8F5E9, #A5D6A7)",
                borderBottom: "1px solid #0D47A1",
                cursor: "pointer"
              }}
              onClick={(e) => togglePanel("panel6", e)}
            />
            {!expandedPanels["panel6"] && (
              <CardContent>
                <MiniImage src={SankeyImg} alt="Mini preview of Workflow Sankey" />
              </CardContent>
            )}
            <Collapse in={expandedPanels["panel6"]} timeout="auto" unmountOnExit>
              <CardContent id="sankeyPaperRef" sx={{ backgroundColor: "#fff" }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Generate a workflow Sankey diagram for a selected reviewer.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Reviewer</InputLabel>
                    <Select
                      value={selectedReviewer}
                      label="Reviewer"
                      onChange={(e) =>
                        e.stopPropagation() || setSelectedReviewer(e.target.value)
                      }
                    >
                      <MenuItem value="">(None)</MenuItem>
                      {data.map((rev) => (
                        <MenuItem key={rev.name} value={rev.name}>
                          {rev.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateSankey();
                    }}
                    sx={{ mb: 2 }}
                  >
                    Generate Workflow Sankey
                  </Button>
                  {sankeyData && kpiData && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={350}>
                          <Sankey
                            data={sankeyData}
                            nodeWidth={20}
                            nodePadding={5}
                            margin={{ top: 20, bottom: 20, left: 50, right: 50 }}
                            link={{ stroke: "#8884d8", strokeWidth: 4 }}
                            node={({
                              x,
                              y,
                              width,
                              height,
                              payload
                            }) => {
                              let infoText = "";
                              if (payload.name === "Received" || payload.name === "Completed") {
                                infoText = `${payload.value || 0}`;
                              } else {
                                infoText = `${
                                  payload.percent ? payload.percent.toFixed(1) : 0
                                }%`;
                              }
                              return (
                                <MuiTooltip
                                  title={`${payload.name}: ${infoText}`}
                                  arrow
                                  enterDelay={100}
                                  leaveDelay={100}
                                >
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
                            }}
                          />
                        </ResponsiveContainer>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              {selectedReviewer} KPI Summary
                            </Typography>
                            <Typography variant="body2">
                              <strong>Total Cases:</strong> {kpiData.total}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Direct Completed:</strong> {kpiData.directCompleted} (
                              <span
                                style={{
                                  color: getColor(
                                    kpiData.percentDirect,
                                    overallKPIs.percentDirect,
                                    true
                                  )
                                }}
                              >
                                {kpiData.percentDirect.toFixed(1)}%
                              </span>
                              )
                            </Typography>
                            <Typography variant="body2">
                              <strong>Revised:</strong> {kpiData.revised} (
                              <span
                                style={{
                                  color: getColor(
                                    kpiData.percentRevised,
                                    overallKPIs.percentRevised,
                                    false
                                  )
                                }}
                              >
                                {kpiData.percentRevised.toFixed(1)}%
                              </span>
                              )
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                              <strong>Late:</strong> {kpiData.late} (
                              <span
                                style={{
                                  color: getColor(
                                    kpiData.percentLate,
                                    overallKPIs.percentLate,
                                    false
                                  )
                                }}
                              >
                                {kpiData.percentLate.toFixed(1)}%
                              </span>
                              )
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle1" sx={{ mt: 1 }}>
                              Overall Averages
                            </Typography>
                            <Typography variant="body2">
                              <strong>Total Cases:</strong> {overallKPIs.totalCases}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Direct Completed:</strong>{" "}
                              {overallKPIs.overallDirect} ({overallKPIs.percentDirect.toFixed(1)}%)
                            </Typography>
                            <Typography variant="body2">
                              <strong>Revised:</strong> {overallKPIs.totalRevised} (
                              {overallKPIs.percentRevised.toFixed(1)}%)
                            </Typography>
                            <Typography variant="body2">
                              <strong>Late:</strong> {overallKPIs.totalLate} (
                              {overallKPIs.percentLate.toFixed(1)}%)
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </Paper>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <MuiTooltip title="Export Workflow Sankey to PDF">
                  <IconButton
                    onClick={(e) => handleExportPDF("sankeyPaperRef", "Workflow Sankey", e)}
                  >
                    <Box
                      component="img"
                      src={pdfIcon}
                      alt="PDF Icon"
                      sx={{ width: 40, height: 40 }}
                    />
                  </IconButton>
                </MuiTooltip>
              </CardActions>
            </Collapse>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FLChart;
