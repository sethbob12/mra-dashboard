// src/Reports.js
import React, { useState, useRef } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Grid
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import FLData from './FLData';
import FeedbackData from './FeedbackData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
} from 'recharts';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Create a theme that uses Open Sans.
const openSansTheme = createTheme({
  typography: {
    fontFamily: 'Open Sans, sans-serif',
  },
});

// Get unique clients from FLData.
const getUniqueClients = () => {
  const clientSet = new Set();
  FLData.forEach(item => {
    item.clients.split(",").map(c => c.trim()).forEach(client => clientSet.add(client));
  });
  return ['All Clients', ...Array.from(clientSet).sort()];
};

// Trend helper functions.
const computeRevisionsSlope = (trend) => {
  if (trend.length < 2) return 0;
  return trend[trend.length - 1].cumulativeRevisions - trend[0].cumulativeRevisions;
};

const computeRevisionsSlopePercent = (trend) => {
  if (trend.length < 2 || trend[0].cumulativeRevisions === 0) return "N/A";
  const slope = computeRevisionsSlope(trend);
  const percent = (slope / trend[0].cumulativeRevisions) * 100;
  return `${percent.toFixed(1)}%`;
};

const getSlopeIndicator = (slope) => {
  if (slope < 0) return "↓";
  if (slope > 0) return "↑";
  return "-";
};

const computeLateSlope = (trend) => {
  if (trend.length < 2) return 0;
  return trend[trend.length - 1].latePercentage - trend[0].latePercentage;
};

const computeLateSlopePercent = (trend) => {
  if (trend.length < 2 || trend[0].latePercentage === 0) return "N/A";
  const slope = computeLateSlope(trend);
  const percent = (slope / trend[0].latePercentage) * 100;
  return `${percent.toFixed(1)}%`;
};

const getLateSlopeIndicator = (slope) => {
  if (slope < 0) return "↓";
  if (slope > 0) return "↑";
  return "-";
};

const Reports = ({ reviewers }) => {
  // Dropdown states.
  const [selectedReviewer, setSelectedReviewer] = useState('All Reviewers');
  const [selectedClient, setSelectedClient] = useState('All Clients');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  // Tabs: 0 = Cases/Revisions, 1 = Feedback.
  const [tabValue, setTabValue] = useState(0);
  // For Feedback Report.
  const [selectedFeedbackType, setSelectedFeedbackType] = useState('client');
  // For client feedback: Group by client then by reviewer.
  const [clientComments, setClientComments] = useState({});
  // For internal feedback: Group by reviewer.
  const [groupedQaFeedback, setGroupedQaFeedback] = useState({});
  // For Cases/Revisions report.
  const [reportResult, setReportResult] = useState(null);
  const [clientBreakdown, setClientBreakdown] = useState({});
  // Trend data.
  const [clientTrendData, setClientTrendData] = useState({});
  const [qualityTrend, setQualityTrend] = useState([]);
  const [lateTrend, setLateTrend] = useState([]);

  const uniqueClients = getUniqueClients();
  const chartsRef = useRef(null);

  const handleGenerateReport = () => {
    console.log("Generating report...");
    console.log("Start Date:", startDate.format('YYYY-MM-DD'), "End Date:", endDate.format('YYYY-MM-DD'));

    if (tabValue === 1) {
      // Feedback Report.
      let filteredFeedback = FeedbackData.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isSameOrAfter(startDate) && itemDate.isSameOrBefore(endDate);
      });
      let reviewerFeedback = selectedReviewer !== 'All Reviewers'
        ? filteredFeedback.filter(item => item.name === selectedReviewer)
        : filteredFeedback;
      // Filter by client if a specific client is selected.
      if (selectedClient !== 'All Clients') {
        reviewerFeedback = reviewerFeedback.filter(item => item.client === selectedClient);
      }
      if (selectedFeedbackType === 'client') {
        // Group client feedback by client, then by reviewer.
        const groupedFeedback = {};
        reviewerFeedback.filter(item => item.feedbackType === 'client').forEach(item => {
          const client = item.client || "Unknown Client";
          if (!groupedFeedback[client]) groupedFeedback[client] = {};
          if (!groupedFeedback[client][item.name]) groupedFeedback[client][item.name] = [];
          // Push an object with both text and caseID.
          groupedFeedback[client][item.name].push({
            text: item.text,
            caseID: item.caseID
          });
        });
        // Sort reviewers alphabetically within each client.
        const sortedGroupedFeedback = {};
        Object.keys(groupedFeedback).forEach(client => {
          const sortedReviewers = Object.keys(groupedFeedback[client]).sort();
          sortedGroupedFeedback[client] = {};
          sortedReviewers.forEach(reviewer => {
            sortedGroupedFeedback[client][reviewer] = groupedFeedback[client][reviewer];
          });
        });
        setClientComments(sortedGroupedFeedback);
        setGroupedQaFeedback({});
      } else {
        // Internal feedback: group by reviewer.
        const grouped = {};
        reviewerFeedback.filter(item => item.feedbackType === 'internal').forEach(item => {
          if (!grouped[item.name]) grouped[item.name] = [];
          grouped[item.name].push(item);
        });
        // Sort reviewer keys alphabetically.
        const sortedGrouped = {};
        Object.keys(grouped).sort().forEach(key => {
          sortedGrouped[key] = grouped[key];
        });
        setGroupedQaFeedback(sortedGrouped);
        setClientComments({});
      }
      // Clear other report states.
      setReportResult(null);
      setClientBreakdown({});
      setClientTrendData({});
      setQualityTrend([]);
      setLateTrend([]);
    } else if (tabValue === 0) {
      // Cases/Revisions Report.
      const periodDays = endDate.diff(startDate, 'day') + 1;
      let filteredFLData = selectedReviewer !== 'All Reviewers'
        ? FLData.filter(item => item.name === selectedReviewer)
        : FLData;
      if (selectedClient !== 'All Clients') {
        filteredFLData = filteredFLData.filter(item =>
          item.clients.split(",").map(c => c.trim()).includes(selectedClient)
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
        const clients = item.clients.split(",").map(c => c.trim());
        clients.forEach(client => {
          if (selectedClient === 'All Clients' || client === selectedClient) {
            if (!breakdown[client]) {
              breakdown[client] = { totalCases: 0, totalRevisions: 0 };
            }
            breakdown[client].totalCases += estimatedCases;
            breakdown[client].totalRevisions += estimatedRevisions;
          }
        });
      });
      const overallRevisionPercentage = overallTotalCases > 0
        ? ((overallRevisionRequests / overallTotalCases) * 100).toFixed(2)
        : '0.00';
      const overallLatePercentage = filteredFLData.reduce(
        (sum, item) => sum + item.lateCasePercentage,
        0
      ) / filteredFLData.length;

      setReportResult({
        totalCases: overallTotalCases,
        revisionRequests: overallRevisionRequests,
        revisionPercentage: overallRevisionPercentage,
        periodDays,
      });
      setClientBreakdown(breakdown);

      // Compute per-client trend data.
      const perClientTrendData = {};
      for (const client of Object.keys(breakdown)) {
        let sumCases = 0;
        let sumRevisions = 0;
        filteredFLData.forEach(item => {
          const clients = item.clients.split(",").map(c => c.trim());
          if (clients.includes(client)) {
            sumCases += item.avgCasesPerDay;
            sumRevisions += (item.clientRevisionsMonth / 20);
          }
        });
        const trend = [];
        for (let d = 0; d < periodDays; d++) {
          const currentDate = dayjs(startDate).add(d, 'day').format('YYYY-MM-DD');
          trend.push({
            date: currentDate,
            cumulativeCases: sumCases * (d + 1),
            cumulativeRevisions: sumRevisions * (d + 1),
          });
        }
        perClientTrendData[client] = trend;
      }
      setClientTrendData(perClientTrendData);

      // Compute overall quality trend.
      const qualityScores = filteredFLData
        .map(item => item.qualityScore)
        .filter(score => score != null);
      const overallQualityScore = qualityScores.length > 0
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

      // Build Late % trend.
      const lateTrendData = [];
      for (let d = 0; d < periodDays; d++) {
        const currentDate = dayjs(startDate).add(d, 'day').format('YYYY-MM-DD');
        lateTrendData.push({
          date: currentDate,
          latePercentage: overallLatePercentage,
        });
      }
      setLateTrend(lateTrendData);
      // Clear feedback-specific states.
      setClientComments({});
      setGroupedQaFeedback({});
    }
  };

  // Export Report as CSV.
  const exportReportCSV = () => {
    if (reportResult && Object.keys(clientBreakdown).length > 0) {
      let csvContent = "data:text/csv;charset=utf-8,";
      if (selectedReviewer !== 'All Reviewers') {
        csvContent += `Reviewer,${selectedReviewer}\n`;
      }
      csvContent += `Total Estimated Cases,${Math.round(reportResult.totalCases)}\n`;
      csvContent += `Total Revision Requests,${Math.round(reportResult.revisionRequests)}\n`;
      csvContent += `Revision Percentage,${reportResult.revisionPercentage}%\n`;
      csvContent += `Average Late %,${lateTrend.length > 0 ? lateTrend[0].latePercentage.toFixed(1) : "N/A"}%\n\n`;
      csvContent += "Client,Estimated Cases,Estimated Revisions,Revision Rate (%)\n";
      for (const [client, totals] of Object.entries(clientBreakdown)) {
        const rate = totals.totalCases > 0 ? ((totals.totalRevisions / totals.totalCases) * 100).toFixed(2) : "0.00";
        csvContent += `${client},${Math.round(totals.totalCases)},${Math.round(totals.totalRevisions)},${rate}\n`;
      }
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "cases_revisions_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Export Report as PDF.
  const exportReportPDF = async () => {
    if (reportResult && Object.keys(clientBreakdown).length > 0) {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Cases / Revisions Report", 14, 20);
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
      doc.text(`Average Late %: ${lateTrend.length > 0 ? lateTrend[0].latePercentage.toFixed(1) : "N/A"}%`, 14, 80);
      const tableColumn = ["Client", "Estimated Cases", "Estimated Revisions", "Revision Rate (%)"];
      const tableRows = [];
      for (const [client, totals] of Object.entries(clientBreakdown)) {
        const rate = totals.totalCases > 0 ? ((totals.totalRevisions / totals.totalCases) * 100).toFixed(2) : "0.00";
        tableRows.push([client, Math.round(totals.totalCases), Math.round(totals.totalRevisions), rate]);
      }
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: selectedReviewer !== 'All Reviewers' ? 90 : 80,
      });
      if ((Object.keys(clientTrendData).length > 0 || qualityTrend.length > 0 || lateTrend.length > 0) && chartsRef.current) {
        const canvas = await html2canvas(chartsRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const availableHeight = pageHeight - margin - (doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 90);
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        if (imgHeight <= availableHeight) {
          doc.addImage(imgData, 'PNG', margin, doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 90, imgWidth, imgHeight);
        } else {
          const numPages = Math.ceil(imgHeight / availableHeight);
          for (let i = 0; i < numPages; i++) {
            const sourceY = (canvas.height / imgHeight) * (i * availableHeight);
            const sourceHeight = (canvas.height / imgHeight) * availableHeight;
            const canvasPage = document.createElement('canvas');
            canvasPage.width = canvas.width;
            canvasPage.height = sourceHeight;
            const ctx = canvasPage.getContext('2d');
            ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            const pageImgData = canvasPage.toDataURL('image/png');
            const positionY = i === 0 ? (doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 90) : margin;
            doc.addImage(pageImgData, 'PNG', margin, positionY, imgWidth, availableHeight);
            if (i < numPages - 1) doc.addPage();
          }
        }
      }
      doc.save("cases_revisions_report.pdf");
    }
  };

  return (
    <ThemeProvider theme={openSansTheme}>
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Top Section: Paper Container */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            MRA Reports
          </Typography>

          {/* Grid layout for inputs */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Reviewer</InputLabel>
                <Select
                  value={selectedReviewer}
                  onChange={(e) => setSelectedReviewer(e.target.value)}
                  label="Reviewer"
                >
                  <MenuItem value="All Reviewers">All Reviewers</MenuItem>
                  {reviewers.map((reviewer) => (
                    <MenuItem key={reviewer} value={reviewer}>
                      {reviewer}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

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

          {/* Tabs for Cases/Revisions and Feedback */}
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

          {/* Feedback Type Dropdown */}
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

          {/* Generate Report Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateReport}
            sx={{
              mt: 3,
              py: 1.2,
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            Generate Report
          </Button>
        </Paper>

        {/* Cases / Revisions Report Section */}
        {tabValue === 0 && reportResult && (
          <Box sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6">Report Results</Typography>
            <Typography>
              Total Estimated Cases (over {reportResult.periodDays} days): {Math.round(reportResult.totalCases)}
            </Typography>
            <Typography>
              Total Revision Requests: {Math.round(reportResult.revisionRequests)}{' '}
              <span title={`Revision Rate: ${reportResult.revisionPercentage}%`}>
                (Revision Rate: {reportResult.revisionPercentage}%)
              </span>
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Breakdown by Client:</Typography>
              <List>
                {Object.entries(clientBreakdown).map(([client, totals]) => {
                  const rate = totals.totalCases > 0
                    ? ((totals.totalRevisions / totals.totalCases) * 100).toFixed(2)
                    : "0.00";
                  return (
                    <ListItem key={client} disablePadding>
                      <ListItemText primary={`${client}: ${Math.round(totals.totalCases)} cases, ${Math.round(totals.totalRevisions)} revisions (Rate: ${rate}%)`} />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Overall Quality Score:{" "}
                {Math.round(
                  (FLData.filter(item =>
                    (selectedReviewer === 'All Reviewers' || item.name === selectedReviewer) &&
                    (selectedClient === 'All Clients' ||
                      item.clients.split(",").map(c => c.trim()).includes(selectedClient)
                    )
                  ).map(item => item.qualityScore).reduce((a, b) => a + b, 0) /
                    FLData.filter(item =>
                      (selectedReviewer === 'All Reviewers' || item.name === selectedReviewer) &&
                      (selectedClient === 'All Clients' ||
                        item.clients.split(",").map(c => c.trim()).includes(selectedClient)
                      )
                    ).length) || 0
                )}
              </Typography>
            </Box>
            {qualityTrend.length > 0 && (
              <Box sx={{ mt: 2, height: 300 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Quality Score Trend
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qualityTrend} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM D')} />
                    <YAxis label={{ value: "Quality Score", angle: -90, position: 'insideLeft', offset: -10 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="qualityScore" stroke="#00C49F" name="Quality Score" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Average Late %: {lateTrend.length > 0 ? lateTrend[0].latePercentage.toFixed(1) : "N/A"}%
              </Typography>
            </Box>
            {lateTrend.length > 0 && (
              <Box sx={{ mt: 2, height: 300 }}>
                {(() => {
                  const slopeLate = computeLateSlope(lateTrend);
                  const lateIndicator = getLateSlopeIndicator(slopeLate);
                  const lateSlopePercent = computeLateSlopePercent(lateTrend);
                  return (
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Late % Trend{" "}
                      <Tooltip title={`Change: ${lateSlopePercent}`} arrow>
                        <span style={{ color: slopeLate < 0 ? 'green' : slopeLate > 0 ? 'red' : 'gray', cursor: 'default' }}>
                          {lateIndicator}
                        </span>
                      </Tooltip>
                    </Typography>
                  );
                })()}
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lateTrend} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM D')} />
                    <YAxis label={{ value: "Late %", angle: -90, position: 'insideLeft', offset: -10 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="latePercentage" stroke="#FFB74D" name="Late %" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
            <Box ref={chartsRef}>
              {Object.keys(clientTrendData).length > 0 && (
                Object.entries(clientTrendData).map(([client, trend]) => {
                  const slope = computeRevisionsSlope(trend);
                  const indicator = getSlopeIndicator(slope);
                  const slopePercent = computeRevisionsSlopePercent(trend);
                  return (
                    <Box key={client} sx={{ mt: 3, height: 300 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {client} Trend{" "}
                        <Tooltip title={`Change: ${slopePercent}`} arrow>
                          <span style={{ color: slope < 0 ? 'green' : slope > 0 ? 'red' : 'gray', cursor: 'default' }}>
                            {indicator}
                          </span>
                        </Tooltip>
                      </Typography>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM D')} />
                          <YAxis label={{ value: "Cumulative Total", angle: -90, position: 'insideLeft', offset: -10 }} />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="cumulativeCases" stroke="#1E73BE" name="Cumulative Cases" />
                          <Line type="monotone" dataKey="cumulativeRevisions" stroke="#FF8042" name="Cumulative Revisions" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  );
                })
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="outlined" color="secondary" onClick={exportReportCSV}>
                Export as CSV
              </Button>
              <Button variant="outlined" color="secondary" onClick={exportReportPDF}>
                Export as PDF
              </Button>
            </Box>
          </Box>
        )}

        {/* Feedback Report Section */}
        {tabValue === 1 && (
          <Box sx={{ mt: 3 }}>
            {selectedFeedbackType === 'client' ? (
              // Group client feedback by client then by reviewer.
              <Box>
                {Object.entries(clientComments).map(([client, reviewersObj]) => {
                  // For copying: concatenate only the feedback texts (ignoring caseID).
                  const copyText = Object.values(reviewersObj)
                    .flat()
                    .map(feedback => feedback.text)
                    .join('\n');
                  return (
                    <Box key={client} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f0f0f0', p: 1, borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {client}:
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigator.clipboard.writeText(copyText)}
                        >
                          Copy
                        </Button>
                      </Box>
                      {Object.keys(reviewersObj).sort().map(reviewer => {
                        const feedbackArray = Array.isArray(reviewersObj[reviewer])
                          ? reviewersObj[reviewer]
                          : [];
                        return (
                          <Box key={reviewer} sx={{ ml: 2, mt: 1, mb: 1, p: 1, borderLeft: '2px solid #ccc' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {reviewer}:
                            </Typography>
                            <List dense>
                              {feedbackArray.map((feedback, i) => (
                                <ListItem key={i} disablePadding>
                                  <ListItemText primary={`Case ID: ${feedback.caseID} – ${feedback.text}`} />
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
              // Internal feedback: group by reviewer.
              <Box>
                <Typography variant="h6" gutterBottom>
                  Internal Feedback Grouped by Reviewer
                </Typography>
                <Table sx={{ border: '1px solid #ddd' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Reviewer</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Feedback Details</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Copy Feedback</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(groupedQaFeedback).sort().map(reviewer => {
                      const items = groupedQaFeedback[reviewer];
                      // For display: include full details.
                      const aggregatedDisplayText = items.map(item => (
                        `Date: ${dayjs(item.date).format('YYYY-MM-DD')}\nClient: ${item.client}\nQA Member: ${item.qaMember}\nCase ID: ${item.caseID}\nFeedback: ${item.text}`
                      )).join('\n\n');
                      // For copying, only feedback texts.
                      const aggregatedCopyText = items.map(item => item.text).join('\n');
                      return (
                        <TableRow key={reviewer}>
                          <TableCell sx={{ verticalAlign: 'top' }}>{reviewer}</TableCell>
                          <TableCell>
                            <Paper variant="outlined" sx={{ p: 1, bgcolor: '#fafafa' }}>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {aggregatedDisplayText}
                              </Typography>
                            </Paper>
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigator.clipboard.writeText(aggregatedCopyText)}
                            >
                              Copy
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Reports;
