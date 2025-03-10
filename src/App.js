// src/App.js

import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CssBaseline, Button } from "@mui/material";

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

// ** Import all your mock data files **
import FLData from "./FLData";        // Mock reviewer data
import FeedbackData from "./FeedbackData";  // Mock feedback data
import QAData from "./QAData";        // <-- Mock QA data (NEW)

// The rest
import ProtectedRoute from "./ProtectedRoute";
import apiService from "./apiService";

function App() {
  // --- State to hold reviewer & feedback data ---
  const [reviewerData, setReviewerData] = useState(FLData); 
  const [feedbackData, setFeedbackData] = useState(FeedbackData);

  // ** NEW: State for QA data **
  const [qaData, setQaData] = useState(QAData);

  // --- Toggle for mock vs. live API ---
  const [useLiveApi, setUseLiveApi] = useState(false);

  // --- Fetch data on mount or when toggle changes ---
  useEffect(() => {
    const fetchData = async () => {
      if (useLiveApi) {
        console.log("🔄 Fetching LIVE API data...");
        try {
          // 1) Reviewer data
          const rData = await apiService.fetchReviewerData();

          // 2) Feedback data
          const fData = await apiService.fetchFeedbackData();

          // 3) QA data **(NEW)**
          const qData = await apiService.fetchQualityData();

          setReviewerData(rData);
          setFeedbackData(fData);
          setQaData(qData); // <-- store in state

          console.log("✅ Loaded live API data.");
        } catch (error) {
          console.error("❌ Error fetching live API data:", error);
          // Fallback to mock data
          setReviewerData(FLData);
          setFeedbackData(FeedbackData);
          setQaData(QAData); // fallback for QA
        }
      } else {
        console.log("🟡 Using MOCK data (FLData, FeedbackData, QAData).");
        setReviewerData(FLData);
        setFeedbackData(FeedbackData);
        setQaData(QAData); // <-- set QA to mock as well
      }
    };
    fetchData();
  }, [useLiveApi]);

  // --- Toggling data source ---
  const toggleDataSource = () => {
    setUseLiveApi((prev) => !prev);
  };

  return (
    <>
      <CssBaseline />
      <Navbar />

      <Box sx={{ mt: 4, margin: "0 auto", maxWidth: 1600, width: "100%", px: 2 }}>
        {/* Button to switch between mock & live data */}
        <Box sx={{ textAlign: "center", my: 2 }}>
          <Button
            variant="contained"
            color={useLiveApi ? "success" : "warning"}
            onClick={toggleDataSource}
          >
            {useLiveApi ? "🔄 Using LIVE API Data" : "🟡 Using MOCK Data"}
          </Button>
        </Box>

        <Routes>
          {/* Public route for login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          {/* Table view, passing reviewerData */}
          <Route
            path="/table"
            element={
              <ProtectedRoute>
                <FLTable data={reviewerData} />
              </ProtectedRoute>
            }
          />

          {/* Chart view, passing reviewerData */}
          <Route
            path="/chart"
            element={
              <ProtectedRoute>
                <FLChart data={reviewerData} />
              </ProtectedRoute>
            }
          />

          {/* Email list, passing reviewerData */}
          <Route
            path="/emails"
            element={
              <ProtectedRoute>
                <EmailListGenerator data={reviewerData} />
              </ProtectedRoute>
            }
          />

          {/* QA Feedback, passing feedbackData */}
          <Route
            path="/qa-feedback"
            element={
              <ProtectedRoute>
                <QAFeedbackAggregator feedbackData={feedbackData} />
              </ProtectedRoute>
            }
          />

          {/* Client Feedback, passing feedbackData */}
          <Route
            path="/client-feedback"
            element={
              <ProtectedRoute>
                <ClientFeedbackAggregator feedbackData={feedbackData} />
              </ProtectedRoute>
            }
          />

          {/* Reports, passing both reviewerData & feedbackData */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports reviewerData={reviewerData} feedbackData={feedbackData} />
              </ProtectedRoute>
            }
          />

          {/* QA Metrics, NOW passing qaData & feedbackData */}
          <Route
            path="/qa-metrics"
            element={
              <ProtectedRoute>
                <QAMetrics
                  qaData={qaData}
                  feedbackData={feedbackData}  // if needed
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </>
  );
}

export default App;
