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
  TableSortLabel,
  Avatar,
  Divider
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
import html2canvas from 'html2canvas';
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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import profilePics from './profilePics';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// ---------- THEME ----------
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

// ---------- COLORS for charts and accents ----------
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];
const accentGreen = '#4CAF50';
const accentRed = '#F44336';

// ---------- Helper: Extract unique clients ----------
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

// ---------- Custom dot for quality trend graph ----------
const renderCustomDot = (props) => {
  const { cx, cy, value } = props;
  let fillColor = 'red';
  if (value >= 90) fillColor = 'green';
  else if (value >= 80) fillColor = 'yellow';
  return <circle cx={cx} cy={cy} r={4} fill={fillColor} />;
};

// ---------- Export as PDF using html2canvas ----------
const exportReportAsImagePDF = () => {
  const input = document.getElementById('reportContainer');
  if (!input) return;
  html2canvas(input, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('report.pdf');
  });
};

// ---------- Helper to get the latest snapshot for a reviewer ----------
const getLatestSnapshot = (reviewer, endDate) => {
  const snapshots = reviewer.snapshots.filter(snap => dayjs(snap.snapshotDate).isSameOrBefore(endDate));
  if (snapshots.length === 0) return null;
  snapshots.sort((a, b) => dayjs(b.snapshotDate).valueOf() - dayjs(a.snapshotDate).valueOf());
  return snapshots[0];
};

// ---------- Helper to down-sample trend data ----------
const sampleTrend = (data, targetPoints = 10) => {
  if (data.length <= targetPoints) {
    return data.map(point => ({
      ...point,
      qualityScore: point.qualityScore !== undefined ? Number(point.qualityScore.toFixed(1)) : undefined,
      latePercentage: point.latePercentage !== undefined ? Number(point.latePercentage.toFixed(1)) : undefined
    }));
  }
  const sampled = [];
  const step = (data.length - 1) / (targetPoints - 1);
  for (let i = 0; i < targetPoints; i++) {
    const idx = Math.floor(i * step);
    const point = data[idx];
    if (point.qualityScore !== undefined) {
      sampled.push({ date: point.date, qualityScore: Number(point.qualityScore.toFixed(1)) });
    } else if (point.latePercentage !== undefined) {
      sampled.push({ date: point.date, latePercentage: Number(point.latePercentage.toFixed(1)) });
    }
  }
  return sampled;
};

// ---------- Hook to compute overall metrics for comparisons ----------
const useOverallMetrics = (reviewerData, selectedClient, endDate) => {
  return useMemo(() => {
    const filtered = reviewerData.filter(item =>
      selectedClient === 'All Clients' ||
      item.clients.split(',').map(c => c.trim()).includes(selectedClient)
    );
    let totalCases = 0, qualityTotal = 0, revisionTotal = 0, lateTotal = 0, count = 0;
    filtered.forEach(item => {
      const snap = getLatestSnapshot(item, endDate);
      if (snap) {
        if (snap.avgCasesDay !== undefined) { totalCases += snap.avgCasesDay; }
        if (snap.qualityScore !== undefined) { qualityTotal += snap.qualityScore; }
        if (snap.revisionRate !== undefined) { revisionTotal += snap.revisionRate; }
        if (snap.lateCasePercentage !== undefined) { lateTotal += snap.lateCasePercentage; }
        count++;
      }
    });
    return {
      avgCases: count ? totalCases / count : 0,
      avgQuality: count ? qualityTotal / count : 0,
      avgRevision: count ? revisionTotal / count : 0,
      avgLate: count ? lateTotal / count : 0,
    };
  }, [reviewerData, selectedClient, endDate]);
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

  // Overall metrics for comparisons
  const overallMetrics = useOverallMetrics(reviewerData, selectedClient, endDate);

  // If a single reviewer is selected, get reviewer info and snapshot
  const reviewerInfo = selectedReviewer !== 'All Reviewers'
    ? reviewerData.find(item => item.name === selectedReviewer)
    : null;
  const reviewerSnapshot = reviewerInfo ? getLatestSnapshot(reviewerInfo, endDate) : null;
  const reviewerAvgCases = reviewerSnapshot ? reviewerSnapshot.avgCasesDay : 0;
  const reviewerQualityScore = reviewerSnapshot ? reviewerSnapshot.qualityScore : 0;
  const reviewerRevisionRate = reviewerSnapshot ? reviewerSnapshot.revisionRate || 0 : 0;
  const reviewerLatePercentage = reviewerSnapshot ? reviewerSnapshot.lateCasePercentage || 0 : 0;

  // Get and sort feedback for the selected reviewer (newest first)
  const reviewerFeedback = selectedReviewer !== 'All Reviewers'
    ? [...feedbackData.filter(item =>
        item.reviewer === selectedReviewer &&
        dayjs(item.date).isSameOrAfter(startDate) &&
        dayjs(item.date).isSameOrBefore(endDate)
      )].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    : [];

  // Comparison color helper
  const getComparisonColor = (value, overallValue, higherIsBetter = true) => {
    if (overallValue === 0) return textColor;
    if (higherIsBetter) {
      return value >= overallValue ? accentGreen : accentRed;
    } else {
      return value <= overallValue ? accentGreen : accentRed;
    }
  };

  // Generate Report function
  const handleGenerateReport = useCallback(() => {
    if (tabValue === 1) {
      // Feedback Report
      let filteredFeedback = feedbackData.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isSameOrAfter(startDate) && itemDate.isSameOrBefore(endDate);
      });

      let reviewerFeedbackFiltered =
        selectedReviewer !== 'All Reviewers'
          ? filteredFeedback.filter(item => item.reviewer === selectedReviewer)
          : filteredFeedback;

      if (selectedClient !== 'All Clients') {
        reviewerFeedbackFiltered = reviewerFeedbackFiltered.filter(item => item.client === selectedClient);
      }

      if (selectedFeedbackType === 'client') {
        const groupedFeedback = {};
        reviewerFeedbackFiltered
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
        const internal = reviewerFeedbackFiltered.filter(item => item.feedbackType === 'internal');
        setClientComments({});
        setInternalFeedback(internal);
        setInternalOrderBy('reviewer');
        setInternalOrder('asc');
      }
      setReportResult(null);
      setClientBreakdown({});
      setQualityTrend([]);
      setLateTrend([]);
    } else {
      // Cases/Revisions Report
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

      // Build daily trend data
      const qualityMap = {};
      const lateMap = {};
      let cursor = dayjs(startDate);
      while (cursor.isSameOrBefore(endDate)) {
        const key = cursor.format('YYYY-MM-DD');
        qualityMap[key] = [];
        lateMap[key] = [];
        cursor = cursor.add(1, 'day');
      }
      filteredFLData.forEach(item => {
        item.snapshots.forEach(snap => {
          const snapDate = dayjs(snap.snapshotDate);
          if (snapDate.isSameOrAfter(startDate) && snapDate.isSameOrBefore(endDate)) {
            const key = snapDate.format('YYYY-MM-DD');
            qualityMap[key].push(snap.qualityScore);
            lateMap[key].push(snap.lateCasePercentage);
          }
        });
      });
      const qualityTrendData = [];
      const lateTrendData = [];
      Object.keys(qualityMap)
        .sort()
        .forEach(dateKey => {
          const qualityArr = qualityMap[dateKey];
          const lateArr = lateMap[dateKey];
          if (qualityArr.length > 0) {
            const avgQuality = qualityArr.reduce((a, b) => a + b, 0) / qualityArr.length;
            qualityTrendData.push({ date: dateKey, qualityScore: avgQuality });
          }
          if (lateArr.length > 0) {
            const avgLate = lateArr.reduce((a, b) => a + b, 0) / lateArr.length;
            lateTrendData.push({ date: dateKey, latePercentage: avgLate });
          }
        });

      const qualityScores = filteredFLData.map(item => {
        const snap = getLatestSnapshot(item, endDate);
        return snap ? snap.qualityScore : 0;
      });
      const overallQualityScoreCalc =
        qualityScores.reduce((a, b) => a + b, 0) / (qualityScores.length || 1);

      setReportResult({
        totalCases: overallTotalCases,
        revisionRequests: overallRevisionRequests,
        revisionPercentage: overallRevisionPercentage,
        periodDays,
        avgCasesPerDay: (overallTotalCases / periodDays).toFixed(1),
        qualityScore: overallQualityScoreCalc.toFixed(1),
      });
      setClientBreakdown(breakdown);
      setQualityTrend(sampleTrend(qualityTrendData, 10));
      setLateTrend(sampleTrend(lateTrendData, 10));
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

  const qualityChangePercent =
    qualityTrend.length > 1
      ? ((qualityTrend[qualityTrend.length - 1].qualityScore - qualityTrend[0].qualityScore) / qualityTrend[0].qualityScore) * 100
      : 0;
  const lateChangePercent =
    lateTrend.length > 1
      ? ((lateTrend[lateTrend.length - 1].latePercentage - lateTrend[0].latePercentage) / lateTrend[0].latePercentage) * 100
      : 0;

  const chartData = Object.entries(clientBreakdown).map(([client, totals]) => ({
    name: client,
    value: Math.round(totals.totalCases),
  }));

  return (
    <ThemeProvider theme={openSansTheme}>
      <Box id="reportContainer" sx={{ mt: 4, mb: 4, color: textColor, backgroundColor, p: 2, borderRadius: 2 }}>
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
              <FormControl fullWidth sx={{ '& .MuiSvgIcon-root': { color: textColor } }}>
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
              <FormControl fullWidth sx={{ '& .MuiSvgIcon-root': { color: textColor } }}>
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

          {/* Tabs */}
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

          {/* Feedback Type Selector */}
          {tabValue === 1 && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ '& .MuiSvgIcon-root': { color: textColor } }}>
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

        {/* Main Report Content */}
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
            {/* Top Scorecard */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fafafa',
                color: theme.palette.mode === 'dark' ? '#fff' : '#000'
              }}
            >
              <Grid container spacing={2} alignItems="stretch">
                {/* Left Section: Reviewer Info, Metrics, Feedback, Report Results */}
                <Grid item xs={12} md={5}>
                  {selectedReviewer !== 'All Reviewers' && reviewerInfo && reviewerSnapshot && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          alt={reviewerInfo.name}
                          src={profilePics[`${reviewerInfo.name}Pic`] || '/assets/default-avatar.png'}
                          sx={{ width: 80, height: 80 }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {reviewerInfo.name}
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        Average Cases per Day: {Number(reviewerAvgCases).toFixed(1)}{' '}
                        (<span style={{ color: getComparisonColor(reviewerAvgCases, overallMetrics.avgCases, true) }}>
                          Overall: {overallMetrics.avgCases.toFixed(1)}
                        </span>)
                      </Typography>
                      <Typography variant="body1">
                        Quality Score: {Number(reviewerQualityScore).toFixed(1)}%{' '}
                        (<span style={{ color: getComparisonColor(reviewerQualityScore, overallMetrics.avgQuality, true) }}>
                          Overall: {overallMetrics.avgQuality.toFixed(1)}%
                        </span>)
                      </Typography>
                      <Typography variant="body1">
                        Revision Rate: {reviewerRevisionRate}%{' '}
                        (<span style={{ color: getComparisonColor(reviewerRevisionRate, overallMetrics.avgRevision, false) }}>
                          Overall: {overallMetrics.avgRevision.toFixed(1)}%
                        </span>)
                      </Typography>
                      <Typography variant="body1">
                        Late %: {reviewerLatePercentage}%{' '}
                        (<span style={{ color: getComparisonColor(reviewerLatePercentage, overallMetrics.avgLate, false) }}>
                          Overall: {overallMetrics.avgLate.toFixed(1)}%
                        </span>)
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Feedback Summary:
                        </Typography>
                        {reviewerFeedback.length === 0 ? (
                          <Typography variant="body2">No feedback available for this period.</Typography>
                        ) : (
                          <List dense sx={{ textAlign: 'left' }}>
                            {reviewerFeedback.map((fb, index) => (
                              <ListItem key={index} disableGutters>
                                <ListItemText primary={`${dayjs(fb.date).format('MMM D')}: ${fb.content}`} />
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Report Results
                        </Typography>
                        <Typography>
                          Total Estimated Cases (over {reportResult.periodDays} days): {Math.round(reportResult.totalCases)}
                        </Typography>
                        <Typography>
                          Total Revision Requests: {Math.round(reportResult.revisionRequests)}{' '}
                          <span title={`Revision Rate: ${reportResult.revisionPercentage}%`}>
                            (Revision Rate: {reportResult.revisionPercentage}%)
                          </span>
                        </Typography>
                        <Typography>
                          Overall Quality Score: {reportResult.qualityScore}%
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>

                {/* Vertical Divider */}
                <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />
                </Grid>

                {/* Right Section: Client Breakdown & Donut Chart */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Breakdown by Client
                  </Typography>
                  <List>
                    {Object.entries(clientBreakdown).map(([client, totals]) => {
                      const rate =
                        totals.totalCases > 0
                          ? ((totals.totalRevisions / totals.totalCases) * 100).toFixed(2)
                          : '0.00';
                      return (
                        <ListItem key={client} disablePadding>
                          <ListItemText
                            primary={
                              <Typography sx={{ fontWeight: 'bold' }}>
                                {client}: {Math.round(totals.totalCases)} cases, {Math.round(totals.totalRevisions)} revisions (Rate: {rate}%)
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                  <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20 }}>
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
            </Paper>

            {/* Trend Charts */}
            {qualityTrend.length > 0 && (
              <Box sx={{ mt: 2, height: 300 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  Quality Score Trend
                  <Tooltip title={`Change: ${qualityChangePercent.toFixed(1)}%`} arrow>
                    <span>
                      {qualityChangePercent >= 0 ? (
                        <ArrowUpwardIcon style={{ color: accentGreen }} />
                      ) : (
                        <ArrowDownwardIcon style={{ color: accentRed }} />
                      )}
                    </span>
                  </Tooltip>
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qualityTrend} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM D')} stroke={textColor} />
                    <YAxis
                      domain={[0, 100]}
                      label={{
                        value: 'Quality Score',
                        angle: -90,
                        position: 'insideLeft',
                        offset: -10,
                        fill: textColor
                      }}
                      stroke={textColor}
                    />
                    <RechartsTooltip formatter={(value) => Number(value).toFixed(1)} />
                    <Legend />
                    <Line type="monotone" dataKey="qualityScore" name="Quality Score" dot={renderCustomDot} stroke="#00C49F" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {lateTrend.length > 0 && (
              <Box sx={{ mt: 4, height: 300 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  Late % Trend
                  <Tooltip title={`Change: ${lateChangePercent.toFixed(1)}%`} arrow>
                    <span>
                      {lateChangePercent <= 0 ? (
                        <ArrowUpwardIcon style={{ color: accentGreen }} />
                      ) : (
                        <ArrowDownwardIcon style={{ color: accentRed }} />
                      )}
                    </span>
                  </Tooltip>
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lateTrend} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM D')} stroke={textColor} />
                    <YAxis
                      label={{
                        value: 'Late %',
                        angle: -90,
                        position: 'insideLeft',
                        offset: -10,
                        fill: textColor
                      }}
                      stroke={textColor}
                    />
                    <RechartsTooltip formatter={(value) => Number(value).toFixed(1)} />
                    <Legend />
                    <Line type="monotone" dataKey="latePercentage" stroke="#FFB74D" name="Late %" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Export Button (Single Export as PDF) */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button variant="outlined" color="secondary" onClick={exportReportAsImagePDF}>
                Export as PDF
              </Button>
            </Box>
          </Box>
        )}

        {/* Feedback Tab Content */}
        {tabValue === 1 && (
          <Box sx={{ mt: 3, backgroundColor, p: 2, borderRadius: 2 }}>
            {selectedFeedbackType === 'client' ? (
              <Box>
                {Object.entries(clientComments).map(([client, reviewerFeedbackObj]) => {
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

      {/* Single Export as PDF Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button variant="outlined" color="secondary" onClick={exportReportAsImagePDF}>
          Export as PDF
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default Reports;
