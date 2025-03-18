/* eslint-disable no-unused-vars */
/* REFACTORED for apiService layer */
import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TableFooter,
  Tooltip,
  Button,
  Modal,
  Fade,
  Backdrop,
  Card,
  CardContent,
  Grid,
  Typography
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { tzMap } from "./tzMap";
import brightnessIcon from "./assets/brightness.png";
import nightModeIcon from "./assets/night-mode.png";
import csvIcon from "./assets/csvIcon.png";
import pdfIcon from "./assets/pdfIcon.png";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {
  ResponsiveContainer,
  Sankey,
  Tooltip as RechartsTooltip
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

/** ---------- Sorting Helpers ---------- */
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
function stableSort(array, comparator) {
  const stabilizedArray = array.map((el, index) => [el, index]);
  stabilizedArray.sort((a, b) => {
    const orderResult = comparator(a[0], b[0]);
    if (orderResult !== 0) return orderResult;
    return a[1] - b[1];
  });
  return stabilizedArray.map((el) => el[0]);
}

/** ---------- Snapshots & Workflow ---------- */
function getLatestSnapshot(reviewer) {
  if (!reviewer.snapshots || reviewer.snapshots.length === 0) return null;
  const sorted = [...reviewer.snapshots].sort(
    (a, b) => dayjs(b.snapshotDate).valueOf() - dayjs(a.snapshotDate).valueOf()
  );
  return sorted[0];
}
function computeWorkflowStats(row) {
  const snap = getLatestSnapshot(row);
  const total = snap ? (snap.casesPast30Days || 0) : 0;
  const late = snap ? Math.round(((snap.lateCasePercentage || 0) * total) / 100) : 0;
  const revised = snap ? Math.round(((snap.revisionRate || 0) * total) / 100) : 0;
  const direct = Math.max(0, total - late - revised);
  return { total, late, revised, direct };
}

/** ---------- Inline Workflow Funnel (side-by-side) ---------- */
function WorkflowFunnel({ row }) {
  const { total, late, revised, direct } = computeWorkflowStats(row);
  const totalWidth = 100; // total width in px
  const totalSafe = total || 1;
  const lateW = (late / totalSafe) * totalWidth;
  const revW = (revised / totalSafe) * totalWidth;
  const dirW = (direct / totalSafe) * totalWidth;
  return (
    <svg width={totalWidth} height="20">
      <rect x={0} y={0} width={lateW} height="20" fill="#1E73BE" />
      <rect x={lateW} y={0} width={revW} height="20" fill="#FFBB28" />
      <rect x={lateW + revW} y={0} width={dirW} height="20" fill="#66BB6A" />
    </svg>
  );
}

/** Tooltip wrapper for the funnel showing percentages */
function WorkflowFunnelTooltip({ row, children }) {
  const { total, late, revised, direct } = computeWorkflowStats(row);
  const latePct = total ? ((late / total) * 100).toFixed(1) : 0;
  const revisedPct = total ? ((revised / total) * 100).toFixed(1) : 0;
  const directPct = total ? ((direct / total) * 100).toFixed(1) : 0;
  const tooltipTitle = `Late: ${latePct}%, Revised: ${revisedPct}%, Direct: ${directPct}%`;
  return <Tooltip title={tooltipTitle} arrow>{children}</Tooltip>;
}

/** ---------- Sankey ---------- */
function buildSankeyData(row) {
  const { total, late, revised, direct } = computeWorkflowStats(row);
  const percentLate = total ? (late / total) * 100 : 0;
  const percentRevised = total ? (revised / total) * 100 : 0;
  const percentDirect = total ? (direct / total) * 100 : 0;
  return {
    nodes: [
      { name: "Received", color: "#B0BEC5", value: total },
      { name: "Late", color: "#1E73BE", value: late, percent: percentLate },
      { name: "Revised", color: "#FFBB28", value: revised, percent: percentRevised },
      { name: "Direct Completed", color: "#66BB6A", value: direct, percent: percentDirect },
      { name: "Completed", color: "#9C27B0", value: total }
    ],
    links: [
      { source: 0, target: 1, value: late },
      { source: 0, target: 2, value: revised },
      { source: 0, target: 3, value: direct },
      { source: 1, target: 4, value: late },
      { source: 2, target: 4, value: revised },
      { source: 3, target: 4, value: direct }
    ]
  };
}

// Updated renderSankeyNode to adjust text fill based on dark mode.
function renderSankeyNode({ x, y, width, height, payload }, darkMode) {
  const infoText =
    payload.name === "Received" || payload.name === "Completed"
      ? `${payload.value || 0}`
      : `${payload.percent ? payload.percent.toFixed(1) : 0}%`;
  return (
    <Tooltip title={`${payload.name}: ${infoText}`} arrow>
      <g>
        <rect x={x} y={y} width={width} height={height} fill={payload.color || "#8884d8"} stroke="#fff" strokeWidth={2} />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill={darkMode ? "#fff" : "#000"}
          fontSize={12}
          fontWeight="bold"
          dy={4}
        >
          {payload.name}
        </text>
      </g>
    </Tooltip>
  );
}

function FullSankeyModal({ open, onClose, rowData }) {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  if (!open || !rowData) return null;
  const sankeyData = buildSankeyData(rowData);
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: theme.palette.mode === "dark" ? "#424242" : "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "80vh",
            overflow: "auto"
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Workflow Sankey for {rowData.name}
          </Typography>
          <Box sx={{ width: 550, height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={sankeyData}
                nodeWidth={20}
                nodePadding={10}
                margin={{ top: 20, bottom: 20, left: 50, right: 50 }}
                link={{ stroke: "#8884d8", strokeWidth: 2 }}
                node={(props) => renderSankeyNode(props, darkMode)}
              >
                <RechartsTooltip />
              </Sankey>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

/** ---------- KPI Card ---------- */
function KPICard({ title, value, tooltip, color }) {
  return (
    <Tooltip title={tooltip} arrow>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
          minWidth: 180,
          minHeight: 110,
          cursor: "default"
        }}
      >
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: color || "#1565C0", fontWeight: "bold" }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold", mt: 1 }}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Tooltip>
  );
}

/** ---------- Helper: Render header label with default tooltip if needed ---------- */
function renderHeaderLabel(column) {
  if (React.isValidElement(column.label)) {
    return column.label;
  } else {
    return (
      <Tooltip title={`Sort by ${column.label}`} arrow>
        <span>{column.label}</span>
      </Tooltip>
    );
  }
}

/** ---------- FLTable Component ---------- */
export default function FLTable({ data }) {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  
  // Header: blue gradient with black text (default)
  const headerBg = "linear-gradient(45deg, #1E73BE, #1565C0)";
  const headerText = "#000";
  // Row backgrounds for dark mode
  const rowEvenBg = darkMode ? "#333" : "#f5f5f5";
  const rowOddBg = darkMode ? "#424242" : "white";
  const nameTextColor = darkMode ? "#fff" : "black";
  
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("computedQualityScore");
  const [sankeyOpen, setSankeyOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const navigate = useNavigate();
  
  // Sorting handler
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Feedback-click handler using navigate
  const handleFeedbackClick = (row, feedbackType) => {
    const now = dayjs();
    const pastYear = now.subtract(365, "day");
    const queryParams = new URLSearchParams({
      reviewer: row.name,
      startDate: pastYear.format("YYYY-MM-DD"),
      endDate: now.format("YYYY-MM-DD"),
      feedbackType: feedbackType === "qa" ? "internal" : "client"
    });
    navigate(`/reports?${queryParams.toString()}`);
  };

  // Build columns.
  const columns = [
    { id: "computedQualityScore", label: "Quality Score", align: "center" },
    { id: "name", label: "Name", align: "left", width: 250 },
    { id: "workflow", label: "Workflow", align: "center", width: 120 },
    {
      id: "clients",
      label: (
        <Tooltip title="Detailed cost rankings can be found under the Quality Score chart in Visualizations." arrow>
          <span>Clients & Cost</span>
        </Tooltip>
      ),
      align: "center"
    },
    { id: "avgCasesPerDay", label: "Avg Cases/Day", align: "center" },
    {
      id: "caseType",
      label: (
        <Tooltip title="Case Type: N = Non-Psych, P = Psych, B = Both" arrow>
          <span>Case Type</span>
        </Tooltip>
      ),
      align: "center",
      width: 100
    },
    { id: "lateCasePercentage", label: "Late %", align: "center" },
    { id: "revisionRate", label: "Rev Rate %", align: "center" },
    {
      id: "yield",
      label: (
        <Tooltip title="Indicates whether the reviewer meets the benchmark for revisions vs. case volume." arrow>
          <span>Yield</span>
        </Tooltip>
      ),
      align: "center",
      width: 80
    },
    {
      id: "effectiveness",
      label: (
        <Tooltip title="Indicates whether the reviewer meets the benchmark for timeliness vs. accuracy." arrow>
          <span>Effectiveness</span>
        </Tooltip>
      ),
      align: "center",
      width: 80
    },
    { id: "feedback", label: "Feedback", align: "center" },
    { id: "status", label: "Status", align: "center" },
    { id: "localTime", label: "Local Time", align: "center", minWidth: 150 }
  ];

  // Process data from snapshots using the latest snapshot for key metrics.
  // Also compute computedQualityScore using the new formula:
  // Quality Score = Accuracy (60%) + Timeliness (20%) + Efficiency (10%) + Coverage (min(clientCount,6)) + Type (if caseType === "Both" then 4 else 2)
  const processedData = data.map((row) => {
    const latest = getLatestSnapshot(row);
    // Use snapshot values if available; otherwise, fallback to row properties
    const accuracy = latest ? latest.accuracyScore : row.accuracyScore;
    const timeliness = latest ? latest.timelinessScore : row.timelinessScore;
    const efficiency = latest ? latest.efficiencyScore : row.efficiencyScore;
    return {
      ...row,
      qualityScore: latest ? latest.qualityScore : row.qualityScore,
      accuracyScore: accuracy,
      timelinessScore: timeliness,
      efficiencyScore: efficiency,
      revisionRate: latest ? latest.revisionRate : row.revisionRate,
      lateCasePercentage: latest ? latest.lateCasePercentage : row.lateCasePercentage,
      avgCasesPerDay: latest ? (latest.avgCasesPerDay || latest.avgCasesDay) : (row.avgCasesPerDay || row.avgCasesDay),
      casesPast30Days: latest ? latest.casesPast30Days : row.casesPast30Days,
      costPerCase: latest ? latest.costPerCase : row.costPerCase,
      status: row.status || "available"
    };
  });

  // Sort data and add local time and client count info
  const sortedDataMemo = useMemo(() => {
    const processed = processedData.map((row) => {
      let clientList = [];
      if (typeof row.clients === "string") {
        clientList = row.clients.split(",").map((c) => c.trim()).filter(Boolean);
      } else if (Array.isArray(row.clients)) {
        clientList = row.clients;
      }
      const tzID = tzMap[row.email] || "America/New_York";
      const localTimeObj = dayjs().tz(tzID);
      const localTime = localTimeObj.format("h:mm A");
      const localHour = localTimeObj.hour();
      const isDay = localHour >= 6 && localHour < 18;
      // Compute new quality score based on the updated methodology.
      const coveragePoints = Math.min(clientList.length, 6);
      const typePoints = row.caseType === "Both" ? 4 : 2;
      const computedQualityScore =
        (row.accuracyScore || 0) * 0.60 +
        (row.timelinessScore || 0) * 0.20 +
        (row.efficiencyScore || 0) * 0.10 +
        coveragePoints +
        typePoints;
      return {
        ...row,
        clientList,
        clientCount: clientList.length,
        localTime,
        isDay,
        computedQualityScore
      };
    });
    let sortKey;
    if (orderBy === "status") sortKey = "status";
    else if (orderBy === "clients") sortKey = "clientCount";
    else sortKey = orderBy;
    return stableSort(processed, getComparator(order, sortKey));
  }, [processedData, order, orderBy]);

  // Compute KPI averages for header row based on computedQualityScore
  const totalReviewers = sortedDataMemo.length;
  let totalAccuracy = 0,
    totalTimeliness = 0,
    totalEfficiency = 0,
    totalQualityScore = 0;
  sortedDataMemo.forEach((row) => {
    totalAccuracy += row.accuracyScore || 0;
    totalTimeliness += row.timelinessScore || 0;
    totalEfficiency += row.efficiencyScore || 0;
    totalQualityScore += row.computedQualityScore || 0;
  });
  const avgAccuracy = totalReviewers ? totalAccuracy / totalReviewers : 0;
  const avgTimeliness = totalReviewers ? totalTimeliness / totalReviewers : 0;
  const avgEfficiency = totalReviewers ? totalEfficiency / totalReviewers : 0;
  const avgQuality = totalReviewers ? totalQualityScore / totalReviewers : 0;
  const avgQualityTrend = "+2.1%"; // placeholder

  /** ---------- Export CSV/PDF ---------- */
  const handleExportCSV = () => {
    const headers = columns.map((col) =>
      typeof col.label === "string" ? col.label : ""
    ); // For CSV, use plain text labels
    const rows = sortedDataMemo.map((row) => {
      const status = row.name === "Next Reviewer" ? "unavailable" : row.status;
      const clientNames = row.clientList ? row.clientList.join(", ") : "";
      return [
        `${row.computedQualityScore?.toFixed(1) || 0}%`,
        `"${row.name}"`,
        `"${clientNames}"`,
        row.avgCasesPerDay?.toFixed(1) || 0,
        row.caseType || "N/A",
        `${row.lateCasePercentage?.toFixed(1) || 0}%`,
        `${row.revisionRate?.toFixed(1) || 0}%`,
        `"QA / Client"`,
        status === "available" ? "Available" : "Off",
        row.localTime || ""
      ].join(",");
    });
    const csvString = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reviewers_table.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const ref = document.getElementById("reviewersTable");
    if (!ref) return;
    const canvas = await html2canvas(ref, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reviewers Table", 14, 20);
    doc.addImage(imgData, "PNG", 10, 30, 190, 0);
    doc.save("reviewers_table.pdf");
  };

  // Helper to render the Case Type cell with abbreviations and tooltip.
  function renderCaseType(row) {
    let label = "N";
    let color = "blue";
    let tip = "Non-Psych Cases Only";
    if (row.caseType === "Psych") {
      label = "P";
      color = "darkgoldenrod";
      tip = "Psych Cases Only";
    } else if (row.caseType === "Both") {
      label = "B";
      color = "green";
      tip = "Both Types of Cases";
    }
    return (
      <Tooltip title={tip} arrow>
        <Box sx={{ fontWeight: "bold", color, textAlign: "center" }}>
          {label}
        </Box>
      </Tooltip>
    );
  }

  // Render table
  return (
    <Box sx={{ width: "100%", ml: 1 }}>
      {/* KPI Row */}
      <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        <Grid item>
          <KPICard title="Total Reviewers" value={totalReviewers} tooltip="Count of unique reviewers." />
        </Grid>
        <Grid item>
          <KPICard
            title="Avg Accuracy"
            value={`${avgAccuracy.toFixed(1)}%`}
            tooltip={`Accuracy range: N/A`}
          />
        </Grid>
        <Grid item>
          <KPICard
            title="Avg Timeliness"
            value={`${avgTimeliness.toFixed(1)}%`}
            tooltip={`Timeliness range: N/A`}
          />
        </Grid>
        <Grid item>
          <KPICard
            title="Avg Efficiency"
            value={`${avgEfficiency.toFixed(1)}%`}
            tooltip={`Efficiency range: N/A`}
          />
        </Grid>
        <Grid item>
          <KPICard
            title="Avg Quality Score"
            value={
              <>
                {`${avgQuality.toFixed(1)}% `}
                <KeyboardArrowUpIcon sx={{ fontSize: 18, color: "green" }} />
              </>
            }
            tooltip={`Quality Score = Accuracy (60%) + Timeliness (20%) + Efficiency (10%) + Coverage (6%) + Type (4%).\nTrend: ${avgQualityTrend}`}
          />
        </Grid>
      </Grid>

      {/* Table container with sticky header and horizontal scrolling */}
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table id="reviewersTable" size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    fontWeight: "bold",
                    color: headerText,
                    borderRight: "1px solid #ddd",
                    background: headerBg,
                    borderBottom: "2px solid #0D47A1",
                    padding: "8px 12px",
                    textAlign: column.align || "center",
                    width: column.width || "auto",
                    minWidth: column.minWidth || "auto",
                    ...column.sx
                  }}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? "desc" : "asc"}
                    onClick={(e) => handleRequestSort(e, column.id)}
                    sx={{ color: headerText, "&:hover": { color: "#f0f0f0" } }}
                  >
                    {renderHeaderLabel(column)}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedDataMemo.map((row, idx) => {
              const qscore = row.computedQualityScore || 0;
              let qualityBg = "#EF9A9A";
              if (qscore >= 90) qualityBg = "#A5D6A7";
              else if (qscore >= 80) qualityBg = "#FFF59D";
              const status = row.name === "Next Reviewer" ? "unavailable" : row.status;
              const revisionRate = row.revisionRate || 0;
              const cases = row.casesPast30Days || 0;
              let minX = Math.min(
                ...data.map((r) => {
                  const snap = getLatestSnapshot(r);
                  return snap ? snap.casesPast30Days || 0 : 0;
                })
              );
              if (minX < 0) minX = 0;
              const slope = (30 - 20) / (90 - minX);
              const expectedY = cases <= minX ? 20 : cases >= 90 ? 30 : 20 + slope * (cases - minX);
              const yieldColor = revisionRate < expectedY ? "green" : "red";
              const yieldTooltip = `Cases: ${cases}, Rev Rate: ${revisionRate.toFixed(1)}%`;
              const effColor =
                (row.accuracyScore || 0) >= 75 && (row.timelinessScore || 0) >= 75 ? "green" : "red";
              const effTooltip = `Accuracy: ${row.accuracyScore || 0}%\nTimeliness: ${row.timelinessScore || 0}%`;
              let clientCostTooltip = "No client/cost info";
              if (row.clientList && row.costPerCase) {
                const lines = ["Clients & Cost:", ""];
                row.clientList.forEach((client) => {
                  const cost = row.costPerCase[client] ?? "N/A";
                  lines.push(`- ${client}: $${cost}`);
                });
                clientCostTooltip = lines.join("\n");
              }
              return (
                <TableRow
                  key={row.mra_id}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? (darkMode ? "#333" : rowEvenBg) : (darkMode ? "#424242" : rowOddBg),
                    "&:hover": { backgroundColor: darkMode ? "#555" : "#e6f2ff" }
                  }}
                >
                  {
  /* Quality Score */
}
<TableCell
  sx={{ textAlign: "center", backgroundColor: qualityBg, fontWeight: "bold" }}
>
  <Tooltip
    title={
      (() => {
        // Derive the type points (2 or 4) and a short description
        const typePoints = row.caseType === "Both" ? 4 : 2;
        const typeDescription =
          row.caseType === "Both"
            ? "Both"
            : row.caseType === "Psych"
            ? "Psych only"
            : "Non-Psych only";

        return (
          <>
            Accuracy: {row.accuracyScore || 0}%<br />
            Timeliness: {row.timelinessScore || 0}%<br />
            Efficiency: {row.efficiencyScore || 0}%<br />
            Coverage: {Math.min(row.clientCount, 6)} (#Clients)
            <br />
            Type: {typePoints} ({typeDescription})
            <br />
            Trend: Stable
          </>
        );
      })()
    }
    arrow
  >
    <span>{qscore.toFixed(1)}%</span>
  </Tooltip>
</TableCell>

                  {/* Name */}
                  <TableCell
                    sx={{
                      textAlign: "left",
                      maxWidth: 250,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      color: nameTextColor,
                      textDecoration: "underline"
                    }}
                    onClick={() => {
                      const now = dayjs();
                      const pastYear = now.subtract(180, "day");
                      const queryParams = new URLSearchParams({
                        reviewer: row.name,
                        clients: "all",
                        startDate: pastYear.format("YYYY-MM-DD"),
                        endDate: now.format("YYYY-MM-DD"),
                        reportType: "Cases/Revisions"
                      });
                      navigate(`/reports?${queryParams.toString()}`);
                    }}
                  >
                    {row.name}
                  </TableCell>

                  {/* Workflow Funnel */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title="Click to view detailed workflow" arrow>
                      <Box onClick={() => { setSelectedRow(row); setSankeyOpen(true); }}>
                        <WorkflowFunnel row={row} />
                      </Box>
                    </Tooltip>
                  </TableCell>

                  {/* Clients & Cost */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title={clientCostTooltip} arrow>
                      <AttachMoneyIcon sx={{ color: "green", cursor: "pointer", fontSize: "large" }} />
                    </Tooltip>
                  </TableCell>

                  {/* Avg Cases/Day */}
                  <TableCell sx={{ textAlign: "center", color: darkMode ? "#fff" : "inherit" }}>
                    {row.avgCasesPerDay?.toFixed(1) || 0}
                  </TableCell>

                  {/* Case Type */}
                  <TableCell sx={{ textAlign: "center" }}>
                    {renderCaseType(row)}
                  </TableCell>

                  {/* Late % */}
                  <TableCell sx={{ textAlign: "center", color: (row.lateCasePercentage || 0) <= 7.0 ? "green" : "red" }}>
                    {(row.lateCasePercentage || 0).toFixed(1)}%
                  </TableCell>

                  {/* Rev Rate % */}
                  <TableCell sx={{ textAlign: "center", color: revisionRate <= 15.0 ? "green" : "red" }}>
                    {revisionRate.toFixed(1)}%
                  </TableCell>

                  {/* Yield */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title={yieldTooltip} arrow>
                      <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: yieldColor, display: "inline-block" }} />
                    </Tooltip>
                  </TableCell>

                  {/* Effectiveness */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title={effTooltip} arrow>
                      <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: effColor, display: "inline-block" }} />
                    </Tooltip>
                  </TableCell>

                  {/* Feedback */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <Tooltip title="Click to view internal QA feedback" arrow>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ opacity: 0.9, bgcolor: "#4caf50", color: "black", "&:hover": { opacity: 1, bgcolor: "#4caf50" } }}
                          onClick={() => handleFeedbackClick(row, "qa")}
                        >
                          QA
                        </Button>
                      </Tooltip>
                      <Tooltip title="Click to view client feedback" arrow>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ opacity: 0.9, bgcolor: "#9c27b0", color: "black", "&:hover": { opacity: 1, bgcolor: "#9c27b0" } }}
                          onClick={() => handleFeedbackClick(row, "client")}
                        >
                          Client
                        </Button>
                      </Tooltip>
                    </Box>
                  </TableCell>

                  {/* Status */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title="Status pending API access" arrow>
                      {row.status === "available" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>✅</span>
                      ) : (
                        <span style={{ color: "red", fontWeight: "bold" }}>❌</span>
                      )}
                    </Tooltip>
                  </TableCell>

                  {/* Local Time */}
                  <TableCell sx={{ textAlign: "center", minWidth: 150 }}>
                    <Tooltip title={`Time Zone: ${tzMap[row.email] || "America/New_York"}`} arrow>
                      <Box
                        sx={{
                          background: row.isDay
                            ? "linear-gradient(45deg, rgba(255,213,79,0.2), rgba(255,179,0,0.3))"
                            : "rgba(33,33,33,0.3)",
                          color: darkMode ? "#fff" : (row.isDay ? "inherit" : "black"),
                          padding: "4px",
                          borderRadius: 1,
                          width: "100%",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: darkMode ? "1px solid silver" : "none"
                        }}
                      >
                        <Box
                          component="img"
                          src={row.isDay ? brightnessIcon : nightModeIcon}
                          alt={row.isDay ? "Sun Icon" : "Moon Icon"}
                          sx={{ 
                            width: 16, 
                            height: 16, 
                            mr: 0.5,
                            filter: darkMode && !row.isDay ? "invert(75%)" : "none" 
                          }}
                        />
                        {row.localTime || ""}
                      </Box>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          {/* Footer with average quality */}
          <TableFooter>
            <TableRow sx={{ backgroundColor: "transparent" }}>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                {`(Avg Quality: ${avgQuality.toFixed(1)}%)`}
              </TableCell>
              {Array.from({ length: columns.length - 1 }, (_, i) => (
                <TableCell key={i} sx={{ textAlign: "center", fontWeight: "bold" }} />
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Export Buttons */}
      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={handleExportCSV}>
          <Box component="img" src={csvIcon} alt="CSV Icon" sx={{ width: 40, height: 40 }} />
        </Button>
        <Button variant="outlined" onClick={handleExportPDF}>
          <Box component="img" src={pdfIcon} alt="PDF Icon" sx={{ width: 40, height: 40 }} />
        </Button>
      </Box>

      {/* Sankey Modal */}
      <FullSankeyModal open={sankeyOpen} onClose={() => setSankeyOpen(false)} rowData={selectedRow} />
    </Box>
  );
}
