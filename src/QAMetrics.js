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
  Paper,
  List,
  ListItem,
  Collapse,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  TextField
} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

dayjs.extend(utc);

const openSansTheme = createTheme({
  typography: { fontFamily: "Open Sans, sans-serif" }
});

// ---------- QA Internal Mapping ----------
const qaInternalMapping = {
  301: "Alice Cooper",
  302: "Brian Adams",
  303: "Carla Gomez",
  304: "Derek Hughes",
  305: "Evelyn Price",
  306: "Felix Ramirez",
  307: "Gloria Chen",
  308: "Henry Kim"
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

const getTrend = (current, previous) => {
  if (previous === 0) return { arrow: "-", change: "N/A" };
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  return { arrow: diff >= 0 ? "↑" : "↓", change: `${Math.abs(pct).toFixed(1)}%` };
};

const getWorkdays = (start, end) => {
  let count = 0;
  let current = start.startOf("day");
  const last = end.startOf("day");
  while (current.isBefore(last) || current.isSame(last)) {
    if (current.day() !== 0 && current.day() !== 6) count++;
    current = current.add(1, "day");
  }
  return count;
};

// Returns only internal feedback items from feedbackData that match the QA member (using full name mapping)
const getSortedFeedback = (qaMember, start, end, feedbackData) => {
  return feedbackData
    .filter((fb) => {
      if (fb.feedbackType !== "internal") return false;
      return (
        fb.qaMember === qaInternalMapping[qaMember] &&
        dayjs(fb.date).isSameOrAfter(start) &&
        dayjs(fb.date).isSameOrBefore(end)
      );
    })
    .sort((a, b) => dayjs(a.date) - dayjs(b.date));
};

// eslint-disable-next-line no-unused-vars
const computeDifferenceInRange = (snapshots, metric, rangeStart, rangeEnd) => {
  if (!snapshots || !Array.isArray(snapshots)) return 0;
  const filtered = snapshots
    .filter((snap) => {
      const t = dayjs.utc(snap.snapshotDate);
      return (
        t.isSameOrAfter(dayjs.utc(rangeStart)) &&
        t.isSameOrBefore(dayjs.utc(rangeEnd))
      );
    })
    .sort((a, b) => dayjs.utc(a.snapshotDate) - dayjs.utc(b.snapshotDate));
  if (filtered.length >= 2)
    return filtered[filtered.length - 1][metric] - filtered[0][metric];
  else if (filtered.length === 1)
    return filtered[0][metric];
  return 0;
};

const computeClientBreakdown = (snapshots, rangeStart, rangeEnd) => {
  const filtered = snapshots
    .filter((snap) => {
      const t = dayjs.utc(snap.snapshotDate);
      return (
        t.isSameOrAfter(dayjs.utc(rangeStart)) &&
        t.isSameOrBefore(dayjs.utc(rangeEnd))
      );
    })
    .sort((a, b) => dayjs.utc(a.snapshotDate) - dayjs.utc(b.snapshotDate));
  if (filtered.length < 2) return {};
  const startSnapshot = filtered[0];
  const endSnapshot = filtered[filtered.length - 1];
  const breakdown = {};
  for (const client in endSnapshot.breakdownByClient) {
    breakdown[client] =
      endSnapshot.breakdownByClient[client] -
      (startSnapshot.breakdownByClient[client] || 0);
  }
  return breakdown;
};

const computeBarDataForMember = (member, startDate, endDate) => {
  if (!member.snapshots) return [];
  return member.snapshots
    .filter((snap) => {
      const t = dayjs.utc(snap.snapshotDate);
      return (
        t.isSameOrAfter(dayjs.utc(startDate)) &&
        t.isSameOrBefore(dayjs.utc(endDate))
      );
    })
    .sort((a, b) => dayjs.utc(a.snapshotDate) - dayjs.utc(b.snapshotDate))
    .map((snap) => ({
      dateLabel: dayjs.utc(snap.snapshotDate).format("MMM D"),
      avgCasesDay: snap.avgCasesDay
    }));
};

const computeCombinedTrend = (qaData, uniqueQAMemberIDs, endDate) => {
  const days = 30;
  const windowStart = endDate.clone().subtract(days - 1, "day");
  const data = [];
  for (let i = 0; i < days; i++) {
    const currentDay = windowStart.clone().add(i, "day");
    const point = { date: currentDay.format("MM-DD") };
    uniqueQAMemberIDs.forEach((qaMember) => {
      const memberObj = qaData.find((x) => x.qaMember === qaMember);
      if (!memberObj || !memberObj.snapshots) {
        point[`qa_${qaMember}`] = 0;
        return;
      }
      let lastVal = 0;
      memberObj.snapshots
        .sort((a, b) => dayjs.utc(a.snapshotDate) - dayjs.utc(b.snapshotDate))
        .forEach((snap) => {
          if (dayjs.utc(snap.snapshotDate).isSameOrBefore(currentDay)) {
            lastVal = snap.avgCasesDay;
          }
        });
      point[`qa_${qaMember}`] = lastVal;
    });
    data.push(point);
  }
  return data;
};

// ========== QAMetrics Component ==========
export default function QAMetrics({ qaData, feedbackData }) {
  const theme = useTheme();
  const textColor = theme.palette.mode === "dark" ? "#fff" : "#000";
  const bgColor = theme.palette.mode === "dark" ? "#424242" : "#f9f9f9";

  const [qaMemberFilter, setQaMemberFilter] = useState("All");
  const [startDate, setStartDate] = useState(dayjs("2025-02-09"));
  const [endDate, setEndDate] = useState(dayjs("2025-03-11"));
  const [report, setReport] = useState(null);
  const [expandedFeedback, setExpandedFeedback] = useState({});
  const [activeQA, setActiveQA] = useState({});

  const noData = !Array.isArray(qaData) || qaData.length === 0;

  const uniqueQAMemberIDs = useMemo(() => {
    return noData ? [] : Array.from(new Set(qaData.map((item) => item.qaMember)));
  }, [noData, qaData]);

  const uniqueQAMembers = useMemo(() => {
    return noData ? [] : ["All", ...qaData.map((item) => `${item.qaMember} - ${item.name}`)];
  }, [noData, qaData]);

  useEffect(() => {
    if (!noData) {
      const initial = {};
      qaData.forEach((member) => {
        initial[member.qaMember] = true;
      });
      setActiveQA(initial);
    }
  }, [noData, qaData]);

  const combinedTrendData = useMemo(() => {
    return noData ? [] : computeCombinedTrend(qaData, uniqueQAMemberIDs, endDate);
  }, [noData, qaData, uniqueQAMemberIDs, endDate]);

  const { minDomain, maxDomain } = useMemo(() => {
    if (noData || combinedTrendData.length === 0) {
      return { minDomain: 0, maxDomain: 100 };
    }
    let min = Infinity;
    let max = -Infinity;
    combinedTrendData.forEach((point) => {
      uniqueQAMemberIDs.forEach((qaMember) => {
        const val = point[`qa_${qaMember}`];
        if (val < min) min = val;
        if (val > max) max = val;
      });
    });
    return { minDomain: Math.floor(min - 5), maxDomain: Math.ceil(max + 5) };
  }, [noData, combinedTrendData, uniqueQAMemberIDs]);

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
        // Filter snapshots within the selected range
        const snapshotsInRange = snapshots
          .filter((snap) => {
            const t = dayjs.utc(snap.snapshotDate);
            return (
              t.isSameOrAfter(dayjs.utc(startDate)) &&
              t.isSameOrBefore(dayjs.utc(endDate))
            );
          })
          .sort((a, b) => dayjs.utc(a.snapshotDate) - dayjs.utc(b.snapshotDate));
        // Choose the most recent snapshot in the range
        const latestSnapshot =
          snapshotsInRange.length > 0 ? snapshotsInRange[snapshotsInRange.length - 1] : null;
        // Use the snapshot value directly as the measure for the past 7 days.
        const totalCases = latestSnapshot ? latestSnapshot.totalCasesSubmitted : 0;
        const revisionsSentWeek = latestSnapshot ? latestSnapshot.revisionsSent : 0;
        const clientRevisionsWeek = latestSnapshot ? latestSnapshot.clientRevisions : 0;
        const casesPast7Days = totalCases;
        // Estimate 30-day total by multiplying the weekly number by (30/7)
        const casesPast30Days = latestSnapshot ? Math.round(totalCases * (30 / 7)) : 0;
        // For avgCasesDay, retain the computed value (if needed, could also use latestSnapshot.avgCasesDay)
        const workdays = getWorkdays(startDate, endDate);
        const avgCasesDayComputed = workdays > 0 ? totalCases / workdays : 0;
        return {
          qaMember: member.qaMember,
          name: member.name,
          totalCases,
          avgCasesDay: avgCasesDayComputed,
          casesPast7Days,
          casesPast30Days,
          revisionsSentWeek,
          clientRevisionsWeek,
          breakdownByClient: computeClientBreakdown(snapshots, startDate, endDate),
          snapshots
        };
      });
    setReport(result);
  };

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
    const tableRows = report.map((member) => {
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
    autoTable(doc, { head: [tableColumns], body: tableRows, startY: 40 });
    doc.save("qa_metrics_report.pdf");
  };

  const toggleLine = (qaMember) => {
    setActiveQA((prev) => ({ ...prev, [qaMember]: !prev[qaMember] }));
  };

  return (
    <ThemeProvider theme={openSansTheme}>
      <Box
        sx={{
          mt: 4,
          mb: 4,
          backgroundColor: bgColor,
          p: 2,
          borderRadius: 2,
          color: textColor
        }}
      >
        {/* Report Header */}
        <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: bgColor, color: textColor }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: textColor }}>
            QA Metrics Report
          </Typography>
          <Grid container spacing={2}>
            {/* QA Member Filter */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: textColor }}>QA Member</InputLabel>
                <Select
                  value={qaMemberFilter}
                  onChange={(e) => setQaMemberFilter(e.target.value)}
                  label="QA Member"
                  sx={{
                    color: textColor,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: textColor }
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
            {/* Start Date */}
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => {
                    if (newValue && newValue.isValid()) setStartDate(newValue);
                  }}
                  inputFormat="YYYY-MM-DD"
                  renderInput={(params) => (
                    <TextField
                      fullWidth
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        style: { color: textColor }
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        style: { color: textColor }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": { color: textColor }
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            {/* End Date */}
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => {
                    if (newValue && newValue.isValid()) setEndDate(newValue);
                  }}
                  inputFormat="YYYY-MM-DD"
                  renderInput={(params) => (
                    <TextField
                      fullWidth
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        style: { color: textColor }
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        style: { color: textColor }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": { color: textColor }
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={generateReport}
            sx={{ mt: 2, py: 1.2, fontWeight: "bold", fontSize: "1rem" }}
          >
            Generate QA Metrics Report
          </Button>
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
                <Paper
                  key={member.qaMember}
                  sx={{ p: 2, mb: 2, backgroundColor: bgColor, color: textColor }}
                >
                  <Grid container spacing={2}>
                    {/* Left Column: Stats and Bar Chart */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" sx={{ mb: 1, color: textColor }}>
                        QA Member {member.qaMember} – {member.name}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 2, color: textColor }}>
                        Submission Stats
                      </Typography>
                      <List dense>
                        <ListItem>
                          <Tooltip title={`Change: ${avgCasesTrend.change}`}>
                            {avgCasesTrend.arrow === "↑" ? (
                              <ArrowUpwardIcon sx={{ mr: 1, fontSize: 20, color: "green" }} />
                            ) : (
                              <ArrowDownwardIcon sx={{ mr: 1, fontSize: 20, color: "red" }} />
                            )}
                          </Tooltip>
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: "bold", color: textColor }}>
                                Avg Cases/Day: {member.avgCasesDay.toFixed(1)}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={`Cases (Past 7 Days): ${member.casesPast7Days}`}
                            sx={{ color: textColor }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={`Cases (Past 30 Days): ${member.casesPast30Days}`}
                            sx={{ color: textColor }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={`Total Cases Submitted: ${member.totalCases}`}
                            sx={{ color: textColor }}
                          />
                        </ListItem>
                      </List>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 2, color: textColor }}>
                        Revisions / Feedback
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary={`Revisions Sent (Week): ${member.revisionsSentWeek}`}
                            sx={{ color: textColor }}
                          />
                        </ListItem>
                        <ListItem>
                          <Tooltip title={`(Client Revisions / Total Cases) x 100. Trend: ${revisionTrend.change}`}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {revisionTrend.arrow === "↑" ? (
                                <ArrowUpwardIcon
                                  sx={{
                                    mr: 1,
                                    fontSize: 20,
                                    color: currentRevisionRate < 10 ? "green" : "red"
                                  }}
                                />
                              ) : (
                                <ArrowDownwardIcon
                                  sx={{
                                    mr: 1,
                                    fontSize: 20,
                                    color: currentRevisionRate < 10 ? "green" : "red"
                                  }}
                                />
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
                          </Tooltip>
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
                                formatter={(val) => `${val.toFixed(1)} cases/day`}
                                labelFormatter={(label) => `Date: ${label}`}
                              />
                              <Legend />
                              <Bar dataKey="avgCasesDay" fill={baseColors[0]} barSize={30} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Typography sx={{ color: textColor }}>
                          No snapshots in this date range.
                        </Typography>
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
                            <Legend />
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
                    <Collapse in={expandedFeedback[member.qaMember]} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, color: textColor }}>
                          Feedback (in this date range):
                        </Typography>
                        {getSortedFeedback(member.qaMember, startDate.clone(), endDate.clone(), feedbackData).length > 0 ? (
                          <Paper sx={{ overflowX: "auto", backgroundColor: bgColor }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow
                                  sx={{
                                    backgroundColor:
                                      theme.palette.mode === "dark" ? "#555" : "#f5f5f5"
                                  }}
                                >
                                  <TableCell sx={{ minWidth: "120px", color: textColor }}>Reviewer</TableCell>
                                  <TableCell sx={{ minWidth: "120px", color: textColor }}>Date</TableCell>
                                  <TableCell sx={{ color: textColor }}>Client</TableCell>
                                  <TableCell sx={{ minWidth: "120px", color: textColor }}>Feedback</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {getSortedFeedback(member.qaMember, startDate.clone(), endDate.clone(), feedbackData).map(
                                  (fb, idx) => (
                                    <TableRow
                                      key={idx}
                                      sx={{
                                        backgroundColor:
                                          idx % 2 === 0
                                            ? theme.palette.mode === "dark"
                                              ? "#555"
                                              : "#f9f9f9"
                                            : "inherit"
                                      }}
                                    >
                                      <TableCell sx={{ color: textColor }}>{fb.reviewer}</TableCell>
                                      <TableCell sx={{ color: textColor }}>{dayjs(fb.date).format("YYYY-MM-DD")}</TableCell>
                                      <TableCell sx={{ color: textColor }}>{fb.client}</TableCell>
                                      <TableCell sx={{ color: textColor }}>{fb.content}</TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </Paper>
                        ) : (
                          <Typography sx={{ color: textColor }}>No feedback in this date range.</Typography>
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

        {/* Combined Chart Section (Optional) */}
        <Paper sx={{ p: 3, borderRadius: 2, mt: 4, backgroundColor: bgColor, color: textColor }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: textColor }}>
            Combined Avg Cases/Day Trend (Past 30 Days)
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
                    QA Member {qaMember} – {qaInternalMapping[qaMember] || qaMember}
                  </Typography>
                </Box>
              ))}
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedTrendData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={textColor} />
                <YAxis domain={[minDomain, maxDomain]} stroke={textColor} />
                <RechartsTooltip cursor={{ strokeDasharray: "3 3", strokeWidth: 1 }} />
                <Legend />
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
