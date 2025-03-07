// src/FLTable.js
import React, { useState } from "react";
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
  Typography,
  Tooltip,
  Button,
} from "@mui/material";
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

// Extend dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

// Map IANA zone -> country
const countryMap = {
  "Asia/Manila": "Philippines",
  "Africa/Lagos": "Nigeria",
  "America/Chicago": "USA (Central)",
  "America/Bogota": "Colombia",
  "Europe/Istanbul": "Turkey",
  "Europe/Vilnius": "Lithuania",
  "America/New_York": "USA (Eastern)",
};

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

const FLTable = ({ data }) => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("qualityScore");

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Define columns with specified widths
  const columns = [
    { id: "qualityScore", label: "Quality Score", align: "center" },
    { id: "name", label: "Name", align: "left", width: 250 },
    { id: "clients", label: "Clients", align: "center" },
    { id: "avgCasesPerDay", label: "Avg Cases/Day", align: "center" },
    { id: "lateCasePercentage", label: "Late %", align: "center" },
    { id: "revisionRate", label: "Rev Rate %", align: "center" },
    { id: "feedback", label: "Feedback", align: "center" },
    { id: "status", label: "Status", align: "center" },
    { id: "localTime", label: "Local Time", align: "center", width: 300 },
    { id: "notes", label: "Notes", align: "left", width: 600 },
  ];

  const processedData = data.map((row) => {
    const statusForSort =
      row.name === "Next Reviewer" ? "unavailable" : row.status || "available";

    let clientList = [];
    if (row.clients) {
      if (typeof row.clients === "string") {
        clientList = row.clients.split(",").map((c) => c.trim()).filter(Boolean);
      } else if (Array.isArray(row.clients)) {
        clientList = row.clients;
      }
    }

    const tzID = tzMap[row.email] || "America/New_York";
    const localTimeObj = dayjs().tz(tzID);
    const localTime = localTimeObj.format("h:mm A");
    const localHour = localTimeObj.hour();
    const isDay = localHour >= 6 && localHour < 18;
    const country = countryMap[tzID] || "Unknown";
    return {
      ...row,
      statusForSort,
      localTime,
      isDay,
      country,
      clientList,
    };
  });

  const sortKey = orderBy === "status" ? "statusForSort" : orderBy;
  const sortedData = stableSort(processedData, getComparator(order, sortKey));

  const summary = {
    avgCasesPerDay:
      sortedData.reduce((sum, row) => sum + (row.avgCasesPerDay || 0), 0) /
      (sortedData.length || 1),
    lateCasePercentage:
      sortedData.reduce((sum, row) => sum + (row.lateCasePercentage || 0), 0) /
      (sortedData.length || 1),
    revisionRate:
      sortedData.reduce((sum, row) => sum + (row.revisionRate || 0), 0) /
      (sortedData.length || 1),
    qualityScore:
      sortedData.reduce((sum, row) => sum + (row.qualityScore || 0), 0) /
      (sortedData.length || 1),
  };

  // Export CSV function
  const handleExportCSV = () => {
    const csvHeaders = columns.map((col) => col.label);
    const csvRows = sortedData.map((row) => {
      const status =
        row.name === "Next Reviewer" ? "unavailable" : row.status || "available";
      const clientNames = row.clientList ? row.clientList.join(", ") : "";
      return [
        `${row.qualityScore?.toFixed(1) || 0}%`,
        `"${row.name}"`,
        `"${clientNames}"`,
        row.avgCasesPerDay?.toFixed(1) || 0,
        `${row.lateCasePercentage?.toFixed(1) || 0}%`,
        `${row.revisionRate?.toFixed(1) || 0}%`,
        `"QA / Client"`,
        status === "available" ? "Available" : "Off",
        row.localTime,
        `"${row.notes || ""}"`,
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

  // Export PDF function
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reviewer Table", 14, 20);
    const tableColumn = columns.map((col) => col.label);
    const tableRows = sortedData.map((row) => {
      const status =
        row.name === "Next Reviewer" ? "unavailable" : row.status || "available";
      const clientNames = row.clientList ? row.clientList.join(", ") : "";
      return [
        `${row.qualityScore?.toFixed(1) || 0}%`,
        row.name,
        clientNames,
        row.avgCasesPerDay?.toFixed(1) || 0,
        `${row.lateCasePercentage?.toFixed(1) || 0}%`,
        `${row.revisionRate?.toFixed(1) || 0}%`,
        "QA / Client",
        status === "available" ? "Available" : "Off",
        row.localTime,
        row.notes || "",
      ];
    });
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { halign: "left" },
      headStyles: { fillColor: "#1E73BE", textColor: "white", halign: "center" },
      startY: 30,
      theme: "striped",
    });
    const finalY = doc.lastAutoTable.finalY || 30;
    doc.setFont("helvetica", "bold");
    doc.text(
      `Summary: Avg Cases/Day: ${summary.avgCasesPerDay.toFixed(1)}, Late %: ${summary.lateCasePercentage.toFixed(
        1
      )}%, Rev Rate: ${summary.revisionRate.toFixed(1)}%, Quality Score: ${summary.qualityScore.toFixed(
        1
      )}%`,
      14,
      finalY + 10
    );
    doc.setFontSize(10);
    doc.text("Hover for Quality Trend: Overall Trend: Stable", 14, finalY + 16);
    doc.save("reviewers_table.pdf");
  };

  const handleFeedbackClick = (row, feedbackType) => {
    const baseUrl = "/reports";
    const now = dayjs();
    const pastYear = now.subtract(365, "day");
    const queryParams = new URLSearchParams({
      reviewer: row.name,
      startDate: pastYear.format("YYYY-MM-DD"),
      endDate: now.format("YYYY-MM-DD"),
      feedbackType: feedbackType === "qa" ? "internal" : "client",
    });
    window.location.href = `${baseUrl}?${queryParams.toString()}`;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" sx={{ mt: 4, mb: 2, textAlign: "center", color: "#000" }}>
        Reviewer Table
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          minHeight: "80vh",
          maxHeight: "95vh",
          overflowY: "auto",
          width: "100%",
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            "& .MuiTableRow-root": { height: "40px" },
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
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
                    top: 0,
                    zIndex: 1000,
                    width: column.width || "auto",
                    textAlign: column.align || "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : "asc"}
                    onClick={(e) => handleRequestSort(e, column.id)}
                    sx={{ color: "white", "&:hover": { color: "#f0f0f0" } }}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row, index) => {
              const qualityBg =
                (row.qualityScore || 0) >= 90
                  ? "#A5D6A7"
                  : (row.qualityScore || 0) >= 80
                  ? "#FFF59D"
                  : "#EF9A9A";
              const status =
                row.name === "Next Reviewer"
                  ? "unavailable"
                  : row.status || "available";
              const clientNames = row.clientList?.join(", ") || "";
              const clientCount = row.clientList?.length || 0;
              return (
                <TableRow
                  key={row.mra_id}
                  sx={{
                    backgroundColor: index % 2 ? "#f9f9f9" : "inherit",
                    "&:hover": { backgroundColor: "#e6f2ff" },
                  }}
                >
                  <TableCell
                    sx={{
                      textAlign: "center",
                      backgroundColor: qualityBg,
                      fontWeight: "bold",
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
                  <TableCell
                    sx={{
                      textAlign: "left",
                      maxWidth: 250,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      color: "black",
                      textDecoration: "underline",
                    }}
                    onClick={() =>
                      window.location.href = `/reports?reviewer=${encodeURIComponent(
                        row.name
                      )}&clients=all&startDate=${dayjs().subtract(180, "day").format("YYYY-MM-DD")}&endDate=${dayjs().format("YYYY-MM-DD")}&reportType=Cases/Revisions`
                    }
                  >
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title={clientNames} arrow>
                      <span>{clientCount}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {row.avgCasesPerDay?.toFixed(1) || 0}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: row.lateCasePercentage <= 5.0 ? "green" : "red" }}>
                    {(row.lateCasePercentage || 0).toFixed(1)}%
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: row.revisionRate <= 10.0 ? "green" : "red" }}>
                    {(row.revisionRate || 0).toFixed(1)}%
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          opacity: 0.9,
                          bgcolor: "#4caf50",
                          color: "black",
                          "&:hover": { opacity: 1, bgcolor: "#4caf50" },
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
                          "&:hover": { opacity: 1, bgcolor: "#9c27b0" },
                        }}
                        onClick={() => handleFeedbackClick(row, "client")}
                      >
                        Client
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title="Status pending API access for calendar integration" arrow>
                      {status === "available" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>✅</span>
                      ) : (
                        <span style={{ color: "red", fontWeight: "bold" }}>❌</span>
                      )}
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title={`Country: ${row.country}`} arrow>
                      <Box
                        sx={{
                          background: row.isDay
                            ? "linear-gradient(45deg, rgba(255,213,79,0.2), rgba(255,179,0,0.3))"
                            : "rgba(33,33,33,0.3)",
                          color: row.isDay ? "inherit" : "black",
                          padding: "4px",
                          borderRadius: 1,
                          width: "100%",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          component="img"
                          src={row.isDay ? brightnessIcon : nightModeIcon}
                          alt={row.isDay ? "Sun Icon" : "Moon Icon"}
                          sx={{ width: 16, height: 16, mr: 0.5 }}
                        />
                        {row.localTime}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "left",
                      maxWidth: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
                {`Avg Quality: ${summary.qualityScore.toFixed(1)}%`}
              </TableCell>
              <TableCell sx={{ textAlign: "left", fontWeight: "bold" }} />
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }} />
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                {summary.avgCasesPerDay.toFixed(1)}
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                {summary.lateCasePercentage.toFixed(1)}%
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                {summary.revisionRate.toFixed(1)}%
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }} />
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }} />
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }} />
              <TableCell sx={{ textAlign: "left", fontWeight: "bold" }} />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      {/* Export Buttons with icons at the bottom and extra space below */}
      <Box sx={{ mt: 2, mb: 4, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleExportCSV}
          sx={{ p: 1 }}
        >
          <Box
            component="img"
            src={csvIcon}
            alt="CSV Icon"
            sx={{ width: 40, height: 40 }}
          />
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleExportPDF}
          sx={{ p: 1 }}
        >
          <Box
            component="img"
            src={pdfIcon}
            alt="PDF Icon"
            sx={{ width: 40, height: 40 }}
          />
        </Button>
      </Box>
    </Box>
  );
};

export default FLTable;
