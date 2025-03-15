// src/Reports.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Tooltip,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel
} from '@mui/material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Fallback theme
const openSansTheme = createTheme({
  typography: { fontFamily: 'Open Sans, sans-serif' },
});

// ---------- QA Member Mapping for Internal Feedback ----------
const qaInternalMapping = {
  202: "Jane QA",
  204: "Emily QA",
  206: "Sophia QA",
  208: "Laura QA",
  210: "Catherine QA",
  212: "Fiona QA"
};

// ---------- COLORS for charts ----------
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

// ---------- Helper: Extract unique clients from the dataset ----------
const getUniqueClients = (reviewerData) => {
  const clientSet = new Set();
  reviewerData.forEach(item => {
    item.clients.split(',').map(c => c.trim()).forEach(client => clientSet.add(client));
  });
  return ['All Clients', ...Array.from(clientSet).sort()];
};

// ---------- Sorting Helpers ----------
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
function stableSort(array, comparator) {
  const stabilizedArray = array.map((el, idx) => [el, idx]);
  stabilizedArray.sort((a, b) => {
    const orderResult = comparator(a[0], b[0]);
    if (orderResult !== 0) return orderResult;
    return a[1] - b[1];
  });
  return stabilizedArray.map((el) => el[0]);
}

// ---------- Custom dot renderer for quality trend graph ----------
const renderCustomDot = (props) => {
  const { cx, cy, value } = props;
  let fillColor = 'red';
  if (value >= 90) fillColor = 'green';
  else if (value >= 80) fillColor = 'yellow';
  return <circle cx={cx} cy={cy} r={4} fill={fillColor} />;
};

// ---------- CSV Export ----------
const exportReportCSV = (reportResult, clientBreakdown, selectedReviewer, lateTrend) => {
  if (reportResult && Object.keys(clientBreakdown).length > 0) {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (selectedReviewer !== 'All Reviewers') {
      csvContent += `Reviewer,${selectedReviewer}\n`;
    }
    csvContent += `Total Estimated Cases,${Math.round(reportResult.totalCases)}\n`;
    csvContent += `Total Revision Requests,${Math.round(reportResult.revisionRequests)}\n`;
    csvContent += `Revision Percentage,${reportResult.revisionPercentage}%\n`;
    csvContent += `Average Late %,${lateTrend.length > 0 ? lateTrend[0].latePercentage.toFixed(1) : 'N/A'}%\n\n`;
    csvContent += 'Client,Estimated Cases,Estimated Revisions,Revision Rate (%)\n';
    for (const [client, totals] of Object.entries(clientBreakdown)) {
      const rate = totals.totalCases > 0
        ? ((totals.totalRevisions / totals.totalCases) * 100).toFixed(2)
        : '0.00';
      csvContent += `${client},${Math.round(totals.totalCases)},${Math.round(totals.totalRevisions)},${rate}\n`;
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'cases_revisions_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// ---------- PDF Export ----------
const exportReportPDF = (reportResult, clientBreakdown, selectedReviewer, startDate, endDate, lateTrend) => {
  if (reportResult && Object.keys(clientBreakdown).length > 0) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Cases / Revisions Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}`, 14, 30);
    if (selectedReviewer !== 'All Reviewers') {
      doc.text(`Reviewer: ${selectedReviewer}`, 14, 40);
      doc.text(`Total Estimated Cases: ${Math.round(reportResult.totalCases)}`, 14, 50);
      doc.text(`Total Revision Requests: ${Math.round(reportResult.revisionRequests)}`, 14, 60);
      doc.text(`Revision Percentage: ${reportResult.revisionPercentage}%`, 14, 70);
    } else {
      doc.text(`Total Estimated Cases: ${Math.round(reportResult.totalCases)}`, 14, 40);
      doc.text(`Total Revision Requests: ${Math.round(reportResult.revisionRequests)}`, 14, 50);
      doc.text(`Revision Percentage: ${reportResult.revisionPercentage}%`, 14, 60);
    }
    doc.text(
      `Average Late %: ${lateTrend.length > 0 ? lateTrend[0].latePercentage.toFixed(1) : 'N/A'}%`,
      14,
      selectedReviewer !== 'All Reviewers' ? 80 : 70
    );
    const tableColumn = ['Client', 'Estimated Cases', 'Estimated Revisions', 'Revision Rate (%)'];
    const tableRows = [];
    for (const [client, totals] of Object.entries(clientBreakdown)) {
      const rate = totals.totalCases > 0
        ? ((totals.totalRevisions / totals.totalCases) * 100).toFixed(2)
        : '0.00';
      tableRows.push([client, Math.round(totals.totalCases), Math.round(totals.totalRevisions), rate]);
    }
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: selectedReviewer !== 'All Reviewers' ? 90 : 80,
    });
    const finalY = doc.lastAutoTable.finalY || 30;
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Summary: Avg Cases/Day: ${reportResult.avgCasesPerDay}, Late %: ${
        lateTrend.length > 0 ? lateTrend[0].latePercentage.toFixed(1) : 'N/A'
      }%, Revision Rate: ${reportResult.revisionPercentage}%, Quality Score: ${reportResult.qualityScore}%`,
      14,
      finalY + 10
    );
    doc.setFontSize(10);
    doc.text('Feedback column not fully represented in PDF export.', 14, finalY + 16);
    doc.save('cases_revisions_report.pdf');
  }
};

// ---------- Helper to get the latest snapshot for a reviewer up to the selected end date ----------
const getLatestSnapshot = (reviewer, endDate) => {
  const snapshots = reviewer.snapshots.filter(snap => dayjs(snap.snapshotDate).isSameOrBefore(endDate));
  if (snapshots.length === 0) return null;
  snapshots.sort((a, b) => dayjs(b.snapshotDate).valueOf() - dayjs(a.snapshotDate).valueOf());
  return snapshots[0];
};

const Reports = ({ reviewerData, feedbackData }) => {
  const location = useLocation();
  const theme = useTheme();
  const textColor = theme.palette.mode === 'dark' ? '#fff' : '#000';
  const backgroundColor = theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9';

  const locationParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // State variables
  const [selectedReviewer, setSelectedReviewer] = useState('All Reviewers');
  const [selectedClient, setSelectedClient] = useState('All Clients');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [tabValue, setTabValue] = useState(0); // 0: Cases/Revisions, 1: Feedback
  const [selectedFeedbackType, setSelectedFeedbackType] = useState('client');
  const [clientComments, setClientComments] = useState({});
  const [internalFeedback, setInternalFeedback] = useState([]);
  const [reportResult, setReportResult] = useState(null);
  const [clientBreakdown, setClientBreakdown] = useState({});
  const [qualityTrend, setQualityTrend] = useState([]);
  const [lateTrend, setLateTrend] = useState([]);
  const [internalOrder, setInternalOrder] = useState('asc');
  const [internalOrderBy, setInternalOrderBy] = useState('name');
  const [shouldAutoGenerate, setShouldAutoGenerate] = useState(false);

  const allReviewers = [...new Set(reviewerData.map(item => item.name))].sort();
  const uniqueClients = getUniqueClients(reviewerData);

  // Generate Report
  const handleGenerateReport = useCallback(() => {
    if (tabValue === 1) {
      // -- Feedback Report --
      let filteredFeedback = feedbackData.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isSameOrAfter(startDate) && itemDate.isSameOrBefore(endDate);
      });

      // Filter by reviewer
      let reviewerFeedback =
        selectedReviewer !== 'All Reviewers'
          ? filteredFeedback.filter(item => item.reviewer === selectedReviewer)
          : filteredFeedback;

      // Filter by client
      if (selectedClient !== 'All Clients') {
        reviewerFeedback = reviewerFeedback.filter(item => item.client === selectedClient);
      }

      if (selectedFeedbackType === 'client') {
        // For client feedback, group by client -> then by the actual reviewer name
        const groupedFeedback = {};
        reviewerFeedback
          .filter(item => item.feedbackType === 'client')
          .forEach(item => {
            const client = item.client || 'Unknown Client';
            const reviewerName = item.reviewer;
            if (!groupedFeedback[client]) {
              groupedFeedback[client] = {};
            }
            if (!groupedFeedback[client][reviewerName]) {
              groupedFeedback[client][reviewerName] = [];
            }
            groupedFeedback[client][reviewerName].push({
              text: item.content,
              caseID: item.caseID,
            });
          });

        // Sort the keys for each client
        const sortedGroupedFeedback = {};
        Object.keys(groupedFeedback).forEach(client => {
          const sortedReviewers = Object.keys(groupedFeedback[client]).sort();
          sortedGroupedFeedback[client] = {};
          sortedReviewers.forEach(reviewer => {
            sortedGroupedFeedback[client][reviewer] = groupedFeedback[client][reviewer];
          });
        });

        setClientComments(sortedGroupedFeedback);
        setInternalFeedback([]);
      } else {
        // Internal feedback
        const internal = reviewerFeedback.filter(item => item.feedbackType === 'internal');
        setClientComments({});
        setInternalFeedback(internal);
        setInternalOrderBy('reviewer');
        setInternalOrder('asc');
      }

      // Clear out the Cases/Revisions data
      setReportResult(null);
      setClientBreakdown({});
      setQualityTrend([]);
      setLateTrend([]);
    } else {
      // -- Cases/Revisions Report --
      const periodDays = endDate.diff(startDate, 'day') + 1;
      let filteredFLData =
        selectedReviewer !== 'All Reviewers'
          ? reviewerData.filter(item => item.name === selectedReviewer)
          : reviewerData;

      if (selectedClient !== 'All Clients') {
        filteredFLData = filteredFLData.filter(item =>
          item.clients.split(',').map(c => c.trim()).includes(selectedClient)
        );
      }

      let overallTotalCases = 0;
      let overallRevisionRequests = 0;
      const breakdown = {};

      filteredFLData.forEach(item => {
        const snapshot = getLatestSnapshot(item, endDate);
        if (!snapshot) return;
        const estimatedCases = snapshot.avgCasesDay * periodDays;
        const estimatedRevisions = (snapshot.clientRevisionsMonth / 20) * periodDays;

        overallTotalCases += estimatedCases;
        overallRevisionRequests += estimatedRevisions;

        const clients = item.clients.split(',').map(c => c.trim());
        clients.forEach(client => {
          if (!breakdown[client]) {
            breakdown[client] = { totalCases: 0, totalRevisions: 0 };
          }
          breakdown[client].totalCases += estimatedCases;
          breakdown[client].totalRevisions += estimatedRevisions;
        });
      });

      const overallRevisionPercentage =
        overallTotalCases > 0
          ? ((overallRevisionRequests / overallTotalCases) * 100).toFixed(2)
          : '0.00';

      const latePercentages = filteredFLData.map(item => {
        const snap = getLatestSnapshot(item, endDate);
        return snap ? snap.lateCasePercentage : 0;
      });
      const overallLatePercentage =
        latePercentages.reduce((sum, val) => sum + val, 0) / (latePercentages.length || 1);

      const qualityScores = filteredFLData.map(item => {
        const snap = getLatestSnapshot(item, endDate);
        return snap ? snap.qualityScore : 0;
      });
      const overallQualityScore =
        qualityScores.reduce((a, b) => a + b, 0) / (qualityScores.length || 1);

      setReportResult({
        totalCases: overallTotalCases,
        revisionRequests: overallRevisionRequests,
        revisionPercentage: overallRevisionPercentage,
        periodDays,
        avgCasesPerDay: (overallTotalCases / periodDays).toFixed(1),
        qualityScore: overallQualityScore.toFixed(1),
      });

      setClientBreakdown(breakdown);

      // Build Quality Trend array
      const qualityTrendData = [];
      for (let d = 0; d < periodDays; d++) {
        const currentDate = dayjs(startDate).add(d, 'day').format('YYYY-MM-DD');
        qualityTrendData.push({
          date: currentDate,
          qualityScore: overallQualityScore,
        });
      }
      setQualityTrend(qualityTrendData);

      // Build Late Trend array
      const lateTrendData = [];
      for (let d = 0; d < periodDays; d++) {
        const currentDate = dayjs(startDate).add(d, 'day').format('YYYY-MM-DD');
        lateTrendData.push({
          date: currentDate,
          latePercentage: overallLatePercentage,
        });
      }
      setLateTrend(lateTrendData);

      // Clear out feedback
      setClientComments({});
      setInternalFeedback([]);
    }
  }, [
    tabValue,
    feedbackData,
    reviewerData,
    selectedReviewer,
    selectedClient,
    startDate,
    endDate,
    selectedFeedbackType
  ]);

  useEffect(() => {
    const reviewerParam = locationParams.get('reviewer');
    const startDateParam = locationParams.get('startDate');
    const endDateParam = locationParams.get('endDate');
    const feedbackTypeParam = locationParams.get('feedbackType');
    const reportTypeParam = locationParams.get('reportType');

    if (reviewerParam && reviewerParam !== 'All Reviewers') {
      setSelectedReviewer(reviewerParam);
    }
    if (startDateParam) setStartDate(dayjs(startDateParam));
    if (endDateParam) setEndDate(dayjs(endDateParam));

    if (feedbackTypeParam) {
      setTabValue(1);
      setSelectedFeedbackType(feedbackTypeParam === 'internal' ? 'qa' : feedbackTypeParam);
      setShouldAutoGenerate(true);
    }
    if (reportTypeParam && reportTypeParam === 'Cases/Revisions') {
      setTabValue(0);
      setShouldAutoGenerate(true);
    }
  }, [locationParams]);

  useEffect(() => {
    const reportTypeParam = locationParams.get('reportType');
    if (reportTypeParam === 'Cases/Revisions' && !reportResult && shouldAutoGenerate) {
      handleGenerateReport();
      setShouldAutoGenerate(false);
    }
  }, [locationParams, reportResult, shouldAutoGenerate, handleGenerateReport]);

  // Pie chart data for client breakdown
  const chartData = Object.entries(clientBreakdown).map(([client, totals]) => ({
    name: client,
    value: Math.round(totals.totalCases),
  }));

  return (
    <ThemeProvider theme={openSansTheme}>
      <Box sx={{ mt: 4, mb: 4, color: textColor, backgroundColor, p: 2, borderRadius: 2 }}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 3,
            backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#fff',
            color: textColor
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: textColor }}>
            MRA Reports
          </Typography>

          <Grid container spacing={2}>
            {/* Reviewer Selector */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl
                fullWidth
                sx={{
                  '& .MuiSvgIcon-root': { color: textColor }
                }}
              >
                <InputLabel sx={{ color: textColor, '&.Mui-focused': { color: textColor } }}>
                  Reviewer
                </InputLabel>
                <Select
                  value={selectedReviewer}
                  onChange={(e) => setSelectedReviewer(e.target.value)}
                  label="Reviewer"
                  sx={{
                    color: textColor,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                    '& .MuiSelect-icon': { color: textColor },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: theme.palette.mode === 'dark' ? '#424242' : '#fff',
                        '& .MuiMenuItem-root': { color: textColor }
                      }
                    }
                  }}
                >
                  <MenuItem value="All Reviewers" sx={{ color: textColor }}>
                    All Reviewers
                  </MenuItem>
                  {allReviewers.map((rev) => (
                    <MenuItem key={rev} value={rev} sx={{ color: textColor }}>
                      {rev}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Client Selector */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl
                fullWidth
                sx={{
                  '& .MuiSvgIcon-root': { color: textColor }
                }}
              >
                <InputLabel sx={{ color: textColor, '&.Mui-focused': { color: textColor } }}>
                  Client
                </InputLabel>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  label="Client"
                  sx={{
                    color: textColor,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                    '& .MuiSelect-icon': { color: textColor },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: theme.palette.mode === 'dark' ? '#424242' : '#fff',
                        '& .MuiMenuItem-root': { color: textColor }
                      }
                    }
                  }}
                >
                  {uniqueClients.map((client) => (
                    <MenuItem key={client} value={client} sx={{ color: textColor }}>
                      {client}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': { color: textColor },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                        '& .MuiFormLabel-root': { color: textColor },
                        '& .MuiFormLabel-root.Mui-focused': { color: textColor },
                        '& input': { color: textColor },
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* End Date */}
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': { color: textColor },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                        '& .MuiFormLabel-root': { color: textColor },
                        '& .MuiFormLabel-root.Mui-focused': { color: textColor },
                        '& input': { color: textColor },
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          {/* Tabs for toggling between Cases/Revisions and Feedback */}
          <Box sx={{ mt: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              textColor="inherit"
              sx={{
                '& .MuiTab-root': { color: textColor },
                '& .Mui-selected': { color: textColor },
                '& .MuiTabs-indicator': { backgroundColor: textColor }
              }}
            >
              <Tab label="Cases / Revisions" />
              <Tab label="Feedback" />
            </Tabs>
          </Box>

          {tabValue === 1 && (
            <Box sx={{ mt: 2 }}>
              <FormControl
                fullWidth
                sx={{
                  '& .MuiSvgIcon-root': { color: textColor }
                }}
              >
                <InputLabel sx={{ color: textColor, '&.Mui-focused': { color: textColor } }}>
                  Feedback Type
                </InputLabel>
                <Select
                  value={selectedFeedbackType}
                  onChange={(e) => setSelectedFeedbackType(e.target.value)}
                  label="Feedback Type"
                  sx={{
                    color: textColor,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: textColor },
                    '& .MuiSelect-icon': { color: textColor },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: theme.palette.mode === 'dark' ? '#424242' : '#fff',
                        '& .MuiMenuItem-root': { color: textColor }
                      }
                    }
                  }}
                >
                  <MenuItem value="client" sx={{ color: textColor }}>Client</MenuItem>
                  <MenuItem value="qa" sx={{ color: textColor }}>Internal</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateReport}
            sx={{ mt: 3, py: 1.2, fontWeight: 'bold', fontSize: '1rem' }}
          >
            Generate Report
          </Button>
        </Paper>

        {/* ---- CASES / REVISIONS TAB CONTENT ---- */}
        {tabValue === 0 && reportResult && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: textColor }}>
              Report Results
            </Typography>
            <Typography sx={{ color: textColor }}>
              Total Estimated Cases (over {reportResult.periodDays} days): {Math.round(reportResult.totalCases)}
            </Typography>
            <Typography sx={{ color: textColor }}>
              Total Revision Requests: {Math.round(reportResult.revisionRequests)}{' '}
              <span title={`Revision Rate: ${reportResult.revisionPercentage}%`}>
                (Revision Rate: {reportResult.revisionPercentage}%)
              </span>
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {/* Client Breakdown */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: textColor }}>
                  Breakdown by Client
                </Typography>
                <List>
                  {Object.entries(clientBreakdown).map(([client, totals]) => {
                    const rate = totals.totalCases > 0
                      ? ((totals.totalRevisions / totals.totalCases) * 100).toFixed(2)
                      : '0.00';
                    return (
                      <ListItem key={client} disablePadding>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: 'bold', color: textColor }}>
                              {client}: {Math.round(totals.totalCases)} cases, {Math.round(totals.totalRevisions)} revisions (Rate: {rate}%)
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>

              {/* Pie Chart for Client Breakdown */}
              <Grid item xs={12} md={6}>
                <Box sx={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 40 }}>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        label
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>

            {/* Quality Score */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: textColor }}>
                Overall Quality Score:{' '}
                {Math.round(
                  (reviewerData
                    .filter(item =>
                      (selectedReviewer === 'All Reviewers' || item.name === selectedReviewer) &&
                      (selectedClient === 'All Clients' ||
                        item.clients.split(',').map(c => c.trim()).includes(selectedClient))
                    )
                    .map(item => {
                      const snap = getLatestSnapshot(item, endDate);
                      return snap ? snap.qualityScore : 0;
                    })
                    .reduce((a, b) => a + b, 0) /
                    reviewerData.filter(item =>
                      (selectedReviewer === 'All Reviewers' || item.name === selectedReviewer) &&
                      (selectedClient === 'All Clients' ||
                        item.clients.split(',').map(c => c.trim()).includes(selectedClient))
                    ).length) || 0
                )}
              </Typography>
            </Box>

            {/* Quality Trend */}
            {qualityTrend.length > 0 && (
              <Box sx={{ mt: 2, height: 300 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: textColor }}>
                  Quality Score Trend
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qualityTrend} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM D')} stroke={textColor} />
                    <YAxis
                      domain={[0, 100]}
                      label={{ value: 'Quality Score', angle: -90, position: 'insideLeft', offset: -10, fill: textColor }}
                      stroke={textColor}
                    />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="qualityScore" name="Quality Score" dot={renderCustomDot} stroke="#00C49F" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Late % */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: textColor }}>
                Average Late %:{' '}
                {lateTrend.length > 0 ? lateTrend[0].latePercentage.toFixed(1) : 'N/A'}%
              </Typography>
            </Box>
            {lateTrend.length > 0 && (
              <Box sx={{ mt: 2, height: 300 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: textColor }}>
                  Late % Trend{' '}
                  <Tooltip title="Change in late percentage" arrow>
                    <span style={{ cursor: 'default' }}>▼ or ▲</span>
                  </Tooltip>
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lateTrend} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM D')} stroke={textColor} />
                    <YAxis
                      label={{ value: 'Late %', angle: -90, position: 'insideLeft', offset: -10, fill: textColor }}
                      stroke={textColor}
                    />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="latePercentage" stroke="#FFB74D" name="Late %" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* CSV / PDF Export Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() =>
                  exportReportCSV(reportResult, clientBreakdown, selectedReviewer, lateTrend)
                }
              >
                Export as CSV
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() =>
                  exportReportPDF(reportResult, clientBreakdown, selectedReviewer, startDate, endDate, lateTrend)
                }
              >
                Export as PDF
              </Button>
            </Box>
          </Box>
        )}

        {/* ---- FEEDBACK TAB CONTENT ---- */}
        {tabValue === 1 && (
          <Box sx={{ mt: 3, backgroundColor, p: 2, borderRadius: 2 }}>
            {selectedFeedbackType === 'client' ? (
              <Box>
                {Object.entries(clientComments).map(([client, reviewerFeedbackObj]) => {
                  // Flatten for "COPY" button
                  const copyText = Object.values(reviewerFeedbackObj)
                    .flat()
                    .map(feedback => feedback.text)
                    .join('\n');

                  return (
                    <Box key={client} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: theme.palette.mode === 'dark' ? '#616161' : '#f0f0f0',
                          p: 1,
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: textColor }}>
                          {client}:
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: '#9c27b0',
                            color: '#9c27b0',
                            '&:hover': { backgroundColor: '#9c27b0', color: '#fff' }
                          }}
                          onClick={() => navigator.clipboard.writeText(copyText)}
                        >
                          COPY
                        </Button>
                      </Box>
                      {Object.keys(reviewerFeedbackObj).sort().map((reviewer) => {
                        const feedbackArray = Array.isArray(reviewerFeedbackObj[reviewer])
                          ? reviewerFeedbackObj[reviewer]
                          : [];
                        return (
                          <Box
                            key={reviewer}
                            sx={{
                              ml: 2,
                              mt: 1,
                              mb: 1,
                              p: 1,
                              borderLeft: '2px solid #ccc',
                              color: textColor
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {reviewer}:
                            </Typography>
                            <List dense>
                              {feedbackArray.map((feedback, i) => (
                                <ListItem key={i} disablePadding>
                                  <ListItemText
                                    primary={`Case ID: ${feedback.caseID} – ${feedback.text}`}
                                    sx={{ color: textColor }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: textColor }}>
                  Internal Feedback
                </Typography>
                {internalFeedback.length === 0 ? (
                  <Typography sx={{ color: textColor }}>
                    No internal QA feedback available for the selected period.
                  </Typography>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: '#4caf50',
                          color: '#4caf50',
                          '&:hover': { backgroundColor: '#4caf50', color: '#fff' }
                        }}
                        onClick={() => {
                          const allFeedbackText = internalFeedback.map(item => item.content).join('\n');
                          navigator.clipboard.writeText(allFeedbackText);
                        }}
                      >
                        Copy All Internal Feedback
                      </Button>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: '#1976D2',
                          color: '#1976D2',
                          '&:hover': { backgroundColor: '#1976D2', color: '#fff' }
                        }}
                        onClick={() => {
                          const isAsc = internalOrderBy === 'qaMember' && internalOrder === 'asc';
                          setInternalOrder(isAsc ? 'desc' : 'asc');
                          setInternalOrderBy('qaMember');
                        }}
                      >
                        Sort by QA Member
                      </Button>
                    </Box>
                    <Table sx={{ border: '1px solid #ddd' }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? '#616161' : '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold', color: textColor }}>
                            <TableSortLabel
                              active={internalOrderBy === 'reviewer'}
                              direction={internalOrderBy === 'reviewer' ? internalOrder : 'asc'}
                              onClick={() => {
                                const isAsc = internalOrderBy === 'reviewer' && internalOrder === 'asc';
                                setInternalOrder(isAsc ? 'desc' : 'asc');
                                setInternalOrderBy('reviewer');
                              }}
                            >
                              Reviewer
                            </TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: textColor }}>
                            <TableSortLabel
                              active={internalOrderBy === 'qaMember'}
                              direction={internalOrderBy === 'qaMember' ? internalOrder : 'asc'}
                              onClick={() => {
                                const isAsc = internalOrderBy === 'qaMember' && internalOrder === 'asc';
                                setInternalOrder(isAsc ? 'desc' : 'asc');
                                setInternalOrderBy('qaMember');
                              }}
                            >
                              QA Member
                            </TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: textColor }}>
                            Feedback Details
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: textColor }}>
                            Copy Feedback
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stableSort(internalFeedback, getComparator(internalOrder, internalOrderBy)).map((item, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              backgroundColor:
                                index % 2 === 0
                                  ? theme.palette.mode === 'dark'
                                    ? '#555'
                                    : '#f9f9f9'
                                  : 'inherit'
                            }}
                          >
                            <TableCell sx={{ verticalAlign: 'top', color: textColor }}>
                              {item.reviewer}
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top', color: textColor }}>
                              {qaInternalMapping[Number(item.qaMember)] || item.qaMember}
                            </TableCell>
                            <TableCell sx={{ color: textColor }}>
                              <Paper variant="outlined" sx={{ p: 1, bgcolor: theme.palette.mode === 'dark' ? '#616161' : '#fafafa' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: textColor }}>
                                  {`Date: ${dayjs(item.date).format('YYYY-MM-DD')}\nClient: ${item.client}\nCase ID: ${item.caseID}\nFeedback: ${item.content}`}
                                </Typography>
                              </Paper>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                  borderColor: '#4caf50',
                                  color: '#4caf50',
                                  '&:hover': { backgroundColor: '#4caf50', color: '#fff' }
                                }}
                                onClick={() => navigator.clipboard.writeText(item.content)}
                              >
                                Copy
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Reports;
