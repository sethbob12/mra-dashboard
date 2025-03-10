/* eslint-disable no-unused-vars */ /* REFACTORED for apiService layer */
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { tzMap } from "./tzMap";
import brightnessIcon from "./assets/brightness.png";
import nightModeIcon from "./assets/night-mode.png";
import csvIcon from "./assets/csvIcon.png";
import pdfIcon from "./assets/pdfIcon.png";
import Chart from "react-apexcharts";
import html2canvas from "html2canvas";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

dayjs.extend(utc);
dayjs.extend(timezone);

// ---------- Time Zone Country Map ----------
const countryMap = {
  "Asia/Manila": "Philippines",
  "Africa/Lagos": "Nigeria",
  "America/Chicago": "USA (Central)",
  "America/Bogota": "Colombia",
  "Europe/Istanbul": "Turkey",
  "Europe/Vilnius": "Lithuania",
  "America/New_York": "USA (Eastern)"
};

// ---------- Sorting Helpers ----------
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

// ---------- getFunnelData ----------
function getFunnelData(row) {
  const total = row.casesPast30Days || 0;
  const late = Math.round(((row.lateCasePercentage || 0) * total) / 100);
  const revised = Math.round(((row.revisionRate || 0) * total) / 100);
  const completed = Math.max(0, total - late - revised);
  return [
    { name: "Received", value: total },
    { name: "Late", value: late },
    { name: "Revised", value: revised },
    { name: "Completed", value: completed }
  ];
}

// ---------- DynamicMiniFunnel Component ----------
function DynamicMiniFunnel({ row, onClick }) {
  const funnelData = getFunnelData(row);
  const total = funnelData[0].value || 1;
  const late = funnelData[1].value;
  const revised = funnelData[2].value;
  const receivedWidth = 100;
  const inReviewWidth = ((total - late) / total) * 100;
  const completedWidth = ((total - late - revised) / total) * 100;
  const getXOffset = (width) => (100 - width) / 2;

  return (
    <Box onClick={onClick} sx={{ cursor: "pointer" }}>
      <svg width="100" height="20">
        <rect x={getXOffset(receivedWidth)} y="0" width={receivedWidth} height="20" fill="#1E73BE" />
        <rect x={getXOffset(inReviewWidth)} y="0" width={inReviewWidth} height="20" fill="rgba(255,183,77,0.8)" />
        <rect x={getXOffset(completedWidth)} y="0" width={completedWidth} height="20" fill="rgba(102,187,106,0.8)" />
      </svg>
    </Box>
  );
}

// ---------- FullFunnelModal Component ----------
function FullFunnelModal({ open, onClose, rowData }) {
  const [renderChart, setRenderChart] = useState(false);

  const handleEntered = () => {
    setRenderChart(true);
    window.dispatchEvent(new Event("resize"));
  };

  const handleExited = () => {
    setRenderChart(false);
  };

  if (!open || !rowData) return null;

  const funnelData = getFunnelData(rowData);
  let series = funnelData.map((stage) => stage.value || 0);
  const labels = funnelData.map((stage) => stage.name);
  if (series.every((val) => val === 0)) {
    series = [1, 0, 0, 0];
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      onEntered={handleEntered}
      onExited={handleExited}
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
            height: 350,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Workflow Funnel for {rowData.name}
          </Typography>
          {renderChart && (
            <Box sx={{ width: 550, height: 300 }}>
              <Chart
                key={`${rowData.mra_id}-funnel`}
                options={{
                  chart: {
                    id: "funnelChart",
                    type: "funnel",
                    height: 300,
                    redrawOnWindowResize: true,
                    animations: { enabled: false },
                    parentHeightOffset: 0
                  },
                  plotOptions: {
                    funnel: { horizontal: false }
                  },
                  labels,
                  dataLabels: { enabled: true, style: { colors: ["#000"] } },
                  legend: { position: "bottom" },
                  colors: ["#1E73BE", "#FF8042", "#FFBB28", "#66BB6A"],
                  noData: {
                    text: "No data available",
                    style: { color: "#000", fontSize: "14px" }
                  }
                }}
                series={series}
                type="funnel"
                width={550}
                height={300}
              />
            </Box>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}

// ---------- KPICard Component (NO grid item inside) ----------
function KPICard({ title, value, tooltip, color }) {
  return (
    <Tooltip title={tooltip} arrow>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
          minWidth: 180,     // Adjust to ensure consistent size
          minHeight: 110,    // Adjust as needed
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

// ---------- FLTable Component ----------
function FLTable({ data }) {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("qualityScore");
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [selectedRowForFunnel, setSelectedRowForFunnel] = useState(null);

  // For navigation to feedback page
  const handleFeedbackClick = (row, feedbackType) => {
    const baseUrl = "/reports";
    const now = dayjs();
    const pastYear = now.subtract(365, "day");
    const queryParams = new URLSearchParams({
      reviewer: row.name,
      startDate: pastYear.format("YYYY-MM-DD"),
      endDate: now.format("YYYY-MM-DD"),
      feedbackType: feedbackType === "qa" ? "internal" : "client"
    });
    window.location.href = `${baseUrl}?${queryParams.toString()}`;
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Table columns
  const columns = [
    { id: "qualityScore", label: "Quality Score", align: "center" },
    { id: "name", label: "Name", align: "left", width: 250 },
    { id: "workflow", label: "Workflow", align: "center", width: 150 },
    { id: "clients", label: "Clients & Cost", align: "center" },
    { id: "avgCasesPerDay", label: "Avg Cases/Day", align: "center" },
    { id: "lateCasePercentage", label: "Late %", align: "center" },
    { id: "revisionRate", label: "Rev Rate %", align: "center" },
    { id: "yield", label: "Yield", align: "center", width: 80 },
    { id: "effectiveness", label: "Effectiveness", align: "center", width: 80 },
    { id: "feedback", label: "Feedback", align: "center" },
    { id: "status", label: "Status", align: "center" },
    { id: "localTime", label: "Local Time", align: "center", minWidth: "150px" },
    {
      id: "notes",
      label: "Notes",
      align: "left",
      width: 600,
      sx: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
    }
  ];

  // Process data – compute local time and day/night status
  const processedData = data.map((row) => {
    const statusForSort = row.name === "Next Reviewer" ? "unavailable" : row.status || "available";
    let clientList = [];
    if (row.clients) {
      if (typeof row.clients === "string") {
        clientList = row.clients.split(",").map((c) => c.trim()).filter(Boolean);
      } else if (Array.isArray(row.clients)) {
        clientList = row.clients;
      }
    }
    const clientCount = clientList.length;
    // Compute local time using tzMap and dayjs
    const tzID = tzMap[row.email] || "America/New_York";
    const localTimeObj = dayjs().tz(tzID);
    const localTime = localTimeObj.format("h:mm A");
    const localHour = localTimeObj.hour();
    const isDay = localHour >= 6 && localHour < 18;

    return {
      ...row,
      statusForSort,
      clientList,
      clientCount,
      localTime,
      isDay
    };
  });

  // Compute min & max for each metric
  let minAccuracy = Infinity,
    maxAccuracy = -Infinity;
  let minTimeliness = Infinity,
    maxTimeliness = -Infinity;
  let minEfficiency = Infinity,
    maxEfficiency = -Infinity;
  let minQuality = Infinity,
    maxQuality = -Infinity;

  data.forEach((r) => {
    const acc = r.accuracyScore ?? 0;
    const tim = r.timelinessScore ?? 0;
    const eff = r.efficiencyScore ?? 0;
    const qua = r.qualityScore ?? 0;
    if (acc < minAccuracy) minAccuracy = acc;
    if (acc > maxAccuracy) maxAccuracy = acc;
    if (tim < minTimeliness) minTimeliness = tim;
    if (tim > maxTimeliness) maxTimeliness = tim;
    if (eff < minEfficiency) minEfficiency = eff;
    if (eff > maxEfficiency) maxEfficiency = eff;
    if (qua < minQuality) minQuality = qua;
    if (qua > maxQuality) maxQuality = qua;
  });

  // Summaries
  const sortedDataMemo = useMemo(() => {
    let sortKey;
    if (orderBy === "status") sortKey = "statusForSort";
    else if (orderBy === "clients") sortKey = "clientCount";
    else sortKey = orderBy;
    return stableSort(processedData, getComparator(order, sortKey));
  }, [processedData, order, orderBy]);

  const totalReviewers = data.length;
  let totalAccuracy = 0;
  let totalTimeliness = 0;
  let totalEfficiency = 0;
  let totalQualityScore = 0;

  sortedDataMemo.forEach((row) => {
    totalAccuracy += row.accuracyScore || 0;
    totalTimeliness += row.timelinessScore || 0;
    totalEfficiency += row.efficiencyScore || 0;
    totalQualityScore += row.qualityScore || 0;
  });

  const avgAccuracy = totalReviewers ? totalAccuracy / totalReviewers : 0;
  const avgTimeliness = totalReviewers ? totalTimeliness / totalReviewers : 0;
  const avgEfficiency = totalReviewers ? totalEfficiency / totalReviewers : 0;
  const avgQuality = totalReviewers ? totalQualityScore / totalReviewers : 0;
  // Placeholder trend
  const avgQualityTrend = "+2.1%";

  // PDF/CSV Export
  const handleExportCSV = () => {
    const csvHeaders = columns.map((col) => col.label);
    const csvRows = sortedDataMemo.map((row) => {
      const status = row.name === "Next Reviewer" ? "unavailable" : row.status || "available";
      const clientNames = row.clientList ? row.clientList.join(", ") : "";
      return [
        `${row.qualityScore?.toFixed(1) || 0}%`,
        `"${row.name}"`,
        // Workflow, yield, effectiveness columns not exported
        `"${clientNames}"`,
        row.avgCasesPerDay?.toFixed(1) || 0,
        `${row.lateCasePercentage?.toFixed(1) || 0}%`,
        `${row.revisionRate?.toFixed(1) || 0}%`,
        `"QA / Client"`,
        status === "available" ? "Available" : "Off",
        row.localTime || "",
        `"${row.notes || ""}"`
      ].join(",");
    });
    const csvString = [csvHeaders.join(","), ...csvRows].join("\n");
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

  const handleExportPDF = async (elementId, title, event) => {
    event?.stopPropagation(); // 'event' may be undefined if called direct
    const ref = document.getElementById(elementId || "reviewersTable");
    if (!ref) return;
    const canvas = await html2canvas(ref);
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title || "Reviewers Table", 14, 20);
    doc.addImage(imgData, "PNG", 10, 30, 190, 100);
    doc.save(`${(title || "reviewers_table").replace(/\s+/g, "_").toLowerCase()}.pdf`);
  };

  return (
    <Box sx={{ width: "100%", px: 2 }}>
      {/* KPI Row: We use <Grid container> and for EACH KPI, we add <Grid item> with a fixed size */}
      <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        {/* 1) TOTAL REVIEWERS */}
        <Grid item>
          <KPICard
            title="Total Reviewers"
            value={totalReviewers}
            tooltip="Methodology: Count of unique reviewers. Range: 0 - unlimited."
          />
        </Grid>

        {/* 2) AVG ACCURACY */}
        <Grid item>
          <KPICard
            title="Avg Accuracy"
            value={`${avgAccuracy.toFixed(1)}%`}
            tooltip={`Methodology: (Sum of all reviewers' accuracy [100-rev rate%]) / number of reviewers.\nRange: ${minAccuracy.toFixed(
              1
            )}% - ${maxAccuracy.toFixed(1)}%.`}
          />
        </Grid>

        {/* 3) AVG TIMELINESS */}
        <Grid item>
          <KPICard
            title="Avg Timeliness"
            value={`${avgTimeliness.toFixed(1)}%`}
            tooltip={`Methodology: (Sum of all reviewers' timeliness [100=late%]) / number of reviewers.\nRange: ${minTimeliness.toFixed(
              1
            )}% - ${maxTimeliness.toFixed(1)}%.`}
          />
        </Grid>

        {/* 4) AVG EFFICIENCY */}
        <Grid item>
          <KPICard
            title="Avg Efficiency"
            value={`${avgEfficiency.toFixed(1)}%`}
            tooltip={`Methodology: (Sum of all reviewers' efficiency) / number of reviewers. [Efficiency = MIN(100, 75 + (5 × (Avg Cases/Day − 1))).\nRange: ${minEfficiency.toFixed(
              1
            )}% - ${maxEfficiency.toFixed(1)}%.`}
          />
        </Grid>

        {/* 5) AVG QUALITY SCORE (with arrow icon) */}
        <Grid item>
          <KPICard
            title="Avg Quality Score"
            value={
              <>
                {`${avgQuality.toFixed(1)}% `}
                <KeyboardArrowUpIcon sx={{ fontSize: 18, color: "green" }} />
              </>
            }
            tooltip={`Methodology: Quality Score = Accuracy (60%) + Timeliness (20%) + Efficiency (20%).\nRange: ${minQuality.toFixed(
              1
            )}% - ${maxQuality.toFixed(1)}%.\nTrend: ${avgQualityTrend} from last month`}
          />
        </Grid>
      </Grid>

      {/* TABLE CONTAINER */}
      <TableContainer
        component={Paper}
        sx={{ width: "100%", overflowX: "visible" }}
      >
        <Table id="reviewersTable" size="small" stickyHeader>
          <TableHead
            sx={{
              "& .MuiTableCell-stickyHeader": {
                top: "80.5px" // Adjust if you have a navbar height
              }
            }}
          >
            <TableRow>
              {/* HEADERS */}
              {columns.map((column) => {
                if (column.id === "clients") {
                  return (
                    <TableCell
                      key={column.id}
                      sx={{
                        fontWeight: "bold",
                        color: "white",
                        borderRight: "1px solid #ddd",
                        background: "linear-gradient(45deg, #1E73BE, #1565C0)",
                        borderBottom: "2px solid #0D47A1",
                        padding: "8px 12px",
                        position: "sticky",
                        top: "64px",
                        zIndex: 1000,
                        width: column.width || "auto",
                        minWidth: column.minWidth || "auto",
                        textAlign: column.align || "center"
                      }}
                    >
                      <Tooltip
                        title="Clients & Cost: Sort by number of clients. Detailed cost ranking is shown in the Quality Score bar chart under Visualizations."
                        arrow
                      >
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={orderBy === column.id ? "desc" : "asc"}
                          onClick={(e) => handleRequestSort(e, column.id)}
                          sx={{ color: "white", "&:hover": { color: "#f0f0f0" } }}
                        >
                          {column.label}
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                  );
                }
                if (["yield", "effectiveness"].includes(column.id)) {
                  const colTooltip =
                    column.id === "yield"
                      ? "Yield: Indicates if the reviewer meets the benchmark for revisions vs. case volume. (Green = meets, Red = below)"
                      : "Effectiveness: First-time success rate. (Green = meets timeliness & accuracy; Red = does not)";
                  return (
                    <TableCell
                      key={column.id}
                      sx={{
                        fontWeight: "bold",
                        color: "white",
                        borderRight: "1px solid #ddd",
                        background: "linear-gradient(45deg, #1E73BE, #1565C0)",
                        borderBottom: "2px solid #0D47A1",
                        padding: "8px 12px",
                        position: "sticky",
                        top: "64px",
                        zIndex: 1000,
                        width: column.width || "auto",
                        minWidth: column.minWidth || "auto",
                        textAlign: column.align || "center"
                      }}
                    >
                      <Tooltip title={colTooltip} arrow>
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={orderBy === column.id ? "desc" : "asc"}
                          onClick={(e) => handleRequestSort(e, column.id)}
                          sx={{ color: "white", "&:hover": { color: "#f0f0f0" } }}
                        >
                          {column.label}
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                  );
                }
                return (
                  <TableCell
                    key={column.id}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      borderRight: "1px solid #ddd",
                      background: "linear-gradient(45deg, #1E73BE, #1565C0)",
                      borderBottom: "2px solid #0D47A1",
                      padding: "8px 12px",
                      position: "sticky",
                      top: "64px",
                      zIndex: 1000,
                      width: column.width || "auto",
                      minWidth: column.minWidth || "auto",
                      textAlign: column.align || "center"
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? "desc" : "asc"}
                      onClick={(e) => handleRequestSort(e, column.id)}
                      sx={{ color: "white", "&:hover": { color: "#f0f0f0" } }}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedDataMemo.map((row, index) => {
              const qualityBg =
                (row.qualityScore || 0) >= 90
                  ? "#A5D6A7"
                  : (row.qualityScore || 0) >= 80
                  ? "#FFF59D"
                  : "#EF9A9A";
              const status =
                row.name === "Next Reviewer" ? "unavailable" : row.status || "available";
              const revisionRate = row.revisionRate || 0;
              const cases = row.casesPast30Days || 0;
              let minX = isFinite(Math.min(...data.map((r) => r.casesPast30Days || 0)))
                ? Math.min(...data.map((r) => r.casesPast30Days || 0))
                : 0;
              if (minX < 0) minX = 0;
              const slope = (30 - 20) / (90 - minX);
              const expectedY =
                cases <= minX ? 20 : cases >= 90 ? 30 : 20 + slope * (cases - minX);
              const yieldColor = revisionRate < expectedY ? "green" : "red";
              const yieldTooltip = `Cases: ${cases}, Rev Rate: ${revisionRate.toFixed(1)}%`;
              const effColor =
                (row.accuracyScore || 0) >= 75 && (row.timelinessScore || 0) >= 75
                  ? "green"
                  : "red";
              const effTooltip = `Accuracy: ${row.accuracyScore || 0}%\nTimeliness: ${
                row.timelinessScore || 0
              }%`;
              let clientCostTooltip = "";
              if (row.clientList && row.costPerCase) {
                const lines = [];
                lines.push("Clients & Cost:");
                lines.push("");
                row.clientList.forEach((client) => {
                  const cost = row.costPerCase[client] ?? "N/A";
                  lines.push(`- ${client}: $${cost}`);
                });
                clientCostTooltip = lines.join("\n");
              } else {
                clientCostTooltip = "No client/cost info";
              }

              return (
                <TableRow
                  key={row.mra_id}
                  sx={{
                    backgroundColor: index % 2 ? "#f9f9f9" : "inherit",
                    "&:hover": { backgroundColor: "#e6f2ff" }
                  }}
                >
                  {/* Quality Score */}
                  <TableCell
                    sx={{
                      textAlign: "center",
                      backgroundColor: qualityBg,
                      fontWeight: "bold"
                    }}
                  >
                    <Tooltip
                      title={
                        <span>
                          Accuracy: {row.accuracyScore || 0}%<br />
                          Timeliness: {row.timelinessScore || 0}%<br />
                          Efficiency: {row.efficiencyScore || 0}%<br />
                          Trend: Stable
                        </span>
                      }
                      arrow
                    >
                      <span>{(row.qualityScore || 0).toFixed(1)}%</span>
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
                      color: "black",
                      textDecoration: "underline"
                    }}
                    onClick={() =>
                      (window.location.href = `/reports?reviewer=${encodeURIComponent(
                        row.name
                      )}&clients=all&startDate=${dayjs()
                        .subtract(180, "day")
                        .format("YYYY-MM-DD")}&endDate=${dayjs().format(
                        "YYYY-MM-DD"
                      )}&reportType=Cases/Revisions`)
                    }
                  >
                    {row.name}
                  </TableCell>

                  {/* Workflow */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip
                      title="Workflow: Blue = Submitted Late, Orange = Submitted but needed revision, Green = Direct Completed. Click for detailed Sankey diagram."
                      arrow
                    >
                      <Box
                        onClick={() =>
                          (window.location.href = `/chart?reviewer=${encodeURIComponent(
                            row.name
                          )}&section=workflow`)
                        }
                        sx={{ cursor: "pointer" }}
                      >
                        <DynamicMiniFunnel row={row} />
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
                  <TableCell sx={{ textAlign: "center" }}>
                    {row.avgCasesPerDay?.toFixed(1) || 0}
                  </TableCell>

                  {/* Late % */}
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: (row.lateCasePercentage || 0) <= 5.0 ? "green" : "red"
                    }}
                  >
                    {(row.lateCasePercentage || 0).toFixed(1)}%
                  </TableCell>

                  {/* Rev Rate % */}
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: revisionRate <= 10.0 ? "green" : "red"
                    }}
                  >
                    {revisionRate.toFixed(1)}%
                  </TableCell>

                  {/* Yield */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title={yieldTooltip} arrow>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: yieldColor,
                          display: "inline-block"
                        }}
                      />
                    </Tooltip>
                  </TableCell>

                  {/* Effectiveness */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title={effTooltip} arrow>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: effColor,
                          display: "inline-block"
                        }}
                      />
                    </Tooltip>
                  </TableCell>

                  {/* Feedback */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          opacity: 0.9,
                          bgcolor: "#4caf50",
                          color: "black",
                          "&:hover": { opacity: 1, bgcolor: "#4caf50" }
                        }}
                        onClick={() => handleFeedbackClick(row, "qa")}
                      >
                        QA
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          opacity: 0.9,
                          bgcolor: "#9c27b0",
                          color: "black",
                          "&:hover": { opacity: 1, bgcolor: "#9c27b0" }
                        }}
                        onClick={() => handleFeedbackClick(row, "client")}
                      >
                        Client
                      </Button>
                    </Box>
                  </TableCell>

                  {/* Status */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title="Status pending API access for calendar integration" arrow>
                      {status === "available" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>✅</span>
                      ) : (
                        <span style={{ color: "red", fontWeight: "bold" }}>❌</span>
                      )}
                    </Tooltip>
                  </TableCell>

                  {/* Local Time */}
                  <TableCell sx={{ textAlign: "center", minWidth: "150px" }}>
                    <Tooltip title={`Time Zone: ${tzMap[row.email] || "America/New_York"}`} arrow>
                      <Box
                        sx={{
                          background:
                            row.isDay
                              ? "linear-gradient(45deg, rgba(255,213,79,0.2), rgba(255,179,0,0.3))"
                              : "rgba(33,33,33,0.3)",
                          color: row.isDay ? "inherit" : "black",
                          padding: "4px",
                          borderRadius: 1,
                          width: "100%",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Box
                          component="img"
                          src={row.isDay ? brightnessIcon : nightModeIcon}
                          alt={row.isDay ? "Sun Icon" : "Moon Icon"}
                          sx={{ width: 16, height: 16, mr: 0.5 }}
                        />
                        {row.localTime || ""}
                      </Box>
                    </Tooltip>
                  </TableCell>

                  {/* Notes */}
                  <TableCell
                    sx={{
                      textAlign: "left",
                      maxWidth: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {row.notes || ""}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          <TableFooter>
            <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
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
        <Button variant="outlined" onClick={() => handleExportPDF("reviewersTable", "Reviewers Table")}>
          <Box component="img" src={pdfIcon} alt="PDF Icon" sx={{ width: 40, height: 40 }} />
        </Button>
      </Box>

      {/* Funnel Modal Popup */}
      <FullFunnelModal
        open={funnelOpen}
        onClose={() => setFunnelOpen(false)}
        rowData={selectedRowForFunnel}
      />
    </Box>
  );
}

export default FLTable;
