// src/FLChart.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Collapse,
  Popover,
  Tooltip as MuiTooltip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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

import dayjs from "dayjs";
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

// -------------------- Utility Functions --------------------
// Export chart content to PDF.
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

// Compute overall KPIs across all reviewers.
const computeOverallKPIs = (allData) => {
  let totalCases = 0,
    totalRevised = 0,
    totalLate = 0;
  allData.forEach((reviewer) => {
    const snapshot = getLatestSnapshot(reviewer);
    const total = snapshot ? (snapshot.casesPast30Days || 0) : 0;
    const revised = snapshot ? Math.round(((snapshot.revisionRate || 0) * total) / 100) : 0;
    const late = snapshot ? Math.round(((snapshot.lateCasePercentage || 0) * total) / 100) : 0;
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

const overallKPIsCalc = (data) => (Array.isArray(data) ? computeOverallKPIs(data) : null);

// -------------------- Helpers --------------------
const getLatestSnapshot = (reviewer) => {
  if (!reviewer.snapshots || !Array.isArray(reviewer.snapshots) || reviewer.snapshots.length === 0)
    return null;
  const sorted = reviewer.snapshots.sort(
    (a, b) => dayjs(b.snapshotDate).valueOf() - dayjs(a.snapshotDate).valueOf()
  );
  return sorted[0];
};

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
    reviewer.clients
      .split(",")
      .map((c) => c.trim())
      .forEach((client) => {
        if (!clientData[client]) {
          clientData[client] = { count: 0, names: [] };
        }
        clientData[client].count++;
        clientData[client].names.push(reviewer.name);
      });
  });
  const pieColors = ["#1E73BE", "#FF8042", "#FFBB28", "#00C49F", "#FF6384", "#36A2EB"];
  return Object.keys(clientData).map((client, index) => ({
    name: client,
    value: clientData[client].count,
    names: clientData[client].names,
    color: pieColors[index % pieColors.length]
  }));
};

const generateRevisionRateScatterData = (data) =>
  data.map((reviewer) => {
    const snapshot = getLatestSnapshot(reviewer);
    return {
      x: snapshot ? snapshot.casesPast30Days || 0 : 0,
      y: snapshot ? snapshot.revisionRate || 0 : 0,
      reviewer: reviewer.name
    };
  });

const generatePerformanceScatterData = (data) =>
  data
    .map((reviewer) => {
      const snapshot = getLatestSnapshot(reviewer);
      if (
        snapshot &&
        typeof snapshot.accuracyScore === "number" &&
        typeof snapshot.timelinessScore === "number"
      ) {
        return {
          accuracy: snapshot.accuracyScore || 50,
          timeliness: snapshot.timelinessScore || 50,
          reviewer: reviewer.name
        };
      }
      return null;
    })
    .filter((item) => item !== null);

// No-op for Customized placeholder.
const renderTriangleBackground = () => null;

// -------------------- MiniImage --------------------
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

// -------------------- ClientReviewerGrid Component --------------------
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
  const rows = data.map((reviewer) => {
    const reviewerClients = reviewer.clients.split(",").map((c) => c.trim());
    let row = { Reviewer: reviewer.name };
    fixedClientOrder.forEach((client) => {
      row[client] = reviewerClients.includes(client) ? "X" : "";
    });
    return row;
  });

  return (
    <Paper sx={{ mt: 2, border: "1px solid #ccc", overflowX: "auto", borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" sx={{ p: 2, color: "#fff", textAlign: "center" }}>
        Reviewer - Client Assignments
      </Typography>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            margin: "0 auto",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            borderRadius: 4,
            overflow: "hidden"
          }}
        >
          <colgroup>
            <col style={{ width: `${100 / (fixedClientOrder.length + 1)}%` }} />
            {fixedClientOrder.map((client) => (
              <col key={client} style={{ width: `${100 / (fixedClientOrder.length + 1)}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: "#1976d2" }}>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "4px",
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: "bold"
                }}
              >
                Reviewer
              </th>
              {fixedClientOrder.map((client) => (
                <th
                  key={client}
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px",
                    textAlign: "center",
                    color: "#fff",
                    fontWeight: "bold"
                  }}
                >
                  {client}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f5f5f5" }}>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px",
                    textAlign: "center",
                    fontWeight: "bold"
                  }}
                >
                  {row["Reviewer"]}
                </td>
                {fixedClientOrder.map((client) => (
                  <td key={client} style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center" }}>
                    {row[client]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};

// -------------------- ReviewerDotTable Component --------------------
const ReviewerDotTable = ({ data, minXData }) => {
  const [open, setOpen] = useState(true);
  return (
    <Paper sx={{ p: 1, width: "50%", margin: "16px auto" }}>
      <Box
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          backgroundColor: "#e0e0e0",
          px: 1,
          py: 0.5,
          borderRadius: 1,
          mb: 1
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center", flex: 1 }}>
          Reviewer Dot Table
        </Typography>
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </Box>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <table
          style={{
            width: "100%",
            margin: "0 auto",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            marginTop: "8px"
          }}
        >
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: "#e0e0e0" }}>
              <th style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center" }}>
                Reviewer
              </th>
              <th style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center" }}>Cases</th>
              <th style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center" }}>
                Revision Rate (%)
              </th>
              <th style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center" }}>Meets Goal</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              let expectedY;
              if (d.x <= minXData) {
                expectedY = 20;
              } else if (d.x >= 90) {
                expectedY = 30;
              } else {
                const slope = (30 - 20) / (90 - minXData);
                expectedY = 20 + slope * (d.x - minXData);
              }
              const isGreen = d.y < expectedY;
              const dotColor = isGreen ? "green" : "red";
              const rowBgColor = i % 2 === 0 ? "#fff" : "#f9f9f9";
              return (
                <tr key={i} style={{ backgroundColor: rowBgColor }}>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px",
                      textAlign: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {d.reviewer}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center" }}>{d.x}</td>
                  <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center" }}>
                    {d.y.toFixed(1)}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center", backgroundColor: dotColor }}>
                    &nbsp;
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Collapse>
    </Paper>
  );
};

// -------------------- Main FLChart Component --------------------
const FLChart = ({ data }) => {
  const theme = useTheme();
  // For non-header text in dark mode, use white.
  const textColor = theme.palette.mode === "dark" ? "#fff" : "#000";

  const revisionScatterData = generateRevisionRateScatterData(data);
  const xValues = revisionScatterData.map((d) => d.x);
  const minXData = xValues.length ? Math.min(...xValues) : 0;

  // Custom vertical line renderer using Customized.
  const renderCustomVerticalLine = (props) => {
    const { xAxisMap, yAxisMap } = props;
    const xAxis = Object.values(xAxisMap)[0];
    const yAxis = Object.values(yAxisMap)[0];
    if (!xAxis || !yAxis) return null;
    const xCoord = xAxis.scale(minXData);
    const yCoordBottom = yAxis.scale(0);
    const yCoordTop = yAxis.scale(20);
    return <line x1={xCoord} y1={yCoordBottom} x2={xCoord} y2={yCoordTop} stroke="blue" strokeDasharray="3 3" />;
  };

  const [expandedPanels, setExpandedPanels] = useState({});
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [sankeyData, setSankeyData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [searchParams] = useSearchParams();
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverData, setPopoverData] = useState(null);

  const qualityData = data.map((reviewer) => {
    const snapshot = getLatestSnapshot(reviewer);
    return {
      ...reviewer,
      qualityScore: snapshot ? snapshot.qualityScore : 0,
      accuracyScore: snapshot ? snapshot.accuracyScore : 0,
      timelinessScore: snapshot ? snapshot.timelinessScore : 0,
      efficiencyScore: snapshot ? snapshot.efficiencyScore : 0,
      costPerCase: snapshot ? snapshot.costPerCase : {}
    };
  });

  const togglePanel = (panel, event) => {
    event.stopPropagation();
    setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const getColor = (reviewerValue, overallValue, isHigherBetter = true) => {
    return isHigherBetter
      ? reviewerValue >= overallValue
        ? "green"
        : "red"
      : reviewerValue <= overallValue
      ? "green"
      : "red";
  };

  const handleSliceClick = (payload, event) => {
    event.stopPropagation();
    setPopoverAnchor(event.currentTarget);
    setPopoverData(payload);
  };

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
  }, [searchParams]);

  const handleGenerateSankey = useCallback(() => {
    if (!selectedReviewer || !Array.isArray(data)) return;
    const row = data.find((r) => r.name === selectedReviewer);
    if (!row) {
      alert("Reviewer not found in data.");
      return;
    }
    const snapshot = getLatestSnapshot(row);
    const total = snapshot ? (snapshot.casesPast30Days || 0) : 0;
    const revised = snapshot ? Math.round(((snapshot.revisionRate || 0) * total) / 100) : 0;
    const late = snapshot ? Math.round(((snapshot.lateCasePercentage || 0) * total) / 100) : 0;
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
    setKpiData({
      total,
      directCompleted,
      revised,
      late,
      percentDirect,
      percentRevised,
      percentLate
    });
  }, [selectedReviewer, data]);

  const pieDataGenerated = Array.isArray(data) ? generatePieData(data) : [];
  const performanceScatterData = generatePerformanceScatterData(data);

  let lineData = [];
  if (xValues.length && Math.max(...xValues) > 90) {
    lineData = [
      { x: minXData, y: 20 },
      { x: 90, y: 30 },
      { x: Math.max(...xValues), y: 30 }
    ];
  } else if (xValues.length) {
    const slope = (30 - 20) / (90 - minXData);
    lineData = [
      { x: minXData, y: 20 },
      { x: Math.max(...xValues), y: 20 + slope * (Math.max(...xValues) - minXData) }
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
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={fillColor}
        stroke="#fff"
        strokeWidth={1}
      />
    );
  };

  const renderCustomDotForPerformance = (props) => {
    const { cx, cy, payload } = props;
    const isGreen = payload.accuracy >= 75 && payload.timeliness >= 75;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={isGreen ? "green" : "red"}
        stroke="#fff"
        strokeWidth={1}
      />
    );
  };

  if (!Array.isArray(data) || data.length === 0) {
    return <Typography sx={{ ml: 2, mt: 2, color: textColor }}>No data available.</Typography>;
  }

  const overallKPIs = overallKPIsCalc(data);

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      {/* --- Pie Chart Popover --- */}
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={() => {
          setPopoverAnchor(null);
          setPopoverData(null);
        }}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
      >
        {popoverData && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: textColor }}>
              {popoverData.name} ({popoverData.value} reviewers)
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 1, color: textColor }}>
              {popoverData.names.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => {
                const textToCopy = popoverData.names.join(", ");
                navigator.clipboard.writeText(textToCopy);
                alert(`Copied: ${textToCopy}`);
              }}
            >
              Copy Names
            </Button>
          </Box>
        )}
      </Popover>

      <Grid container spacing={3}>
        {/* CARD 1: Quality Scores */}
        <Grid item xs={12} md={expandedPanels["panel1"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<BarChartIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Quality Scores
                </Typography>
              }
              subheader={
                <Typography sx={{ color: "black" }}>
                  (Stacked Bar Chart)
                </Typography>
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
              {/* Change background color for quality scores content in dark mode */}
              <CardContent id="qualityScoresRef" sx={{ backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#fff", p: 2 }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: textColor }}>
                    This stacked bar chart shows each reviewer’s overall quality scores based on their latest snapshot.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <InteractiveStackedBarChart data={qualityData} />
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: textColor }}>
                    *Methodology: Quality Score = Accuracy (60%) + Timeliness (20%) + Efficiency (20%)*<br />
                    *Hover for cost comparison info.*
                  </Typography>
                </Paper>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <MuiTooltip title="Export Quality Scores to PDF">
                  <IconButton onClick={(e) => handleExportPDF("qualityScoresRef", "Quality Scores", e)}>
                    <Box component="img" src={pdfIcon} alt="PDF Icon" sx={{ width: 40, height: 40 }} />
                  </IconButton>
                </MuiTooltip>
              </CardActions>
            </Collapse>
          </Card>
        </Grid>

        {/* CARD 2: Reviewer Distribution */}
        <Grid item xs={12} md={expandedPanels["panel2"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<PieChartIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Reviewer Distribution
                </Typography>
              }
              subheader={
                <Typography sx={{ color: "black" }}>
                  (Pie Chart)
                </Typography>
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
              <CardContent sx={{ backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#fff" }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: textColor }}>
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
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        outerRadius={150}
                        dataKey="value"
                        onClick={(dataObj, index, event) => handleSliceClick(dataObj.payload, event)}
                      >
                        {pieDataGenerated.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} style={{ cursor: "pointer" }} />
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
                  <IconButton onClick={(e) => handleExportPDF("reviewerDistRef", "Reviewer Distribution", e)}>
                    <Box component="img" src={pdfIcon} alt="PDF Icon" sx={{ width: 40, height: 40 }} />
                  </IconButton>
                </MuiTooltip>
              </CardActions>
            </Collapse>
          </Card>
        </Grid>

        {/* CARD 3: Revisions vs. Case Volume */}
        <Grid item xs={12} md={expandedPanels["panel3"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<AssessmentIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Revisions vs. Case Volume
                </Typography>
              }
              subheader={
                <Typography sx={{ color: "black" }}>
                  (Composed Chart)
                </Typography>
              }
              action={
                expandedPanels["panel3"]
                  ? <KeyboardArrowUpIcon sx={{ color: "black" }} />
                  : <KeyboardArrowDownIcon sx={{ color: "black" }} />
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
              <CardContent id="revisionChartRef" sx={{ backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#fff", p: 2 }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: textColor }}>
                    "Yield". This chart compares the number of cases (from the latest snapshot's past 30 days) to the revision rate.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={revisionScatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        label={{ value: "Cases Past 30 Days", position: "insideBottom", offset: -5, fill: textColor }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        domain={[0, 50]}
                        label={{ value: "Revision Rate (%)", angle: -90, position: "insideLeft", offset: -10, fill: textColor }}
                      />
                      <Customized component={renderCustomVerticalLine} />
                      <Line
                        data={lineData}
                        dataKey="y"
                        stroke="#000"
                        dot={false}
                        isAnimationActive={false}
                        activeDot={false}
                        style={{ pointerEvents: "none" }}
                      />
                      <Customized component={renderTriangleBackground} />
                      <RechartsTooltip content={<CustomTooltipRevision />} />
                      <Scatter data={revisionScatterData} shape={renderCustomDot} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <ReviewerDotTable data={revisionScatterData} minXData={minXData} />
                </Paper>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <MuiTooltip title="Export Revision Chart to PDF">
                  <IconButton onClick={(e) => handleExportPDF("revisionChartRef", "Revision Rate vs. Cases Past 30 Days", e)}>
                    <Box component="img" src={pdfIcon} alt="PDF Icon" sx={{ width: 40, height: 40 }} />
                  </IconButton>
                </MuiTooltip>
              </CardActions>
            </Collapse>
          </Card>
        </Grid>

        {/* CARD 4: Timeliness vs. Accuracy */}
        <Grid item xs={12} md={expandedPanels["panel4"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<TimelineIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Timeliness vs. Accuracy
                </Typography>
              }
              subheader={
                <Typography sx={{ color: "black" }}>
                  (Scatter Chart with Quadrant Analysis)
                </Typography>
              }
              action={
                expandedPanels["panel4"]
                  ? <KeyboardArrowUpIcon sx={{ color: "black" }} />
                  : <KeyboardArrowDownIcon sx={{ color: "black" }} />
              }
              sx={{ background: "linear-gradient(to right, #FCE4EC, #F8BBD0)", borderBottom: "1px solid #0D47A1", cursor: "pointer" }}
              onClick={(e) => togglePanel("panel4", e)}
            />
            {!expandedPanels["panel4"] && (
              <CardContent>
                <MiniImage src={TimeVAccuracyImg} alt="Mini preview of Timeliness vs. Accuracy" />
              </CardContent>
            )}
            <Collapse in={expandedPanels["panel4"]} timeout="auto" unmountOnExit>
              <CardContent id="performanceChartRef" sx={{ backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#fff" }}>
                <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: textColor }}>
                    "Effectiveness". This chart plots each reviewer’s timeliness and accuracy from their latest snapshot.
                    Green dots indicate strong performance.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="accuracy" domain={[20, "dataMax"]}>
                        <Label value="Accuracy (%)" offset={-5} position="insideBottom" fill={textColor} />
                      </XAxis>
                      <YAxis type="number" dataKey="timeliness" domain={[50, "dataMax"]}>
                        <Label value="Timeliness (%)" angle={-90} position="insideLeft" fill={textColor} />
                      </YAxis>
                      <ReferenceArea x1={75} y1={75} fill="rgba(0,255,0,0.2)" />
                      <RechartsTooltip content={<CustomTooltipPerformance />} />
                      <Scatter data={performanceScatterData} shape={renderCustomDotForPerformance} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </Paper>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <MuiTooltip title="Export Performance Chart to PDF">
                  <IconButton onClick={(e) => handleExportPDF("performanceChartRef", "Accuracy vs. Timeliness", e)}>
                    <Box component="img" src={pdfIcon} alt="PDF Icon" sx={{ width: 40, height: 40 }} />
                  </IconButton>
                </MuiTooltip>
              </CardActions>
            </Collapse>
          </Card>
        </Grid>

        {/* CARD 5: Clients Per Reviewer */}
        <Grid item xs={12} md={expandedPanels["panel5"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<GridViewIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Clients Per Reviewer
                </Typography>
              }
              subheader={
                <Typography sx={{ color: "black" }}>
                  (Grid)
                </Typography>
              }
              sx={{ background: "linear-gradient(to right, #FFF3E0, #FFCC80)", borderBottom: "1px solid #0D47A1", cursor: "pointer" }}
              onClick={(e) => togglePanel("panel5", e)}
            />
            {!expandedPanels["panel5"] && (
              <CardContent>
                <MiniImage src={GridImg} alt="Mini preview of Clients Per Reviewer" />
              </CardContent>
            )}
            <Collapse in={expandedPanels["panel5"]} timeout="auto" unmountOnExit>
              <CardContent sx={{ backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#fff" }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: textColor }}>
                    This grid shows which clients each reviewer handles.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ClientReviewerGrid data={data} />
                </Paper>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* CARD 6: Workflow Sankey */}
        <Grid item xs={12} md={expandedPanels["panel6"] ? 12 : 4}>
          <Card sx={{ minHeight: 240, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              avatar={<AssessmentIcon sx={{ color: "#fff" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                  Workflow Sankey
                </Typography>
              }
              subheader={
                <Typography sx={{ color: "black" }}>
                  (Flow Diagram - Past 30 Days)
                </Typography>
              }
              action={
                expandedPanels["panel6"]
                  ? <KeyboardArrowUpIcon sx={{ color: "black" }} />
                  : <KeyboardArrowDownIcon sx={{ color: "black" }} />
              }
              sx={{ background: "linear-gradient(to right, #E8F5E9, #A5D6A7)", borderBottom: "1px solid #0D47A1", cursor: "pointer" }}
              onClick={(e) => togglePanel("panel6", e)}
            />
            {!expandedPanels["panel6"] && (
              <CardContent>
                <MiniImage src={SankeyImg} alt="Mini preview of Workflow Sankey" />
              </CardContent>
            )}
            <Collapse in={expandedPanels["panel6"]} timeout="auto" unmountOnExit>
              <CardContent id="sankeyPaperRef" sx={{ backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#fff", p: 2 }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: textColor }}>
                    Generate a workflow Sankey diagram for a selected reviewer.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel
                      sx={{
                        color: textColor,
                        "&.Mui-focused": { color: textColor }
                      }}
                    >
                      Reviewer
                    </InputLabel>
                    <Select
                      value={selectedReviewer}
                      label="Reviewer"
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelectedReviewer(e.target.value);
                      }}
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
                      <MenuItem value="" sx={{ color: textColor }}>
                        (None)
                      </MenuItem>
                      {data.map((rev) => (
                        <MenuItem key={rev.name} value={rev.name} sx={{ color: textColor }}>
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
                  {sankeyData && kpiData ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={350}>
                          <Sankey
                            data={sankeyData}
                            nodeWidth={20}
                            nodePadding={5}
                            margin={{ top: 20, bottom: 20, left: 50, right: 50 }}
                            link={{ stroke: "#8884d8", strokeWidth: 4 }}
                            node={({ x, y, width, height, payload }) => {
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
                                      fill={textColor}
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
                            <Typography variant="h6" sx={{ mb: 1, textAlign: "center", color: textColor }}>
                              {selectedReviewer} KPI Summary
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "center", color: textColor }}>
                              <strong>Total Cases:</strong> {kpiData.total}
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "center", color: textColor }}>
                              <strong>Direct Completed:</strong> {kpiData.directCompleted} (
                              <span style={{ color: getColor(kpiData.percentDirect, overallKPIsCalc(data).percentDirect, true) }}>
                                {kpiData.percentDirect.toFixed(1)}%
                              </span>
                              )
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "center", color: textColor }}>
                              <strong>Revised:</strong> {kpiData.revised} (
                              <span style={{ color: getColor(kpiData.percentRevised, overallKPIsCalc(data).percentRevised, false) }}>
                                {kpiData.percentRevised.toFixed(1)}%
                              </span>
                              )
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "center", color: textColor }}>
                              <strong>Late:</strong> {kpiData.late} (
                              <span style={{ color: getColor(kpiData.percentLate, overallKPIsCalc(data).percentLate, false) }}>
                                {kpiData.percentLate.toFixed(1)}%
                              </span>
                              )
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle1" sx={{ mt: 1, textAlign: "center", color: textColor }}>
                              Overall KPIs (Past 30 Days)
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "center", color: textColor }}>
                              <strong>Avg Total Cases:</strong> {overallKPIs.totalCases.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "center", color: textColor }}>
                              <strong>Avg Direct Completed:</strong> {overallKPIs.percentDirect.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "center", color: textColor }}>
                              <strong>Avg Revised:</strong> {overallKPIs.percentRevised.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "center", color: textColor }}>
                              <strong>Avg Late:</strong> {overallKPIs.percentLate.toFixed(1)}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography variant="body2" sx={{ textAlign: "center", color: textColor }}>
                      {selectedReviewer ? "No Sankey data generated yet." : "Select a reviewer to generate workflow Sankey."}
                    </Typography>
                  )}
                </Paper>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <MuiTooltip title="Export Workflow Sankey to PDF">
                  <IconButton onClick={(e) => handleExportPDF("sankeyPaperRef", "Workflow Sankey", e)}>
                    <Box component="img" src={pdfIcon} alt="PDF Icon" sx={{ width: 40, height: 40 }} />
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
