// src/App.js

import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CssBaseline, Button, Tooltip } from "@mui/material";

import Navbar from "./Navbar";
import Home from "./Home";
import FLTable from "./FLTable";
import FLChart from "./FLChart";
import EmailListGenerator from "./EmailListGenerator";
import QAFeedbackAggregator from "./QAFeedbackAggregator";
import ClientFeedbackAggregator from "./ClientFeedbackAggregator";
import Reports from "./Reports";
import QAMetrics from "./QAMetrics";
import LoginPage from "./LoginPage";

// Import mock data files
import FLData from "./FLData";        // Mock reviewer data
import FeedbackData from "./FeedbackData";  // Mock feedback data
import QAData from "./QAData";        // Mock QA data

import ProtectedRoute from "./ProtectedRoute";
import apiService from "./apiService";

function App() {
  // State to hold reviewer, feedback, and QA data
  const [reviewerData, setReviewerData] = useState(FLData);
  const [feedbackData, setFeedbackData] = useState(FeedbackData);
  const [qaData, setQaData] = useState(QAData);

  // Toggle for mock vs. live API
  const [useLiveApi, setUseLiveApi] = useState(false);

  // Define fetchData with useCallback so it remains stable
  const fetchData = useCallback(async () => {
    if (useLiveApi) {
      console.log("🔄 Fetching LIVE API data...");
      try {
        const rData = await apiService.fetchReviewerData();
        const fData = await apiService.fetchFeedbackData();
        const qData = await apiService.fetchQualityData();
        setReviewerData(rData);
        setFeedbackData(fData);
        setQaData(qData);
        console.log("✅ Loaded live API data.");
      } catch (error) {
        console.error("❌ Error fetching live API data:", error);
        // Fallback to mock data on error
        setReviewerData(FLData);
        setFeedbackData(FeedbackData);
        setQaData(QAData);
      }
    } else {
      console.log("🟡 Using MOCK data (FLData, FeedbackData, QAData).");
      setReviewerData(FLData);
      setFeedbackData(FeedbackData);
      setQaData(QAData);
    }
  }, [useLiveApi]);

  // Fetch data on mount and when toggle changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle the data source (mock vs. live)
  const toggleDataSource = () => {
    setUseLiveApi((prev) => !prev);
  };

  return (
    <>
      <CssBaseline />
      <Navbar />
      <Box sx={{ mt: 4, margin: "0 auto", maxWidth: 1600, width: "100%", px: 2 }}>
        <Box sx={{ textAlign: "center", my: 2 }}>
          <Tooltip
            title={
              useLiveApi
                ? "Live API: Data is fetched from a publicly hosted json-server; actual DB API endpoint will eventually replace."
                : "Mock Data: Local static data is used for testing."
            }
          >
            <Button
              variant="contained"
              color={useLiveApi ? "success" : "warning"}
              onClick={toggleDataSource}
            >
              {useLiveApi ? "🔄 Using LIVE API Data" : "🟡 Using MOCK Data"}
            </Button>
          </Tooltip>
          <Tooltip title="Click to refresh data from the current source">
            <Button variant="outlined" sx={{ ml: 2 }} onClick={fetchData}>
              Refresh Data
            </Button>
          </Tooltip>
        </Box>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route
            path="/table"
            element={
              <ProtectedRoute>
                <FLTable data={reviewerData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chart"
            element={
              <ProtectedRoute>
                <FLChart data={reviewerData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emails"
            element={
              <ProtectedRoute>
                <EmailListGenerator data={reviewerData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa-feedback"
            element={
              <ProtectedRoute>
                <QAFeedbackAggregator feedbackData={feedbackData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-feedback"
            element={
              <ProtectedRoute>
                <ClientFeedbackAggregator feedbackData={feedbackData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports reviewerData={reviewerData} feedbackData={feedbackData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa-metrics"
            element={
              <ProtectedRoute>
                <QAMetrics qaData={qaData} feedbackData={feedbackData} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </>
  );
}

export default App;
