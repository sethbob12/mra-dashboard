// src/QAMetrics.js
import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  List,
  ListItem,
  Collapse,
  Tooltip as MuiTooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  TableSortLabel,
  ListItemText
} from "@mui/material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Import static data
import QAData from "./QAData";
import FeedbackData from "./FeedbackData";

const openSansTheme = createTheme({
  typography: { fontFamily: "Open Sans, sans-serif" }
});

// Fallback mapping if a QA member isn’t found in QAData
const qaInternalMapping = {
  1: "Alice Cooper",
  2: "Brian Adams",
  3: "Carla Gomez",
  4: "Derek Hughes",
  5: "Evelyn Price",
  6: "Felix Ramirez",
  7: "Gloria Chen",
  8: "Henry Kim"
};

const baseColors = [
  "#1E73BE",
  "#FF8042",
  "#FFBB28",
  "#00C49F",
  "#FF6384",
  "#36A2EB",
  "#8A2BE2"
];

// Helper: Return QA member name for a given qaMember id.
const getQAName = (qaMember, qaData) => {
  const qaObj = qaData.find((item) => Number(item.qaMember) === Number(qaMember));
  return qaObj ? qaObj.name : qaInternalMapping[qaMember] || qaMember;
};

// Helper: Compute trend arrow and percent change.
const getTrend = (current, previous) => {
  if (previous === 0) return { arrow: "-", change: "N/A" };
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  return { arrow: diff >= 0 ? "↑" : "↓", change: `${Math.abs(pct).toFixed(1)}%` };
};

// Helper: Compute bar chart data for a QA member’s snapshots within the selected date range.
const computeBarDataForMember = (member, startDate, endDate) => {
  if (!member.snapshots) return [];
  return member.snapshots
    .filter((snap) => {
      const t = dayjs(snap.snapshotDate);
      return t.isSameOrAfter(startDate) && t.isSameOrBefore(endDate);
    })
    .sort((a, b) => dayjs(a.snapshotDate).valueOf() - dayjs(b.snapshotDate).valueOf())
    .map((snap) => ({
      dateLabel: dayjs(snap.snapshotDate).format("MMM D"),
      avgCasesDay: snap.avgCasesDay
    }));
};

// Helper: Compute combined trend data for the past 90 days.
const computeCombinedTrend = (qaData, uniqueQAMemberIDs, endDate) => {
  const days = 90;
  const windowStart = endDate.clone().subtract(days - 1, "day");
  const data = [];
  for (let i = 0; i < days; i++) {
    const currentDay = windowStart.clone().add(i, "day");
    const point = { date: currentDay.format("MM-DD") };
    uniqueQAMemberIDs.forEach((qaMember) => {
      const memberObj = qaData.find((x) => Number(x.qaMember) === Number(qaMember));
      if (!memberObj || !memberObj.snapshots) {
        point[`qa_${qaMember}`] = 0;
        return;
      }
      let lastVal = 0;
      memberObj.snapshots
        .sort((a, b) => dayjs(a.snapshotDate).valueOf() - dayjs(b.snapshotDate).valueOf())
        .forEach((snap) => {
          if (dayjs(snap.snapshotDate).isSameOrBefore(currentDay)) {
            lastVal = snap.avgCasesDay;
          }
        });
      point[`qa_${qaMember}`] = lastVal;
    });
    data.push(point);
  }
  return data;
};

// Helper: Filter and sort internal feedback for a given QA member.
const getSortedFeedback = (qaMember, start, end, feedbackData) => {
  return feedbackData
    .filter((fb) => {
      if (fb.feedbackType !== "internal") return false;
      const fbDate = dayjs.utc(fb.date);
      return (
        Number(fb.qaMember) === Number(qaMember) &&
        fbDate.isSameOrAfter(dayjs.utc(start)) &&
        fbDate.isSameOrBefore(dayjs.utc(end))
      );
    })
    .sort((a, b) => dayjs.utc(a.date).valueOf() - dayjs.utc(b.date).valueOf());
};

// Sorting helpers for feedback table.
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
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedArray.map((el) => el[0]);
}

export default function QAMetrics() {
  // Use static QAData and FeedbackData.
  const [qaData] = useState(QAData);
  const [feedbackData] = useState(FeedbackData);

  const theme = useTheme();
  const textColor = theme.palette.mode === "dark" ? "#fff" : "#000";
  const bgColor = theme.palette.mode === "dark" ? "#424242" : "#f9f9f9";

  // Default date range.
  const [startDate, setStartDate] = useState(dayjs("2024-09-01"));
  const [endDate, setEndDate] = useState(dayjs("2025-04-01"));

  const [qaMemberFilter, setQaMemberFilter] = useState("All");
  const [report, setReport] = useState(null);
  const [expandedFeedback, setExpandedFeedback] = useState({});
  const [feedbackOrder, setFeedbackOrder] = useState("asc");
  const [feedbackOrderBy, setFeedbackOrderBy] = useState("client");
  const [activeQA, setActiveQA] = useState({});

  const noData = !Array.isArray(qaData) || qaData.length === 0;

  // Get unique QA member IDs and dropdown list.
  const uniqueQAMemberIDs = useMemo(() => {
    return noData ? [] : Array.from(new Set(qaData.map((item) => item.qaMember)));
  }, [noData, qaData]);

  const uniqueQAMembers = useMemo(() => {
    return noData ? [] : ["All", ...qaData.map((item) => `${item.qaMember} - ${item.name}`)];
  }, [noData, qaData]);

  // Combined trend data for the past 90 days.
  const combinedTrendData = useMemo(() => {
    return noData ? [] : computeCombinedTrend(qaData, uniqueQAMemberIDs, endDate);
  }, [noData, qaData, uniqueQAMemberIDs, endDate]);

  // Determine Y-axis domain for the combined trend chart.
  const { minDomain, maxDomain } = useMemo(() => {
    if (noData || combinedTrendData.length === 0) {
      return { minDomain: 0, maxDomain: 100 };
    }
    let min = Infinity;
    let max = -Infinity;
    combinedTrendData.forEach((point) => {
      qaData.forEach((member) => {
        const val = point[`qa_${member.qaMember}`];
        if (val < min) min = val;
        if (val > max) max = val;
      });
    });
    return { minDomain: Math.floor(min - 5), maxDomain: Math.ceil(max + 5) };
  }, [noData, combinedTrendData, qaData]);

  // Generate the QA Metrics report from QAData.
  const generateReport = () => {
    if (!startDate.isValid() || !endDate.isValid()) return;
    if (noData) {
      setReport([]);
      return;
    }
    const result = qaData
      .filter((member) =>
        qaMemberFilter === "All"
          ? true
          : `${member.qaMember} - ${member.name}` === qaMemberFilter
      )
      .map((member) => {
        const snapshots = member.snapshots || [];
        const snapshotsInRange = snapshots
          .filter((snap) => {
            const t = dayjs(snap.snapshotDate);
            return t.isSameOrAfter(startDate) && t.isSameOrBefore(endDate);
          })
          .sort((a, b) => dayjs(a.snapshotDate).valueOf() - dayjs(b.snapshotDate).valueOf());
        const latestSnapshot =
          snapshotsInRange.length > 0 ? snapshotsInRange[snapshotsInRange.length - 1] : null;
        return {
          qaMember: member.qaMember,
          name: member.name,
          totalCases: latestSnapshot ? latestSnapshot.totalCasesSubmitted : 0,
          avgCasesDay: latestSnapshot ? latestSnapshot.avgCasesDay : 0,
          casesPast7Days: latestSnapshot ? latestSnapshot.totalCasesSubmitted : 0,
          casesPast30Days: latestSnapshot ? Math.round(latestSnapshot.totalCasesSubmitted * (30 / 7)) : 0,
          revisionsSentWeek: latestSnapshot ? latestSnapshot.revisionsSent : 0,
          clientRevisionsWeek: latestSnapshot ? latestSnapshot.clientRevisions : 0,
          breakdownByClient: latestSnapshot ? latestSnapshot.breakdownByClient : {},
          snapshots
        };
      });
    setReport(result);
  };

  // Improved PDF export that captures the entire report content.
  const exportReportToPDF = () => {
    const input = document.getElementById("qaReportWrapper");
    if (!input) return;
    // Use a moderate scale for PDF quality.
    import("html2canvas").then(({ default: html2canvas }) => {
      html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png", 1.0);
        const doc = new jsPDF("p", "mm", "a4");
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        doc.save("qa_metrics_report.pdf");
      });
    });
  };

  // Export report data as CSV.
  const exportReportToCSV = () => {
    if (!report || report.length === 0) return;
    const headers = [
      "QA Member",
      "Name",
      "Avg Cases/Day",
      "Cases (7d)",
      "Cases (30d)",
      "Total Cases",
      "Revisions (Week)",
      "Revision Rate (%)"
    ];
    const rows = report.map((member) => {
      const currentRevisionRate =
        member.totalCases > 0 ? (member.clientRevisionsWeek / member.totalCases) * 100 : 0;
      return [
        member.qaMember,
        member.name,
        member.avgCasesDay.toFixed(1),
        member.casesPast7Days,
        member.casesPast30Days,
        member.totalCases,
        member.revisionsSentWeek,
        currentRevisionRate.toFixed(1)
      ];
    });
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "qa_metrics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle the display of a QA member’s trend line in the combined trend chart.
  const toggleLine = (qaMember) => {
    setActiveQA((prev) => ({ ...prev, [qaMember]: !prev[qaMember] }));
  };

  // Initialize activeQA so that all QA member lines are shown by default.
  useEffect(() => {
    if (!noData) {
      const initial = {};
      qaData.forEach((member) => {
        initial[member.qaMember] = true;
      });
      setActiveQA(initial);
    }
  }, [noData, qaData]);

  // Render the feedback table for a given QA member.
  const renderFeedbackTable = (qaMember) => {
    const sortedFeedback = stableSort(
      getSortedFeedback(qaMember, startDate, endDate, feedbackData),
      getComparator(feedbackOrder, feedbackOrderBy)
    );
    return (
      <Paper sx={{ overflowX: "auto", backgroundColor: bgColor }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#555" : "#f5f5f5" }}>
              <TableCell sx={{ minWidth: "120px", color: textColor }}>
                <TableSortLabel
                  active={feedbackOrderBy === "reviewer"}
                  direction={feedbackOrderBy === "reviewer" ? feedbackOrder : "asc"}
                  onClick={() => {
                    const isAsc = feedbackOrderBy === "reviewer" && feedbackOrder === "asc";
                    setFeedbackOrder(isAsc ? "desc" : "asc");
                    setFeedbackOrderBy("reviewer");
                  }}
                >
                  Reviewer
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: "120px", color: textColor }}>
                <TableSortLabel
                  active={feedbackOrderBy === "client"}
                  direction={feedbackOrderBy === "client" ? feedbackOrder : "asc"}
                  onClick={() => {
                    const isAsc = feedbackOrderBy === "client" && feedbackOrder === "asc";
                    setFeedbackOrder(isAsc ? "desc" : "asc");
                    setFeedbackOrderBy("client");
                  }}
                >
                  Client
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: "120px", color: textColor }}>
                <TableSortLabel
                  active={feedbackOrderBy === "date"}
                  direction={feedbackOrderBy === "date" ? feedbackOrder : "asc"}
                  onClick={() => {
                    const isAsc = feedbackOrderBy === "date" && feedbackOrder === "asc";
                    setFeedbackOrder(isAsc ? "desc" : "asc");
                    setFeedbackOrderBy("date");
                  }}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: "120px", color: textColor }}>Feedback</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFeedback.map((fb, idx) => (
              <TableRow
                key={idx}
                sx={{
                  backgroundColor: idx % 2 === 0 ? (theme.palette.mode === "dark" ? "#555" : "#f9f9f9") : "inherit"
                }}
              >
                <TableCell sx={{ color: textColor }}>{fb.reviewer}</TableCell>
                <TableCell sx={{ color: textColor }}>{fb.client}</TableCell>
                <TableCell sx={{ color: textColor }}>{dayjs.utc(fb.date).format("YYYY-MM-DD")}</TableCell>
                <TableCell sx={{ color: textColor }}>{fb.content}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  // Copy all feedback for a given QA member.
  const copyAllFeedback = (qaMember) => {
    const feedbackForMember = getSortedFeedback(qaMember, startDate, endDate, feedbackData);
    const allFeedbackText = feedbackForMember
      .map((fb) => `${dayjs.utc(fb.date).format("YYYY-MM-DD")}: ${fb.content}`)
      .join("\n");
    navigator.clipboard.writeText(allFeedbackText);
    alert("Feedback copied to clipboard!");
  };

  return (
    <ThemeProvider theme={openSansTheme}>
      <Box
        id="qaReportWrapper"
        sx={{ mt: 4, mb: 4, backgroundColor: bgColor, p: 2, borderRadius: 2, color: textColor }}
      >
        {/* Report Header & Filters */}
        <Paper
          sx={{ p: 3, borderRadius: 2, backgroundColor: bgColor, color: textColor, mb: 3 }}
          id="qaReportContent"
        >
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: textColor }}>
            QA Metrics Report
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                sx={{
                  "& label.Mui-focused": { color: textColor },
                  "& .MuiSvgIcon-root": { color: textColor }
                }}
              >
                <InputLabel sx={{ color: textColor }}>QA Member</InputLabel>
                <Select
                  value={qaMemberFilter}
                  onChange={(e) => setQaMemberFilter(e.target.value)}
                  label="QA Member"
                  sx={{
                    color: textColor,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: textColor },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: textColor },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: textColor },
                    "& .MuiSelect-icon": { color: textColor }
                  }}
                  MenuProps={{
                    PaperProps: { sx: { bgcolor: bgColor, "& .MuiMenuItem-root": { color: textColor } } }
                  }}
                >
                  {uniqueQAMembers.map((member) => (
                    <MenuItem key={member} value={member} sx={{ color: textColor }}>
                      {member}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => {
                    if (newValue && newValue.isValid()) setStartDate(newValue);
                  }}
                  inputFormat="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          color: textColor,
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: textColor },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: textColor },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: textColor }
                        },
                        "& .MuiFormLabel-root": { color: textColor },
                        "& .MuiFormLabel-root.Mui-focused": { color: textColor },
                        "& input": { color: textColor }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => {
                    if (newValue && newValue.isValid()) setEndDate(newValue);
                  }}
                  inputFormat="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          color: textColor,
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: textColor },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: textColor },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: textColor }
                        },
                        "& .MuiFormLabel-root": { color: textColor },
                        "& .MuiFormLabel-root.Mui-focused": { color: textColor },
                        "& input": { color: textColor }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={generateReport}
              sx={{ py: 1.2, fontWeight: "bold", fontSize: "1rem" }}
            >
              Generate QA Metrics Report
            </Button>
            <Button variant="contained" color="secondary" onClick={exportReportToPDF}>
              Export as PDF
            </Button>
            <Button variant="contained" color="secondary" onClick={exportReportToCSV}>
              Export as CSV
            </Button>
          </Box>
        </Paper>

        {/* Report Results */}
        {report && report.length > 0 && (
          <Box sx={{ mt: 3 }}>
            {report.map((member) => {
              const barData = computeBarDataForMember(member, startDate, endDate);
              const currentRevisionRate =
                member.totalCases > 0 ? (member.clientRevisionsWeek / member.totalCases) * 100 : 0;
              const revisionTrend = getTrend(currentRevisionRate, 0);
              const avgCasesTrend = getTrend(member.avgCasesDay, 0);
              return (
                <Paper key={member.qaMember} sx={{ p: 2, mb: 2, backgroundColor: bgColor, color: textColor }}>
                  <Grid container spacing={2}>
                    {/* Left Column: Stats and Bar Chart */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" sx={{ mb: 1, color: textColor }}>
                        QA - {getQAName(member.qaMember, qaData)}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 2, color: textColor }}>
                        Submission Stats
                      </Typography>
                      <List dense>
                        <ListItem>
                          <MuiTooltip title={`Change: ${avgCasesTrend.change}`}>
                            {avgCasesTrend.arrow === "↑" ? (
                              <ArrowUpwardIcon sx={{ mr: 1, fontSize: 20, color: "green" }} />
                            ) : (
                              <ArrowDownwardIcon sx={{ mr: 1, fontSize: 20, color: "red" }} />
                            )}
                          </MuiTooltip>
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: "bold", color: textColor }}>
                                Avg Cases/Day: {member.avgCasesDay.toFixed(1)}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary={`Cases (Past 7 Days): ${member.casesPast7Days}`} sx={{ color: textColor }} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary={`Cases (Past 30 Days): ${member.casesPast30Days}`} sx={{ color: textColor }} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary={`Total Cases Submitted: ${member.totalCases}`} sx={{ color: textColor }} />
                        </ListItem>
                      </List>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 2, color: textColor }}>
                        Revisions / Feedback
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary={`Revisions Sent (Week): ${member.revisionsSentWeek}`} sx={{ color: textColor }} />
                        </ListItem>
                        <ListItem>
                          <MuiTooltip title={`(Client Revisions / Total Cases) x 100. Trend: ${revisionTrend.change}`}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {revisionTrend.arrow === "↑" ? (
                                <ArrowUpwardIcon sx={{ mr: 1, fontSize: 20, color: currentRevisionRate < 10 ? "green" : "red" }} />
                              ) : (
                                <ArrowDownwardIcon sx={{ mr: 1, fontSize: 20, color: currentRevisionRate < 10 ? "green" : "red" }} />
                              )}
                              <ListItemText
                                primary={
                                  <Typography variant="body1" sx={{ fontWeight: "bold", color: textColor }}>
                                    Revision Rate:{" "}
                                    {member.totalCases > 0
                                      ? (member.clientRevisionsWeek / member.totalCases * 100).toFixed(1)
                                      : "0.0"}
                                    %
                                  </Typography>
                                }
                              />
                            </Box>
                          </MuiTooltip>
                        </ListItem>
                      </List>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 2, mb: 1, color: textColor }}>
                        Avg Cases/Day by Snapshot
                      </Typography>
                      {barData.length > 0 ? (
                        <Box sx={{ width: "100%", height: 150 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="dateLabel" stroke={textColor} />
                              <YAxis stroke={textColor} />
                              <RechartsTooltip
                                formatter={(val) => [val.toFixed(1) + " cases/day", "Avg Cases"]}
                                labelFormatter={(label) => `Date: ${label}`}
                                cursor={{ strokeDasharray: "3 3", strokeWidth: 1 }}
                              />
                              <Bar dataKey="avgCasesDay" fill={baseColors[0]} barSize={30} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Typography sx={{ color: textColor }}>No snapshots in this date range.</Typography>
                      )}
                    </Grid>
                    {/* Right Column: Client Breakdown Pie Chart */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1, textAlign: "center", color: textColor }}>
                        Client Breakdown
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          height: 350,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <ResponsiveContainer width="80%" height="80%">
                          <PieChart>
                            <Pie
                              data={Object.entries(member.breakdownByClient).map(
                                ([client, count]) => ({ client, count })
                              )}
                              dataKey="count"
                              nameKey="client"
                              innerRadius={50}
                              outerRadius={80}
                              label
                            >
                              {Object.entries(member.breakdownByClient).map(([client, count], index) => (
                                <Cell key={`cell-${index}`} fill={baseColors[index % baseColors.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>
                  </Grid>
                  {/* Feedback Section */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setExpandedFeedback((prev) => ({
                          ...prev,
                          [member.qaMember]: !prev[member.qaMember]
                        }))
                      }
                      sx={{
                        mb: 1,
                        borderColor: "green",
                        color: "green",
                        "&:hover": { borderColor: "darkgreen", backgroundColor: "rgba(0,128,0,0.1)" }
                      }}
                    >
                      {expandedFeedback[member.qaMember] ? "Hide Feedback" : "Show Feedback"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => copyAllFeedback(member.qaMember)}
                      sx={{
                        mb: 1,
                        ml: 2,
                        borderColor: "blue",
                        color: "blue",
                        "&:hover": { borderColor: "darkblue", backgroundColor: "rgba(0,0,255,0.1)" }
                      }}
                    >
                      Copy All Feedback
                    </Button>
                    <Collapse in={expandedFeedback[member.qaMember]} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, color: textColor }}>
                          Internal Feedback (this date range):
                        </Typography>
                        {getSortedFeedback(member.qaMember, startDate, endDate, feedbackData).length > 0 ? (
                          renderFeedbackTable(member.qaMember)
                        ) : (
                          <Typography sx={{ color: textColor }}>No feedback in this date range.</Typography>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                </Paper>
              );
            })}
            <Box sx={{ textAlign: "center", mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
              <Button variant="contained" color="secondary" onClick={exportReportToPDF}>
                Export as PDF
              </Button>
              <Button variant="contained" color="secondary" onClick={exportReportToCSV}>
                Export as CSV
              </Button>
            </Box>
          </Box>
        )}

        {/* Combined Trend Chart Section */}
        <Paper sx={{ p: 3, borderRadius: 2, mt: 4, backgroundColor: bgColor, color: textColor }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: textColor }}>
            Combined Avg Cases/Day Trend (Past 90 Days)
          </Typography>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ mr: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: textColor }}>
                Legend
              </Typography>
              {uniqueQAMemberIDs.map((qaMember) => (
                <Box
                  key={qaMember}
                  sx={{ display: "flex", alignItems: "center", cursor: "pointer", mb: 1 }}
                  onClick={() => toggleLine(qaMember)}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: baseColors[qaMember % baseColors.length],
                      opacity: activeQA[qaMember] ? 1 : 0.1,
                      mr: 1
                    }}
                  />
                  <Typography variant="body2" sx={{ opacity: activeQA[qaMember] ? 1 : 0.3, color: textColor }}>
                    {getQAName(qaMember, qaData)}
                  </Typography>
                </Box>
              ))}
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedTrendData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={textColor} />
                <YAxis domain={[minDomain, maxDomain]} stroke={textColor} />
                <RechartsTooltip
                  formatter={(val, name) => {
                    const qaId = name.replace("qa_", "");
                    const displayName = getQAName(qaId, qaData);
                    return [val.toFixed(1) + " cases/day", `QA - ${displayName}`];
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                  cursor={{ strokeDasharray: "3 3", strokeWidth: 1 }}
                />
                {uniqueQAMemberIDs.map((qaMember) => (
                  <Line
                    key={qaMember}
                    type="monotone"
                    dataKey={`qa_${qaMember}`}
                    stroke={baseColors[qaMember % baseColors.length]}
                    strokeWidth={3}
                    strokeOpacity={activeQA[qaMember] ? 1 : 0.1}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
