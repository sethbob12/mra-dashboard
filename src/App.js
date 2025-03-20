// src/App.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CssBaseline, Button, Tooltip } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";

import liveIcon from "./assets/liveIcon.gif"; // Example live icon

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

// Mock data & ProtectedRoute
import FLData from "./FLData";
import FeedbackData from "./FeedbackData";
import QAData from "./QAData";
import ProtectedRoute from "./ProtectedRoute";
import apiService from "./apiService";

function App() {
  // Light/Dark mode
  const [mode, setMode] = useState("light");
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark" && {
            text: { primary: "#000" }
          })
        },
        typography: {
          allVariants: { color: mode === "dark" ? "#000" : "inherit" }
        }
      }),
    [mode]
  );

  // Data states
  const [reviewerData, setReviewerData] = useState(FLData);
  const [feedbackData, setFeedbackData] = useState(FeedbackData);
  const [qaData, setQaData] = useState(QAData);

  // Toggle for mock vs. live API
  const [useLiveApi, setUseLiveApi] = useState(false);

  // Data fetching
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleDataSource = () => {
    setUseLiveApi((prev) => !prev);
  };

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar mode={mode} toggleTheme={toggleTheme} />

      <Box sx={{ mt: 4, margin: "0 auto", maxWidth: 1600, width: "100%", px: 2 }}>
        <Box
          sx={{
            my: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "flex-start"
          }}
        >
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
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              {useLiveApi ? (
                <>
                  <Box
                    component="img"
                    src={liveIcon}
                    alt="Live Icon"
                    sx={{ width: 24, height: 24 }}
                  />
                  Using LIVE API Data
                </>
              ) : (
                "🟡 Using MOCK Data"
              )}
            </Button>
          </Tooltip>

          <Tooltip title="Refresh Data">
            <Button
              variant="text"
              onClick={fetchData}
              sx={{
                color: mode === "dark" ? "#fff" : "#000",
                fontWeight: 500,
                textTransform: "none",
                padding: "4px 8px",
                transition: "background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)"
                }
              }}
            >
              <RefreshIcon sx={{ mr: 1 }} />
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
    </ThemeProvider>
  );
}

export default App;
