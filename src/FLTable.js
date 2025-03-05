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
  IconButton,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Import your custom icons
import csvIcon from "./assets/csvIcon.png";
import pdfIcon from "./assets/pdfIcon.png";

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
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("mra_id");

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort the data
  const sortedData = stableSort(data, getComparator(order, orderBy));

  // Calculate summary (average) values
  const summary = {
    avgCasesPerDay:
      sortedData.reduce((sum, row) => sum + row.avgCasesPerDay, 0) /
      sortedData.length,
    lateCasePercentage:
      sortedData.reduce((sum, row) => sum + row.lateCasePercentage, 0) /
      sortedData.length,
    clientRevisionsWeek:
      sortedData.reduce((sum, row) => sum + row.clientRevisionsWeek, 0) /
      sortedData.length,
    clientRevisionsMonth:
      sortedData.reduce((sum, row) => sum + row.clientRevisionsMonth, 0) /
      sortedData.length,
    qualityScore:
      sortedData.reduce((sum, row) => sum + row.qualityScore, 0) /
      sortedData.length,
  };

  // Table columns
  const columns = [
    { id: "mra_id", label: "ID" },
    { id: "name", label: "Name", align: "left" },
    { id: "clients", label: "Clients", align: "left" },
    { id: "avgCasesPerDay", label: "Avg Cases/Day" },
    { id: "lateCasePercentage", label: "Late %" },
    { id: "clientRevisionsWeek", label: "Client Rev (Week)" },
    { id: "clientRevisionsMonth", label: "Client Rev (Month)" },
    { id: "qualityScore", label: "Quality Score" },
  ];

  // Export as CSV
  const handleExportCSV = () => {
    const csvHeaders = columns.map((col) => col.label);
    const csvRows = sortedData.map((row) =>
      [
        row.mra_id,
        `"${row.name}"`,
        `"${row.clients}"`,
        row.avgCasesPerDay,
        row.lateCasePercentage,
        row.clientRevisionsWeek,
        row.clientRevisionsMonth,
        row.qualityScore,
      ].join(",")
    );
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

  // Export as PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reviewer Table", 14, 20);

    const tableColumn = columns.map((col) => col.label);
    const tableRows = sortedData.map((row) => [
      row.mra_id,
      row.name,
      row.clients,
      row.avgCasesPerDay.toFixed(1),
      `${row.lateCasePercentage}%`,
      row.clientRevisionsWeek,
      row.clientRevisionsMonth,
      `${row.qualityScore}%`,
    ]);

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
      `Summary: Avg Cases/Day: ${summary.avgCasesPerDay.toFixed(
        1
      )}, Late %: ${summary.lateCasePercentage.toFixed(
        1
      )}%, Client Rev (Week): ${summary.clientRevisionsWeek.toFixed(
        1
      )}, Client Rev (Month): ${summary.clientRevisionsMonth.toFixed(
        1
      )}, Quality Score: ${summary.qualityScore.toFixed(1)}%`,
      14,
      finalY + 10
    );

    doc.setFontSize(10);
    doc.text("Hover for Quality Trend: Overall Trend: Stable", 14, finalY + 16);
    doc.save("reviewers_table.pdf");
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#000000" }}>
        Reviewer Table
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {/* CSV icon button with no background color */}
        <Tooltip title="Export as CSV">
          <IconButton onClick={handleExportCSV}>
            <Box
              component="img"
              src={csvIcon}
              alt="CSV Icon"
              sx={{ width: 40, height: 40 }}
            />
          </IconButton>
        </Tooltip>

        {/* PDF icon button with no background color */}
        <Tooltip title="Export as PDF">
          <IconButton onClick={handleExportPDF}>
            <Box
              component="img"
              src={pdfIcon}
              alt="PDF Icon"
              sx={{ width: 40, height: 40 }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "85vh",
          minHeight: "65vh",
          overflowY: "auto",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    textAlign: "center",
                    borderRight: "1px solid #ddd",
                    backgroundColor: "#1E73BE",
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
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
            {sortedData.map((row, index) => (
              <TableRow
                key={row.mra_id}
                sx={{
                  backgroundColor: index % 2 ? "#f9f9f9" : "inherit",
                  "&:hover": { backgroundColor: "#e6f2ff" },
                }}
              >
                <TableCell sx={{ textAlign: "center" }}>{row.mra_id}</TableCell>
                <TableCell sx={{ textAlign: "left" }}>{row.name}</TableCell>
                <TableCell sx={{ textAlign: "left" }}>{row.clients}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {row.avgCasesPerDay.toFixed(1)}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {row.lateCasePercentage}%
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Tooltip title={`Revision Rate: ${row.revisionRate}%`} arrow>
                    <span>{row.clientRevisionsWeek}</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Tooltip title={`Revision Rate: ${row.revisionRate}%`} arrow>
                    <span>{row.clientRevisionsMonth}</span>
                  </Tooltip>
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: "center",
                    backgroundColor:
                      row.qualityScore >= 90
                        ? "#A5D6A7"
                        : row.qualityScore >= 80
                        ? "#FFF59D"
                        : "#EF9A9A",
                  }}
                >
                  <Tooltip
                    title={
                      <>
                        Accuracy: {row.accuracyScore}%<br />
                        Timeliness: {row.timelinessScore}%<br />
                        Efficiency: {row.efficiencyScore}%<br />
                        Past Month Trend: Stable
                      </>
                    }
                    arrow
                  >
                    <span>{row.qualityScore}%</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                Avg
              </TableCell>
              <TableCell sx={{ textAlign: "left", fontWeight: "bold" }} />
              <TableCell sx={{ textAlign: "left", fontWeight: "bold" }} />
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                {summary.avgCasesPerDay.toFixed(1)}
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                {summary.lateCasePercentage.toFixed(1)}%
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                {summary.clientRevisionsWeek.toFixed(1)}
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                {summary.clientRevisionsMonth.toFixed(1)}
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                {summary.qualityScore.toFixed(1)}%
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FLTable;
