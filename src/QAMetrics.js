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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import QAData from './QAData';
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

// Create a theme that uses Open Sans.
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

// Define base colors.
const baseColors = ["#1E73BE", "#FF8042", "#FFBB28", "#00C49F", "#FF6384", "#36A2EB", "#8A2BE2"];
// We'll use these for both bar charts and trend lines.
const barColors = baseColors;

const QAMetrics = () => {
  // Filters for individual QA Metrics section.
  const [qaMemberFilter, setQaMemberFilter] = useState('All');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [report, setReport] = useState(null);

  // State for toggling active QA member lines in the combined chart.
  const [activeQA, setActiveQA] = useState(() => {
    const initial = {};
    QAData.forEach(member => {
      initial[member.qaMember] = true;
    });
    return initial;
  });

  // Build unique QA Member IDs from QAData.
  const uniqueQAMemberIDs = useMemo(() => {
    return Array.from(new Set(QAData.map(item => item.qaMember)));
  }, []);

  // Build dropdown options: "All" + each "qaMember - name"
  const uniqueQAMembers = ['All', ...QAData.map(item => `${item.qaMember} - ${item.name}`)];

  // Create color mapping for unique QA members.
  const qaColors = useMemo(() => {
    const mapping = {};
    uniqueQAMemberIDs.forEach((id, index) => {
      mapping[id] = baseColors[index % baseColors.length];
    });
    return mapping;
  }, [uniqueQAMemberIDs]);

  // Generate individual QA Metrics report.
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
          casesPast60Days: member.casesPast60Days,
          revisionsSentWeek: member.revisionsSentWeek,
          breakdownByClient: member.breakdownByClient,
        };
      });
    setReport(reportData);
  };

  // Export individual QA Metrics report to PDF.
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
      "Cases (60d)",
      "Revisions Sent (Week)",
      "Total Cases Submitted"
    ];
    const tableRows = report.map(member => [
      member.qaMember,
      member.name,
      member.avgCasesDay,
      member.casesPast7Days,
      member.casesPast30Days,
      member.casesPast60Days,
      member.revisionsSentWeek,
      member.totalCases,
    ]);
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 40,
    });
    doc.save("qa_metrics_report.pdf");
  };

  // Combined Trend Data for All QA Members over the past 30 days.
  const combinedTrendData = useMemo(() => {
    const drifts = {};
    uniqueQAMemberIDs.forEach(qaMember => {
      // Larger drift range so lines differ more.
      drifts[qaMember] = Math.random() * 3 - 1.5; // drift between -1.5 and +1.5
    });
    const data = [];
    for (let i = 0; i < 30; i++) {
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

  // Compute overall Y-axis domain for the combined trend chart.
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

  // Handler to toggle line opacity in the combined chart via the legend.
  const toggleLine = (qaMember) => {
    setActiveQA(prev => ({ ...prev, [qaMember]: !prev[qaMember] }));
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
              {report.map(member => (
                <Paper key={member.qaMember} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    {/* Left: Data List */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">
                        QA Member {member.qaMember} - {member.name}
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText primary={`Avg Cases/Day: ${member.avgCasesDay}`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary={`Cases (Past 7 Days): ${member.casesPast7Days}`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary={`Cases (Past 30 Days): ${member.casesPast30Days}`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary={`Cases (Past 60 Days): ${member.casesPast60Days}`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary={`Revisions Sent (Week): ${member.revisionsSentWeek}`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary={`Total Cases Submitted: ${member.totalCases}`} />
                        </ListItem>
                      </List>
                    </Grid>
                    {/* Right: Bar Chart for Cases by Client */}
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
                </Paper>
              ))}

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
            {/* Custom Legend */}
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
                    strokeOpacity={activeQA[qaMember] ? 1 : 0.3}
                    dot={{ r: 1 }}
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
