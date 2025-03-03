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
} from '@mui/material';
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

// Get unique clients from FLData.
const getUniqueClients = () => {
  const clientSet = new Set();
  FLData.forEach(item => {
    item.clients.split(",").map(c => c.trim()).forEach(client => clientSet.add(client));
  });
  return ['All Clients', ...Array.from(clientSet).sort()];
};

// Feedback grouping helpers.
const extractClientFromFeedback = (text) => {
  const match = text.match(/^Client revision feedback for ([^:]+):/);
  return match ? match[1].trim() : "Unknown Client";
};

const cleanFeedbackText = (text) => {
  return text.replace(/^Client revision feedback for [^:]+:\s*/, '')
             .replace(/^Internal QA feedback for [^:]+:\s*/, '');
};

// Trend helpers.
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

// Late % trend helpers.
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
  // Two tabs: 0 = Cases/Revisions, 1 = Feedback.
  const [tabValue, setTabValue] = useState(0);
  // For Feedback Report.
  const [selectedFeedbackType, setSelectedFeedbackType] = useState('client');
  const [clientComments, setClientComments] = useState({});
  const [qaComments, setQaComments] = useState({});
  // For Cases/Revisions report.
  const [reportResult, setReportResult] = useState(null);
  const [clientBreakdown, setClientBreakdown] = useState({});
  // Trend data.
  const [clientTrendData, setClientTrendData] = useState({});
  const [qualityTrend, setQualityTrend] = useState([]);
  const [lateTrend, setLateTrend] = useState([]);

  const uniqueClients = getUniqueClients();

  // Ref for charts container (for PDF export).
  const chartsRef = useRef(null);

  const handleGenerateReport = () => {
    console.log("Generating report...");
    console.log("Start Date:", startDate.format('YYYY-MM-DD'), "End Date:", endDate.format('YYYY-MM-DD'));

    if (tabValue === 1) {
      // Feedback Report.
      const filteredFeedback = FeedbackData.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isSameOrAfter(startDate) && itemDate.isSameOrBefore(endDate);
      });
      const reviewerFeedback = selectedReviewer !== 'All Reviewers'
        ? filteredFeedback.filter(item => item.name === selectedReviewer)
        : filteredFeedback;
      if (selectedFeedbackType === 'client') {
        // Group feedback by client type.
        const groupedFeedback = {};
        reviewerFeedback.forEach(item => {
          if (item.feedbackType === 'client') {
            const client = item.client ? item.client : extractClientFromFeedback(item.text);
            const text = cleanFeedbackText(item.text);
            if (!groupedFeedback[client]) groupedFeedback[client] = [];
            groupedFeedback[client].push(text);
          }
        });
        setClientComments(groupedFeedback);
        setQaComments({});
      } else {
        // For Internal feedback, just list feedback items.
        const internalFeedback = reviewerFeedback
          .filter(item => item.feedbackType === 'internal')
          .map(item => cleanFeedbackText(item.text));
        setQaComments({ "Internal Feedback": internalFeedback });
        setClientComments({});
      }
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
      // Compute overall Late %.
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
    }
  };

  // Export report as CSV.
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
        const rate = totals.totalCases > 0
          ? ((totals.totalRevisions / totals.totalCases) * 100).toFixed(2)
          : "0.00";
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

  // Export report as PDF including charts.
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

      // Capture the charts container (Quality Trend, Late % Trend, and Per-Client Trend Charts).
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
    <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Reports
      </Typography>

      {/* Reviewer Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
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

      {/* Client Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
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

      {/* Date Range Pickers */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Box>
      </LocalizationProvider>

      {/* Report Type Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Cases / Revisions" />
        <Tab label="Feedback" />
      </Tabs>

      {/* When Feedback tab is active, show a dropdown to select feedback type */}
      {tabValue === 1 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
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
      )}

      {/* Generate Report Button */}
      <Button variant="contained" color="primary" fullWidth onClick={handleGenerateReport} sx={{ mb: 2 }}>
        Generate Report
      </Button>

      {/* Cases / Revisions Report Section */}
      {tabValue === 0 && reportResult && (
        <Box sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6">Report Results</Typography>
          <Typography>
            Total Estimated Cases (over {reportResult.periodDays} days): {Math.round(reportResult.totalCases)}
          </Typography>
          <Typography>
            Total Estimated Revision Requests: {Math.round(reportResult.revisionRequests)}{' '}
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
                  : '0.00';
                return (
                  <ListItem key={client} disablePadding>
                    <ListItemText primary={`${client}: ${Math.round(totals.totalCases)} cases, ${Math.round(totals.totalRevisions)} revisions (Rate: ${rate}%)`} />
                  </ListItem>
                );
              })}
            </List>
          </Box>
          {/* Overall Quality Score Section */}
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
          {/* Quality Score Trend Chart */}
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
          {/* Overall Late % Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Average Late %: {lateTrend.length > 0 ? lateTrend[0].latePercentage.toFixed(1) : "N/A"}%
            </Typography>
          </Box>
          {/* Late % Trend Chart with Indicator */}
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
          {/* Unified Charts Container: Wrap Quality, Late, and Per-Client Trend Charts */}
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
          {Object.keys(clientComments).length === 0 && Object.keys(qaComments).length === 0 ? (
            <Typography variant="body1">
              No feedback report generated. Click "Generate Report" to view data.
            </Typography>
          ) : selectedFeedbackType === 'client' ? (
            // For Client feedback: group by client type with copy buttons.
            <Box>
              {Object.entries(clientComments).map(([client, texts]) => (
                <Box key={client} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {client}:
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const textToCopy = texts.join('\n');
                        navigator.clipboard.writeText(textToCopy);
                      }}
                    >
                      Copy
                    </Button>
                  </Box>
                  <List dense>
                    {texts.map((text, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemText primary={text} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </Box>
          ) : (
            // For Internal feedback: simply list feedback.
            <Box>
              {qaComments["Internal Feedback"] && qaComments["Internal Feedback"].length > 0 ? (
                <List dense>
                  {qaComments["Internal Feedback"].map((text, i) => (
                    <ListItem key={i} disablePadding>
                      <ListItemText primary={text} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No internal feedback found.</Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Reports;
