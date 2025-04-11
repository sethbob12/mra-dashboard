// src/App.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CssBaseline, Button, Tooltip, Typography } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";

import liveIcon from "./assets/liveIcon.gif";

import Navbar from "./Navbar";
import ThemeToggleSwitch from "./ThemeToggleSwitch";
import Home from "./Home";
import FLTable from "./FLTable";
import FLChart from "./FLChart";
import EmailListGenerator from "./EmailListGenerator";
import QAFeedbackAggregator from "./QAFeedbackAggregator";
import ClientFeedbackAggregator from "./ClientFeedbackAggregator";
import Reports from "./Reports";
import QAMetrics from "./QAMetrics";
import AdminTools from "./AdminTools";
import LoginPage from "./LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import apiService from "./apiService";

// Import mock master and transactional data
import FLMasterData from "./FLMasterData";
import FLTransactionalData from "./FLTransactionalData";

// Import new test component for live API data display
import TestLiveData from "./TestLiveData";

function App() {
  const [mode, setMode] = useState("light");
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark" && {
            text: { primary: "#000" },
          }),
        },
        typography: {
          allVariants: { color: mode === "dark" ? "#000" : "inherit" },
        },
      }),
    [mode]
  );

  const [useLiveApi, setUseLiveApi] = useState(false);
  const [reviewerData, setReviewerData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [qaData, setQaData] = useState([]);

  // Transformation function: converts live API reviewer data into the structure our components expect
  const transformLiveReviewerData = (liveData) => {
    return liveData.map((item) => ({
      mra_id: item.email, // Using email as a unique identifier (adjust if you have an explicit ID)
      name: item.Name,
      rate: item.Rate,
      email: item.email,
      caseCountSinceJan: item.CaseCountSinceJan,
      // Create a dummy snapshot for compatibility with components expecting a nested snapshots array.
      snapshots: [
        {
          totalCases: item.CaseCountSinceJan,
          // Additional derived metrics can be added here if needed.
        },
      ],
    }));
  };

  const fetchData = useCallback(async () => {
    if (useLiveApi) {
      console.log("🔄 Fetching LIVE API data...");
      try {
        // Retrieve reviewer data from live API
        const liveReviewerData = await apiService.fetchReviewerData("2025-01-01", "2025-01-03");
        const transformedReviewerData = transformLiveReviewerData(liveReviewerData);
        // Retrieve other data sets as needed
        const fData = await apiService.fetchFeedbackData();
        const qData = await apiService.fetchQualityData();
        setReviewerData(transformedReviewerData);
        setFeedbackData(fData);
        setQaData(qData);
        console.log("✅ Live data loaded and transformed.");
      } catch (error) {
        console.error("❌ Error fetching live API data:", error);
      }
    } else {
      console.log("🟡 Using MOCK data (FLMasterData + FLTransactionalData).");
      const merged = FLMasterData.map((master) => {
        const trans = FLTransactionalData.find((t) => t.mra_id === master.mra_id);
        if (trans) {
          const casesPast30Days = Object.values(trans.casesByClient).reduce(
            (acc, val) => acc + val,
            0
          );
          const snapshot = {
            snapshotDate: trans.snapshotDate,
            totalCases: trans.totalCases,
            casesPast30Days,
            avgCasesPerDay: trans.avgCasesDay,
            revisionRate: trans.revisionRate,
            lateCasePercentage: trans.lateCasePercentage,
          };
          return { ...master, snapshots: [snapshot] };
        }
        return master;
      });
      setReviewerData(merged);
      setFeedbackData([]);
      setQaData([]);
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

      <Box
        sx={{
          position: "relative",
          mt: 4,
          margin: "0 auto",
          maxWidth: 1600,
          width: "100%",
          px: 2,
        }}
      >
        {/* Top-right controls */}
        <Box
          sx={{
            position: "absolute",
            top: -10,
            right: 25,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.1,
          }}
        >
          <Box
            sx={{
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.1)" },
            }}
          >
            <ThemeToggleSwitch checked={mode === "dark"} onChange={toggleTheme} size={34} />
          </Box>
          <Typography variant="caption" sx={{ color: mode === "dark" ? "#fff" : "#000", mt: 0 }}>
            {mode === "dark" ? "Dark Mode" : "Light Mode"}
          </Typography>
        </Box>

        {/* Data source and refresh controls */}
        <Box
          sx={{
            my: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "flex-start",
          }}
        >
          <Tooltip
            title={
              useLiveApi
                ? "Live API: Fetches real-time data from your internal system."
                : "Mock Data: Uses hardcoded reviewer and snapshot data."
            }
          >
            <Button
              variant="contained"
              color={useLiveApi ? "success" : "warning"}
              onClick={toggleDataSource}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
                  backgroundColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                },
              }}
            >
              <RefreshIcon sx={{ mr: 1 }} />
              Refresh Data
            </Button>
          </Tooltip>
        </Box>

        {/* App Routes */}
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
          <Route
            path="/admin-tools"
            element={
              <ProtectedRoute>
                <AdminTools />
              </ProtectedRoute>
            }
          />
          {/* New test route for verifying live API data */}
          <Route
  path="/test-live"
  element={
    <ProtectedRoute>
      <TestLiveData useLiveApi={useLiveApi} />
    </ProtectedRoute>
  }
/>
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;
