// src/QAMetrics.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Tooltip
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend
} from "recharts";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const openSansTheme = createTheme({
  typography: {
    fontFamily: "Open Sans, sans-serif"
  }
});

// ---------- Helpers ----------
const getWorkdays = (start, end) => {
  // Mon-Fri only
  let count = 0;
  let current = start.startOf("day");
  const last = end.startOf("day");
  while (current.isBefore(last) || current.isSame(last)) {
    const d = current.day();
    if (d !== 0 && d !== 6) count++;
    current = current.add(1, "day");
  }
  return count;
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
const pieColors = baseColors;

const getTrend = (current, previous) => {
  if (previous === 0) return { arrow: "-", change: "N/A" };
  const diff = current - previous;
  const percent = (diff / previous) * 100;
  return {
    arrow: diff >= 0 ? "↑" : "↓",
    change: `${Math.abs(percent).toFixed(1)}%`
  };
};

// Simulate daily submissions for sparkline
const computeSparklineData = (member, startDate, endDate) => {
  const nDays = endDate.diff(startDate, "day") + 1;
  const data = [];
  for (let i = 0; i < nDays; i++) {
    const value = member.avgCasesDay * (1 + (Math.random() * 0.2 - 0.1)); // ±10%
    const date = startDate.add(i, "day").format("MM-DD");
    data.push({ date, value });
  }
  return data;
};

/**
 * QAMetrics component
 * Receives qaData & feedbackData as props, so it respects mock/live toggle in App.js.
 */
const QAMetrics = ({ qaData, feedbackData }) => {
  // 1) ----- Define all Hooks at top (unconditionally) -----

  // Main local states
  const [qaMemberFilter, setQaMemberFilter] = useState("All");
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const [report, setReport] = useState(null);
  const [expandedFeedback, setExpandedFeedback] = useState({});

  // Tracks which QA lines are active in the combined chart
  const [activeQA, setActiveQA] = useState({});

  // 2) ----- Determine if data is missing or empty -----
  let noData = false;
  if (
    !Array.isArray(qaData) ||
    !Array.isArray(feedbackData) ||
    qaData.length === 0
  ) {
    noData = true;
  }

  // 3) ----- Derive or memoize values -- but handle "noData" safely -----

  // Unique QA IDs
  const uniqueQAMemberIDs = useMemo(() => {
    if (noData) return [];
    return Array.from(new Set(qaData.map(item => item.qaMember)));
  }, [noData, qaData]);

  // Unique QA "select" members
  const uniqueQAMembers = useMemo(() => {
    if (noData) return [];
    return ["All", ...qaData.map(item => `${item.qaMember} - ${item.name}`)];
  }, [noData, qaData]);

  // 4) ----- For activeQA we can set up once the data arrives -----
  useEffect(() => {
    if (!noData) {
      const initial = {};
      qaData.forEach(member => {
        initial[member.qaMember] = true;
      });
      setActiveQA(initial);
    }
  }, [noData, qaData]);

  // 5) ----- Utility Functions that rely on data -----

  // For daily chart
  const combinedTrendData = useMemo(() => {
    if (noData) return [];
    // random drift for each QA
    const drifts = {};
    uniqueQAMemberIDs.forEach(qaMember => {
      drifts[qaMember] = Math.random() * 3 - 1.5;
    });
    const data = [];
    for (let i = 0; i < 30; i++) {
      if (i % 2 !== 0) continue; // sample every other day
      const date = dayjs().subtract(29 - i, "day").format("MMM D");
      const point = { date };
      uniqueQAMemberIDs.forEach(qaMember => {
        const memberObj = qaData.find(x => x.qaMember === qaMember);
        if (memberObj) {
          const drift = drifts[qaMember];
          const initial = memberObj.avgCasesDay - drift * 29;
          const value = initial + drift * i;
          point[`qa_${qaMember}`] = Number(value.toFixed(1));
        }
      });
      data.push(point);
    }
    return data;
  }, [noData, qaData, uniqueQAMemberIDs]);

  // Y-axis domain
  const { minDomain, maxDomain } = useMemo(() => {
    if (noData || combinedTrendData.length === 0) {
      return { minDomain: 0, maxDomain: 100 };
    }
    let min = Infinity;
    let max = -Infinity;
    combinedTrendData.forEach(point => {
      uniqueQAMemberIDs.forEach(qaMember => {
        const val = point[`qa_${qaMember}`];
        if (val < min) min = val;
        if (val > max) max = val;
      });
    });
    return {
      minDomain: Math.floor(min - 10),
      maxDomain: Math.ceil(max + 10)
    };
  }, [noData, combinedTrendData, uniqueQAMemberIDs]);

  // Filtered feedback
  const getSortedFeedback = (qaMember, start, end) => {
    if (noData) return [];
    const filtered = feedbackData.filter(item => {
      return (
        item.qaMember === qaMember &&
        dayjs(item.date).isSameOrAfter(start) &&
        dayjs(item.date).isSameOrBefore(end)
      );
    });
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Generate the main QA "report"
  const generateReport = () => {
    if (noData) {
      setReport([]);
      return;
    }
    const workdays = getWorkdays(startDate, endDate);
    const result = qaData
      .filter(member => {
        if (qaMemberFilter !== "All") {
          return `${member.qaMember} - ${member.name}` === qaMemberFilter;
        }
        return true;
      })
      .map(member => {
        let totalCases = 0;
        if (workdays === 7) {
          totalCases = member.casesPast7Days;
        } else if (workdays === 30) {
          totalCases = member.casesPast30Days;
        } else if (workdays === 60) {
          totalCases = member.casesPast60Days;
        } else {
          totalCases = Math.round(member.avgCasesDay * workdays);
        }
        return {
          qaMember: member.qaMember,
          name: member.name,
          totalCases,
          avgCasesDay: member.avgCasesDay,
          casesPast7Days: member.casesPast7Days,
          casesPast30Days: member.casesPast30Days,
          revisionsSentWeek: member.revisionsSentWeek,
          clientRevisionsWeek: member.clientRevisionsWeek,
          prevAvgCasesDay: member.prevAvgCasesDay,
          prevClientRevisionsWeek: member.prevClientRevisionsWeek,
          prevTotalCases: member.prevTotalCases,
          breakdownByClient: member.breakdownByClient
        };
      });
    setReport(result);
  };

  // Export to PDF
  const exportReportToPDF = () => {
    if (!report || report.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("QA Metrics Report", 14, 20);
    doc.setFontSize(12);
    doc.text(
      `Period: ${startDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`,
      14,
      30
    );
    const tableColumns = [
      "QA Member",
      "Name",
      "Avg Cases/Day",
      "Cases (7d)",
      "Cases (30d)",
      "Total Cases",
      "Revisions (Week)",
      "Revision Rate (%)"
    ];
    const tableRows = report.map(member => {
      const currentRevisionRate =
        member.totalCases > 0
          ? (member.clientRevisionsWeek / member.totalCases) * 100
          : 0;
      return [
        member.qaMember,
        member.name,
        member.avgCasesDay,
        member.casesPast7Days,
        member.casesPast30Days,
        member.totalCases,
        member.revisionsSentWeek,
        currentRevisionRate.toFixed(1)
      ];
    });
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 40
    });
    doc.save("qa_metrics_report.pdf");
  };

  // Toggle a single QA line in the combined chart
  const toggleLine = qaMember => {
    setActiveQA(prev => ({ ...prev, [qaMember]: !prev[qaMember] }));
  };

  // Toggle feedback panel
  const handleToggleFeedback = qaMember => {
    setExpandedFeedback(prev => ({
      ...prev,
      [qaMember]: !prev[qaMember]
    }));
  };

  // 6) ----- Render -----
  return (
    <ThemeProvider theme={openSansTheme}>
      {noData ? (
        // If there's no data
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            No QA data or feedback data available.
          </Typography>
        </Box>
      ) : (
        // Otherwise, normal UI
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Filtering & report generation */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
              QA Metrics Report
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>QA Member</InputLabel>
                  <Select
                    value={qaMemberFilter}
                    onChange={e => setQaMemberFilter(e.target.value)}
                    label="QA Member"
                  >
                    {uniqueQAMembers.map(member => (
                      <MenuItem key={member} value={member}>
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
                    onChange={setStartDate}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={generateReport}
              sx={{ mt: 3, py: 1.2, fontWeight: "bold", fontSize: "1rem" }}
            >
              Generate QA Metrics Report
            </Button>
          </Paper>

          {report && report.length > 0 && (
            <Box sx={{ mt: 3 }}>
              {report.map(member => {
                const sortedFeedback = getSortedFeedback(
                  member.qaMember,
                  startDate.clone(),
                  endDate.clone()
                );
                const currentRevisionRate =
                  member.totalCases > 0
                    ? (member.clientRevisionsWeek / member.totalCases) * 100
                    : 0;
                const previousRevisionRate =
                  member.prevTotalCases > 0
                    ? (member.prevClientRevisionsWeek / member.prevTotalCases) * 100
                    : 0;
                const revisionTrend = getTrend(
                  currentRevisionRate,
                  previousRevisionRate
                );
                const avgCasesTrend = getTrend(
                  member.avgCasesDay,
                  member.prevAvgCasesDay
                );
                const sparklineData = computeSparklineData(
                  member,
                  startDate.clone(),
                  endDate.clone()
                );
                const clientData = Object.entries(
                  member.breakdownByClient
                ).map(([client, count]) => ({
                  client,
                  count
                }));

                return (
                  <Paper key={member.qaMember} sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      {/* Left Column */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          QA Member {member.qaMember} – {member.name}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", mt: 2 }}
                        >
                          Submission Stats
                        </Typography>
                        <List dense>
                          <ListItem>
                            <Tooltip title={`Change: ${avgCasesTrend.change}`}>
                              {avgCasesTrend.arrow === "↑" ? (
                                <ArrowUpwardIcon
                                  sx={{ mr: 1, fontSize: 20, color: "green" }}
                                />
                              ) : (
                                <ArrowDownwardIcon
                                  sx={{ mr: 1, fontSize: 20, color: "red" }}
                                />
                              )}
                            </Tooltip>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Avg Cases/Day: {member.avgCasesDay}
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary={`Cases (Past 7 Days): ${member.casesPast7Days}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary={`Cases (Past 30 Days): ${member.casesPast30Days}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary={`Total Cases Submitted: ${member.totalCases}`}
                            />
                          </ListItem>
                        </List>

                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", mt: 2 }}
                        >
                          Revisions / Feedback
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary={`Revisions Sent (Week): ${member.revisionsSentWeek}`}
                            />
                          </ListItem>
                          <ListItem>
                            <Tooltip
                              title={`(Client Revisions / Total Cases) x 100. Trend: ${revisionTrend.change}`}
                            >
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                {revisionTrend.arrow === "↑" ? (
                                  <ArrowUpwardIcon
                                    sx={{
                                      mr: 1,
                                      fontSize: 20,
                                      color:
                                        currentRevisionRate < 10 ? "green" : "red"
                                    }}
                                  />
                                ) : (
                                  <ArrowDownwardIcon
                                    sx={{
                                      mr: 1,
                                      fontSize: 20,
                                      color:
                                        currentRevisionRate < 10 ? "green" : "red"
                                    }}
                                  />
                                )}
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body1"
                                      sx={{ fontWeight: "bold" }}
                                    >
                                      Revision Rate: {currentRevisionRate.toFixed(1)}%
                                    </Typography>
                                  }
                                />
                              </Box>
                            </Tooltip>
                          </ListItem>
                        </List>

                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", mt: 2, mb: 1 }}
                        >
                          Daily Submissions
                        </Typography>
                        <Tooltip title="Estimated daily submissions (±10% variation).">
                          <Box sx={{ width: "100%", height: 60 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={sparklineData}>
                                <RechartsTooltip
                                  formatter={val => `${val.toFixed(1)} cases`}
                                  labelFormatter={label => `Date: ${label}`}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#1E73BE"
                                  dot={false}
                                  strokeWidth={2}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                        </Tooltip>
                      </Grid>

                      {/* Right Column: Pie Chart */}
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
                        >
                          Client Breakdown
                        </Typography>
                        <Box sx={{ width: "100%", height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={clientData}
                                dataKey="count"
                                nameKey="client"
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                label
                              >
                                {clientData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={pieColors[index % pieColors.length]}
                                  />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Feedback Toggle */}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleToggleFeedback(member.qaMember)}
                        sx={{
                          mb: 1,
                          borderColor: "green",
                          color: "green",
                          "&:hover": {
                            borderColor: "darkgreen",
                            backgroundColor: "rgba(0,128,0,0.1)"
                          }
                        }}
                      >
                        {expandedFeedback[member.qaMember]
                          ? "Hide Feedback"
                          : "Show Feedback"}
                      </Button>
                      <Collapse
                        in={expandedFeedback[member.qaMember]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Feedback Given:
                          </Typography>
                          {sortedFeedback.length > 0 ? (
                            <Paper sx={{ overflowX: "auto" }}>
                              <table
                                style={{ width: "100%", borderCollapse: "collapse" }}
                              >
                                <thead>
                                  <tr>
                                    <th
                                      style={{
                                        border: "1px solid #ddd",
                                        padding: "8px",
                                        minWidth: "120px"
                                      }}
                                    >
                                      Reviewer
                                    </th>
                                    <th
                                      style={{
                                        border: "1px solid #ddd",
                                        padding: "8px",
                                        minWidth: "120px"
                                      }}
                                    >
                                      Date
                                    </th>
                                    <th
                                      style={{
                                        border: "1px solid #ddd",
                                        padding: "8px"
                                      }}
                                    >
                                      Client
                                    </th>
                                    <th
                                      style={{
                                        border: "1px solid #ddd",
                                        padding: "8px",
                                        minWidth: "120px"
                                      }}
                                    >
                                      Case ID
                                    </th>
                                    <th
                                      style={{
                                        border: "1px solid #ddd",
                                        padding: "8px"
                                      }}
                                    >
                                      Feedback
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sortedFeedback.map((fb, idx) => (
                                    <tr key={idx}>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "8px"
                                        }}
                                      >
                                        {fb.name}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "8px",
                                          minWidth: "120px"
                                        }}
                                      >
                                        {dayjs(fb.date).format("YYYY-MM-DD")}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "8px"
                                        }}
                                      >
                                        {fb.client}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "8px",
                                          minWidth: "120px"
                                        }}
                                      >
                                        {fb.caseID}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #ddd",
                                          padding: "8px"
                                        }}
                                      >
                                        {fb.text}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </Paper>
                          ) : (
                            <Typography>
                              No feedback available for this period.
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  </Paper>
                );
              })}
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button variant="contained" color="secondary" onClick={exportReportToPDF}>
                  Export QA Metrics to PDF
                </Button>
              </Box>
            </Box>
          )}

          {/* Combined Trend Chart */}
          <Paper sx={{ p: 3, borderRadius: 2, mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
              Combined Avg Cases/Day Trend (Past 30 Days)
            </Typography>
            <Box sx={{ display: "flex" }}>
              <Box sx={{ mr: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Legend
                </Typography>
                {uniqueQAMemberIDs.map(qaMember => (
                  <Box
                    key={qaMember}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      mb: 1
                    }}
                    onClick={() => toggleLine(qaMember)}
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor:
                          pieColors[qaMember % pieColors.length],
                        opacity: activeQA[qaMember] ? 1 : 0.1,
                        mr: 1
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ opacity: activeQA[qaMember] ? 1 : 0.3 }}
                    >
                      QA Member {qaMember} -{" "}
                      {qaData.find(m => m.qaMember === qaMember)?.name}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <ResponsiveContainer width="100%" height={500}>
                <LineChart
                  data={combinedTrendData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[minDomain, maxDomain]} />
                  <RechartsTooltip
                    cursor={{ strokeDasharray: "3 3", strokeWidth: 1 }}
                  />
                  {uniqueQAMemberIDs.map(qaMember => (
                    <Line
                      key={qaMember}
                      type="monotone"
                      dataKey={`qa_${qaMember}`}
                      stroke={pieColors[qaMember % pieColors.length]}
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
      )}
    </ThemeProvider>
  );
};

export default QAMetrics;
