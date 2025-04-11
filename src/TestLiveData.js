// src/TestLiveData.js
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Alert,
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import apiService from "./apiService";

const TestLiveData = ({ useLiveApi }) => {
  const theme = useTheme();

  // Column definitions
  const columns = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1, headerAlign: "left", align: "left" },
      { field: "email", headerName: "Email", flex: 1, headerAlign: "left", align: "left" },
      {
        field: "rate",
        headerName: "Rate (%)",
        type: "number",
        flex: 0.5,
        headerAlign: "right",
        align: "right",
      },
      {
        field: "cases",
        headerName: "Case Count",
        type: "number",
        flex: 0.5,
        headerAlign: "right",
        align: "right",
      },
    ],
    []
  );

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data when live mode toggles on
  useEffect(() => {
    if (!useLiveApi) {
      setLoading(false);
      setRows([]);
      return;
    }
    setLoading(true);
    apiService
      .fetchReviewerData("2025-01-01", "2025-01-03", false)
      .then((data) => {
        setRows(
          data.map((r, idx) => ({
            id: idx,
            name: r.Name,
            email: r.email,
            rate: r.Rate,
            cases: r.CaseCountSinceJan,
          }))
        );
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to retrieve live API data.");
      })
      .finally(() => setLoading(false));
  }, [useLiveApi]);

  if (!useLiveApi) {
    return (
      <Box p={2}>
        <Alert severity="info">
          No hardcoded data available here. Please toggle to <strong>LIVE API</strong> to view data.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: theme.palette.mode === "dark" ? "white" : "inherit" }}
      >
        Live API Data
      </Typography>
      <Paper
        elevation={4}
        sx={{
          height: "75vh",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: theme.palette.background.paper,
          // Global text color
          color: theme.palette.mode === "dark" ? "white" : "inherit",
          "& .MuiDataGrid-root": {
            border: "none",
            color: theme.palette.mode === "dark" ? "white" : "inherit",
          },
          // Header
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
            color: theme.palette.mode === "dark" ? "white" : "inherit",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            color: theme.palette.mode === "dark" ? "white" : "inherit",
          },
          // Rows
          "& .MuiDataGrid-cell": {
            color: theme.palette.mode === "dark" ? "white" : "inherit",
          },
          // Virtual scroller background
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.common.white,
          },
          // Footer and pagination
          "& .MuiDataGrid-footerContainer": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
          },
          "& .MuiTablePagination-root, .MuiTablePagination-caption, .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
            color: theme.palette.mode === "dark" ? "white" : "inherit",
          },
          "& .MuiSvgIcon-root": {
            color: theme.palette.mode === "dark" ? "white" : "inherit",
          },
          // Toolbar
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: theme.palette.mode === "dark" ? "white" : "inherit",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          disableSelectionOnClick
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>
    </Box>
  );
};

export default TestLiveData;
