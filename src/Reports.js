// src/Reports.js /*REFACTORED*/

import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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

// -- THEME --
const openSansTheme = createTheme({
  typography: { fontFamily: 'Open Sans, sans-serif' },
});

// -- Helper: Extract unique clients from the dataset --
const getUniqueClients = (reviewerData) => {
  const clientSet = new Set();
  reviewerData.forEach(item => {
    item.clients.split(',').map(c => c.trim()).forEach(client => clientSet.add(client));
  });
  return ['All Clients', ...Array.from(clientSet).sort()];
};

// -- Sorting Helpers --
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

// -- Custom dot renderer for quality trend graph --
const renderCustomDot = (props) => {
  const { cx, cy, value } = props;
  let fillColor = 'red';
  if (value >= 90) fillColor = 'green';
  else if (value >= 80) fillColor = 'yellow';
  return <circle cx={cx} cy={cy} r={4} fill={fillColor} />;
};

// -- CSV Export --
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

// -- PDF Export --
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

    // Table
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

const Reports = ({ reviewerData, feedbackData }) => {
  const location = useLocation();

  // Instead of local fetch states, we use data from props
  // const [reviewerData, setReviewerData] = useState([]);
  // const [feedbackData, setFeedbackData] = useState([]);

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

  // Create a dynamic list of unique reviewers from the reviewerData prop
  const allReviewers = [...new Set(reviewerData.map(item => item.name))];

  // Derive unique clients from the data
  const uniqueClients = getUniqueClients(reviewerData);

  // Generate Report
  const handleGenerateReport = useCallback(() => {
    if (tabValue === 1) {
      // -- Feedback Report --
      let filteredFeedback = feedbackData.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isSameOrAfter(startDate) && itemDate.isSameOrBefore(endDate);
      });

      let reviewerFeedback =
        selectedReviewer !== 'All Reviewers'
          ? filteredFeedback.filter(item => item.name === selectedReviewer)
          : filteredFeedback;

      if (selectedClient !== 'All Clients') {
        reviewerFeedback = reviewerFeedback.filter(item => item.client === selectedClient);
      }

      // Client feedback
      if (selectedFeedbackType === 'client') {
        const groupedFeedback = {};
        reviewerFeedback
          .filter(item => item.feedbackType === 'client')
          .forEach(item => {
            const client = item.client || 'Unknown Client';
            if (!groupedFeedback[client]) groupedFeedback[client] = {};
            if (!groupedFeedback[client][item.name]) groupedFeedback[client][item.name] = [];
            groupedFeedback[client][item.name].push({
              text: item.text,
              caseID: item.caseID,
            });
          });

        // Sort feedback by reviewer within each client
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
        setInternalOrderBy('name');
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
        const estimatedCases = item.avgCasesPerDay * periodDays;
        const estimatedRevisions = (item.clientRevisionsMonth / 20) * periodDays;

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

      const overallLatePercentage =
        filteredFLData.reduce((sum, item) => sum + item.lateCasePercentage, 0) /
        (filteredFLData.length || 1);

      // Summaries
      setReportResult({
        totalCases: overallTotalCases,
        revisionRequests: overallRevisionRequests,
        revisionPercentage: overallRevisionPercentage,
        periodDays,
        avgCasesPerDay: (overallTotalCases / periodDays).toFixed(1),
        qualityScore:
          filteredFLData.length > 0
            ? (
                filteredFLData
                  .map(item => item.qualityScore)
                  .reduce((a, b) => a + b, 0) / filteredFLData.length
              ).toFixed(1)
            : 0,
      });
      setClientBreakdown(breakdown);

      // Quality Trend
      const qualityScores = filteredFLData.map(item => item.qualityScore).filter(Boolean);
      const overallQualityScore =
        qualityScores.length > 0
          ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
          : 0;

      const qualityTrendData = [];
      for (let d = 0; d < periodDays; d++) {
        const currentDate = dayjs(startDate).add(d, 'day').format('YYYY-MM-DD');
        qualityTrendData.push({
          date: currentDate,
          qualityScore: overallQualityScore,
        });
      }
      setQualityTrend(qualityTrendData);

      // Late Trend
      const lateTrendData = [];
      for (let d = 0; d < periodDays; d++) {
        const currentDate = dayjs(startDate).add(d, 'day').format('YYYY-MM-DD');
        lateTrendData.push({
          date: currentDate,
          latePercentage: overallLatePercentage,
        });
      }
      setLateTrend(lateTrendData);

      // Clear feedback
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

  // -- Parse URL query params on mount (or location change) --
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reviewerParam = params.get('reviewer');
    const startDateParam = params.get('startDate');
    const endDateParam = params.get('endDate');
    const feedbackTypeParam = params.get('feedbackType');
    const reportTypeParam = params.get('reportType');

    if (reviewerParam && reviewerParam !== 'All Reviewers') {
      setSelectedReviewer(reviewerParam);
    }
    if (startDateParam) setStartDate(dayjs(startDateParam));
    if (endDateParam) setEndDate(dayjs(endDateParam));

    // If URL says "feedbackType=internal/qa", jump to tabValue=1
    if (feedbackTypeParam) {
      setTabValue(1);
      setSelectedFeedbackType(feedbackTypeParam === 'internal' ? 'qa' : feedbackTypeParam);
      setShouldAutoGenerate(true);
    }

    // If URL says "reportType=Cases/Revisions", jump to tabValue=0
    if (reportTypeParam && reportTypeParam === 'Cases/Revisions') {
      setTabValue(0);
      setShouldAutoGenerate(true);
    }
  }, [location.search]);

  // Auto-generate if shouldAutoGenerate is set
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reportTypeParam = params.get('reportType');

    if (reportTypeParam === 'Cases/Revisions' && !reportResult && shouldAutoGenerate) {
      handleGenerateReport();
      setShouldAutoGenerate(false);
    }
  }, [location.search, reportResult, shouldAutoGenerate, handleGenerateReport]);

  // Pie chart data
  const chartData = Object.entries(clientBreakdown).map(([client, totals]) => ({
    name: client,
    value: Math.round(totals.totalCases),
  }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

  return (
    <ThemeProvider theme={openSansTheme}>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            MRA Reports
          </Typography>
          <Grid container spacing={2}>
            {/* Reviewer Selector */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Reviewer</InputLabel>
                <Select
                  value={selectedReviewer}
                  onChange={(e) => setSelectedReviewer(e.target.value)}
                  label="Reviewer"
                >
                  <MenuItem value="All Reviewers">All Reviewers</MenuItem>
                  {allReviewers.map((rev) => (
                    <MenuItem key={rev} value={rev}>
                      {rev}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Client Selector */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  label="Client"
                >
                  {uniqueClients.map((client) => (
                    <MenuItem key={client} value={client}>
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
                  slotProps={{ textField: { fullWidth: true } }}
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
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          {/* Tabs for toggling between Cases/Revisions and Feedback */}
          <Box sx={{ mt: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Cases / Revisions" />
              <Tab label="Feedback" />
            </Tabs>
          </Box>

          {/* Feedback Type Selector (visible only if tabValue=1) */}
          {tabValue === 1 && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Feedback Type</InputLabel>
                <Select
                  value={selectedFeedbackType}
                  onChange={(e) => setSelectedFeedbackType(e.target.value)}
                  label="Feedback Type"
                >
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="qa">Internal</MenuItem>
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
              backgroundColor: '#f9f9f9'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Report Results
            </Typography>
            <Typography>
              Total Estimated Cases (over {reportResult.periodDays} days):{' '}
              {Math.round(reportResult.totalCases)}
            </Typography>
            <Typography>
              Total Revision Requests: {Math.round(reportResult.revisionRequests)}{' '}
              <span title={`Revision Rate: ${reportResult.revisionPercentage}%`}>
                (Revision Rate: {reportResult.revisionPercentage}%)
              </span>
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {/* Client Breakdown */}
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
                              {client}: {Math.round(totals.totalCases)} cases,{' '}
                              {Math.round(totals.totalRevisions)} revisions (Rate: {rate}%)
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      label
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>

            {/* Quality Score */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Overall Quality Score:{' '}
                {Math.round(
                  (reviewerData.filter(item =>
                    (selectedReviewer === 'All Reviewers' || item.name === selectedReviewer) &&
                    (selectedClient === 'All Clients' ||
                      item.clients.split(',').map(c => c.trim()).includes(selectedClient))
                  )
                  .map(item => item.qualityScore)
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
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Quality Score Trend
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={qualityTrend}
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => dayjs(date).format('MMM D')}
                    />
                    <YAxis
                      domain={[0, 100]}
                      label={{
                        value: 'Quality Score',
                        angle: -90,
                        position: 'insideLeft',
                        offset: -10
                      }}
                    />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="qualityScore"
                      name="Quality Score"
                      dot={renderCustomDot}
                      stroke="#00C49F"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Late % */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Average Late %:{' '}
                {lateTrend.length > 0 ? lateTrend[0].latePercentage.toFixed(1) : 'N/A'}%
              </Typography>
            </Box>
            {lateTrend.length > 0 && (
              <Box sx={{ mt: 2, height: 300 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Late % Trend{' '}
                  <Tooltip title="Change in late percentage" arrow>
                    <span style={{ cursor: 'default' }}>▼ or ▲</span>
                  </Tooltip>
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lateTrend}
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => dayjs(date).format('MMM D')}
                    />
                    <YAxis
                      label={{ value: 'Late %', angle: -90, position: 'insideLeft', offset: -10 }}
                    />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="latePercentage"
                      stroke="#FFB74D"
                      name="Late %"
                    />
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
                  exportReportPDF(
                    reportResult,
                    clientBreakdown,
                    selectedReviewer,
                    startDate,
                    endDate,
                    lateTrend
                  )
                }
              >
                Export as PDF
              </Button>
            </Box>
          </Box>
        )}

        {/* ---- FEEDBACK TAB CONTENT ---- */}
        {tabValue === 1 && (
          <Box sx={{ mt: 3 }}>
            {selectedFeedbackType === 'client' ? (
              // -- Client Feedback --
              <Box>
                {Object.entries(clientComments).map(([client, reviewersObj]) => {
                  const copyText = Object.values(reviewersObj)
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
                          bgcolor: '#f0f0f0',
                          p: 1,
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
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
                          Copy
                        </Button>
                      </Box>

                      {/* Feedback grouped by reviewer */}
                      {Object.keys(reviewersObj).sort().map(reviewer => {
                        const feedbackArray = Array.isArray(reviewersObj[reviewer])
                          ? reviewersObj[reviewer]
                          : [];

                        return (
                          <Box
                            key={reviewer}
                            sx={{
                              ml: 2,
                              mt: 1,
                              mb: 1,
                              p: 1,
                              borderLeft: '2px solid #ccc'
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
              // -- Internal (QA) Feedback --
              <Box>
                <Typography variant="h6" gutterBottom>
                  Internal Feedback
                </Typography>
                {internalFeedback.length === 0 ? (
                  <Typography>
                    No internal QA feedback available for the selected period.
                  </Typography>
                ) : (
                  <>
                    {/* Copy All Button */}
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
                          const allFeedbackText = internalFeedback
                            .map(item => item.text)
                            .join('\n');
                          navigator.clipboard.writeText(allFeedbackText);
                        }}
                      >
                        Copy All Internal Feedback
                      </Button>
                    </Box>

                    {/* Sort by QA Member button */}
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
                          const isAsc =
                            internalOrderBy === 'qaMember' && internalOrder === 'asc';
                          setInternalOrder(isAsc ? 'desc' : 'asc');
                          setInternalOrderBy('qaMember');
                        }}
                      >
                        Sort by QA Member
                      </Button>
                    </Box>

                    <Table sx={{ border: '1px solid #ddd' }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            <TableSortLabel
                              active={internalOrderBy === 'name'}
                              direction={internalOrderBy === 'name' ? internalOrder : 'asc'}
                              onClick={() => {
                                const isAsc =
                                  internalOrderBy === 'name' && internalOrder === 'asc';
                                setInternalOrder(isAsc ? 'desc' : 'asc');
                                setInternalOrderBy('name');
                              }}
                            >
                              Reviewer
                            </TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            <TableSortLabel
                              active={internalOrderBy === 'qaMember'}
                              direction={internalOrderBy === 'qaMember' ? internalOrder : 'asc'}
                              onClick={() => {
                                const isAsc =
                                  internalOrderBy === 'qaMember' && internalOrder === 'asc';
                                setInternalOrder(isAsc ? 'desc' : 'asc');
                                setInternalOrderBy('qaMember');
                              }}
                              sx={{
                                background:
                                  internalOrderBy === 'qaMember'
                                    ? 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)'
                                    : 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                                color: '#fff',
                                borderRadius: '3px',
                                px: 1,
                                py: 0.5,
                                cursor: 'pointer',
                                transition: 'background-color 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)',
                                  boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
                                }
                              }}
                            >
                              Sort by QA Member
                            </TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Feedback Details</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Copy Feedback</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stableSort(
                          internalFeedback,
                          getComparator(internalOrder, internalOrderBy)
                        ).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              {item.name}
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top' }}>
                              {item.qaMember}
                            </TableCell>
                            <TableCell>
                              <Paper variant="outlined" sx={{ p: 1, bgcolor: '#fafafa' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {`Date: ${dayjs(item.date).format('YYYY-MM-DD')}\nClient: ${
                                    item.client
                                  }\nCase ID: ${
                                    item.caseID
                                  }\nFeedback: ${item.text}`}
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
                                onClick={() => navigator.clipboard.writeText(item.text)}
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
