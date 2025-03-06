// src/QAMetrics.js
import React, { useState, useMemo } from 'react';
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
  Tooltip,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import QAData from './QAData';
import FeedbackData from './FeedbackData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  LabelList,
  LineChart,
  Line,
  Tooltip as LineTooltip,
} from 'recharts';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const openSansTheme = createTheme({
  typography: {
    fontFamily: 'Open Sans, sans-serif',
  },
});

// Helper: Calculate workdays (Mon–Fri) between two dates.
const getWorkdays = (start, end) => {
  let count = 0;
  let current = start.startOf('day');
  const last = end.startOf('day');
  while (current.isBefore(last) || current.isSame(last)) {
    const d = current.day();
    if (d !== 0 && d !== 6) count++;
    current = current.add(1, 'day');
  }
  return count;
};

const baseColors = ["#1E73BE", "#FF8042", "#FFBB28", "#00C49F", "#FF6384", "#36A2EB", "#8A2BE2"];
const barColors = baseColors;

// Helper to compute trend arrow and percentage change.
const getTrend = (current, previous) => {
  if (previous === 0) return { arrow: '-', change: 'N/A' };
  const diff = current - previous;
  const percent = (diff / previous) * 100;
  return {
    arrow: diff >= 0 ? '↑' : '↓',
    change: `${Math.abs(percent).toFixed(1)}%`
  };
};

// Helper to compute sparkline data for a given QA member over the selected date range.
// This simulation uses the member's avgCasesDay with a ±10% random variation.
const computeSparklineData = (member, startDate, endDate) => {
  const nDays = endDate.diff(startDate, 'day') + 1;
  const data = [];
  // Sample every other day to reduce the number of data points.
  for (let i = 0; i < nDays; i++) {
    if (i % 2 !== 0) continue;
    const value = member.avgCasesDay * (1 + (Math.random() * 0.2 - 0.1));
    const date = startDate.add(i, 'day').format('MM-DD');
    data.push({ date, value });
  }
  return data;
};

const QAMetrics = () => {
  const [qaMemberFilter, setQaMemberFilter] = useState('All');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [report, setReport] = useState(null);
  const [expandedFeedback, setExpandedFeedback] = useState({});
  const [activeQA, setActiveQA] = useState(() => {
    const initial = {};
    QAData.forEach(member => {
      initial[member.qaMember] = true;
    });
    return initial;
  });

  const uniqueQAMemberIDs = useMemo(() => Array.from(new Set(QAData.map(item => item.qaMember))), []);
  const uniqueQAMembers = ['All', ...QAData.map(item => `${item.qaMember} - ${item.name}`)];
  const qaColors = useMemo(() => {
    const mapping = {};
    uniqueQAMemberIDs.forEach((id, index) => {
      mapping[id] = baseColors[index % baseColors.length];
    });
    return mapping;
  }, [uniqueQAMemberIDs]);

  // Generate report data.
  // Assumes QAData contains previous period values: prevAvgCasesDay, prevClientRevisionsWeek, prevTotalCases.
  const generateReport = () => {
    const workdays = getWorkdays(startDate, endDate);
    const reportData = QAData
      .filter(member => {
        if (qaMemberFilter !== 'All') {
          return `${member.qaMember} - ${member.name}` === qaMemberFilter;
        }
        return true;
      })
      .map(member => {
        let totalCases;
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
          breakdownByClient: member.breakdownByClient,
        };
      });
    setReport(reportData);
  };

  const exportReportToPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("QA Metrics Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${startDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`, 14, 30);
    const tableColumns = [
      "QA Member",
      "Name",
      "Avg Cases/Day",
      "Cases (7d)",
      "Cases (30d)",
      "Total Cases",
      "Revisions Sent (Week)",
      "Revision Rate (%)"
    ];
    const tableRows = report.map(member => {
      const currentRevisionRate = member.totalCases > 0 ? (member.clientRevisionsWeek / member.totalCases) * 100 : 0;
      return [
        member.qaMember,
        member.name,
        member.avgCasesDay,
        member.casesPast7Days,
        member.casesPast30Days,
        member.totalCases,
        member.clientRevisionsWeek,
        currentRevisionRate.toFixed(1)
      ];
    });
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 40,
    });
    doc.save("qa_metrics_report.pdf");
  };

  const combinedTrendData = useMemo(() => {
    const drifts = {};
    uniqueQAMemberIDs.forEach(qaMember => {
      drifts[qaMember] = Math.random() * 3 - 1.5;
    });
    const data = [];
    // Sample every other day (15 points) for fewer data points.
    for (let i = 0; i < 30; i++) {
      if (i % 2 !== 0) continue;
      const date = dayjs().subtract(29 - i, 'day').format('MMM D');
      const point = { date };
      uniqueQAMemberIDs.forEach(qaMember => {
        const memberObj = QAData.find(x => x.qaMember === qaMember);
        const drift = drifts[qaMember];
        const initial = memberObj.avgCasesDay - drift * 29;
        const value = initial + drift * i;
        point[`qa_${qaMember}`] = Number(value.toFixed(1));
      });
      data.push(point);
    }
    return data;
  }, [uniqueQAMemberIDs]);

  const { minDomain, maxDomain } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    combinedTrendData.forEach(point => {
      uniqueQAMemberIDs.forEach(qaMember => {
        const val = point[`qa_${qaMember}`];
        if (val < min) min = val;
        if (val > max) max = val;
      });
    });
    return { minDomain: Math.floor(min - 10), maxDomain: Math.ceil(max + 10) };
  }, [combinedTrendData, uniqueQAMemberIDs]);

  const toggleLine = (qaMember) => {
    setActiveQA(prev => ({ ...prev, [qaMember]: !prev[qaMember] }));
  };

  const handleToggleFeedback = (qaMember) => {
    setExpandedFeedback(prev => ({
      ...prev,
      [qaMember]: !prev[qaMember],
    }));
  };

  const sortFeedbackByName = (feedbackArray) => {
    return [...feedbackArray].sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <ThemeProvider theme={openSansTheme}>
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Individual QA Metrics Section */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            QA Metrics Report
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>QA Member</InputLabel>
                <Select
                  value={qaMemberFilter}
                  onChange={(e) => setQaMemberFilter(e.target.value)}
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
            sx={{ mt: 3, py: 1.2, fontWeight: 'bold', fontSize: '1rem' }}
          >
            Generate QA Metrics Report
          </Button>

          {report && (
            <Box sx={{ mt: 3 }}>
              {report.map(member => {
                const memberFeedback = FeedbackData.filter(item =>
                  item.qaMember === member.qaMember &&
                  dayjs(item.date).isSameOrAfter(startDate) &&
                  dayjs(item.date).isSameOrBefore(endDate)
                );
                const sortedMemberFeedback = sortFeedbackByName(memberFeedback);
                const currentRevisionRate = member.totalCases > 0 ? (member.clientRevisionsWeek / member.totalCases) * 100 : 0;
                const previousRevisionRate = member.prevTotalCases > 0 ? (member.prevClientRevisionsWeek / member.prevTotalCases) * 100 : 0;
                const revisionTrend = getTrend(currentRevisionRate, previousRevisionRate);
                const avgCasesTrend = getTrend(member.avgCasesDay, member.prevAvgCasesDay);
                const sparklineData = computeSparklineData(member, startDate, endDate);
                return (
                  <Paper key={member.qaMember} sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6">
                          QA Member {member.qaMember} - {member.name}
                        </Typography>
                        <List>
                          <ListItem>
                            <Tooltip title={`Change: ${avgCasesTrend.change}`}>
                              {avgCasesTrend.arrow === '↑' ? (
                                <ArrowUpwardIcon sx={{ mr: 1, fontSize: 20, color: 'green' }} />
                              ) : (
                                <ArrowDownwardIcon sx={{ mr: 1, fontSize: 20, color: 'red' }} />
                              )}
                            </Tooltip>
                            <ListItemText primary={`Avg Cases/Day: ${member.avgCasesDay}`} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary={`Cases (Past 7 Days): ${member.casesPast7Days}`} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary={`Cases (Past 30 Days): ${member.casesPast30Days}`} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary={`Total Cases Submitted: ${member.totalCases}`} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary={`Revisions Sent (Week): ${member.revisionsSentWeek}`} />
                          </ListItem>
                          <ListItem>
                            <Tooltip title={`Revision Rate is calculated as (Client Revisions / Total Cases Submitted) × 100. Trend change: ${revisionTrend.change}`}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {revisionTrend.arrow === '↑' ? (
                                  <ArrowUpwardIcon sx={{ mr: 1, fontSize: 20, color: currentRevisionRate < 10 ? 'green' : 'red' }} />
                                ) : (
                                  <ArrowDownwardIcon sx={{ mr: 1, fontSize: 20, color: currentRevisionRate < 10 ? 'green' : 'red' }} />
                                )}
                                <ListItemText primary={`Revision Rate: ${currentRevisionRate.toFixed(1)}%`} />
                              </Box>
                            </Tooltip>
                          </ListItem>
                        </List>
                        {/* Sparkline for daily submissions with tooltip */}
                        <Tooltip title="Daily Submission Trend: This sparkline shows the estimated daily submissions (with ±10% variation) over the selected period.">
                          <Box sx={{ mt: 2, width: '100%', height: 50 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={sparklineData}>
                                <Line type="monotone" dataKey="value" stroke="#1E73BE" dot={false} strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{
                          height: 380,
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'left',
                          alignItems: 'center'
                        }}>
                          <ResponsiveContainer width="90%" height="80%">
                            <BarChart
                              data={Object.entries(member.breakdownByClient).map(([client, count]) => ({ client, count }))}
                              margin={{ left: 10, right: 10, top: 20, bottom: 10 }}
                              barCategoryGap="20%"
                              barGap={4}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="client" />
                              <YAxis allowDecimals={false} />
                              <RechartsTooltip />
                              <Bar dataKey="count" barSize={30}>
                                <LabelList dataKey="count" position="top" />
                                {Object.entries(member.breakdownByClient).map(([client, c], index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={barColors[index % barColors.length]}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, width: '100%' }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleToggleFeedback(member.qaMember)}
                        sx={{ mb: 1, borderColor: 'green', color: 'green', '&:hover': { borderColor: 'darkgreen', backgroundColor: 'rgba(0,128,0,0.1)' } }}
                      >
                        {expandedFeedback[member.qaMember] ? 'Hide Feedback' : 'Show Feedback'}
                      </Button>
                      <Collapse in={expandedFeedback[member.qaMember]} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 2, width: '100%' }}>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Feedback Given:
                          </Typography>
                          {sortedMemberFeedback.length > 0 ? (
                            <Paper sx={{ overflowX: 'auto', width: '100%' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr>
                                    <th style={{ border: '1px solid #ddd', padding: '8px', minWidth: '120px' }}>Reviewer</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px', minWidth: '120px' }}>Date</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Client</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px', minWidth: '120px' }}>Case ID</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Feedback</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sortedMemberFeedback.map((fb, idx) => (
                                    <tr key={idx}>
                                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{fb.name}</td>
                                      <td style={{ border: '1px solid #ddd', padding: '8px', minWidth: '120px' }}>
                                        {dayjs(fb.date).format('YYYY-MM-DD')}
                                      </td>
                                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{fb.client}</td>
                                      <td style={{ border: '1px solid #ddd', padding: '8px', minWidth: '120px' }}>{fb.caseID}</td>
                                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{fb.text}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </Paper>
                          ) : (
                            <Typography>No feedback available for this period.</Typography>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  </Paper>
                );
              })}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button variant="contained" color="secondary" onClick={exportReportToPDF}>
                  Export QA Metrics to PDF
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Combined Trend Chart Section for All QA Members */}
        <Paper sx={{ p: 3, borderRadius: 2, mt: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Combined Avg Cases/Day Trend (Past 30 Days)
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <Box sx={{ mr: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Legend
              </Typography>
              {uniqueQAMemberIDs.map(qaMember => (
                <Box
                  key={qaMember}
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 1 }}
                  onClick={() => toggleLine(qaMember)}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: qaColors[qaMember],
                      opacity: activeQA[qaMember] ? 1 : 0.1,
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2" sx={{ opacity: activeQA[qaMember] ? 1 : 0.3 }}>
                    QA Member {qaMember} - {QAData.find(m => m.qaMember === qaMember)?.name}
                  </Typography>
                </Box>
              ))}
            </Box>

            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={combinedTrendData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[minDomain, maxDomain]} />
                <LineTooltip cursor={{ strokeDasharray: '3 3', strokeWidth: 1 }} />
                {uniqueQAMemberIDs.map(qaMember => (
                  <Line
                    key={qaMember}
                    type="monotone"
                    dataKey={`qa_${qaMember}`}
                    stroke={qaColors[qaMember]}
                    strokeWidth={3}
                    // More transparent when unselected.
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
};

export default QAMetrics;
