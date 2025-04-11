// src/TestLiveData.js
import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import apiService from "./apiService";

const TestLiveData = ({ useLiveApi }) => {
  const theme = useTheme();
  const [data, setData] = useState([]); // Live API data array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect will run whenever useLiveApi changes
  useEffect(() => {
    // If not in live mode, do not fetch data.
    if (!useLiveApi) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);
    const fetchData = async () => {
      try {
        // Fetch live reviewer data. Adjust dates if needed.
        const result = await apiService.fetchReviewerData("2025-01-01", "2025-01-03", false);
        console.log("Fetched data:", result);
        setData(result);
      } catch (err) {
        console.error("Error fetching live API data:", err);
        setError("Failed to retrieve live API data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [useLiveApi]);

  // If not in live mode, display an Alert message.
  if (!useLiveApi) {
    return (
      <Box p={2}>
        <Alert severity="info">
          No hardcoded data available for this section. Please toggle the data source to
          <strong> LIVE API</strong> to view data.
        </Alert>
      </Box>
    );
  }

  // While loading, display a spinner.
  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // If an error occurred, show the error message.
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box p={2} sx={{ color: theme.palette.mode === "dark" ? "white" : "inherit" }}>
      <Typography variant="h5" gutterBottom>
        Live API Data
      </Typography>
      <Paper
        elevation={3}
        sx={{
          overflowX: "auto",
          borderRadius: 2,
          p: 2,
          backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#fff",
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="Live API Data Table">
          <TableHead
            sx={{
              backgroundColor: theme.palette.mode === "dark" ? "#616161" : "#f5f5f5",
              "& .MuiTableCell-root": {
                fontWeight: "bold",
                color: theme.palette.mode === "dark" ? "white" : "black",
              },
            }}
          >
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Case Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={row.email || index}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                  },
                }}
              >
                <TableCell sx={{ color: theme.palette.mode === "dark" ? "white" : "inherit" }}>
                  {row.Name}
                </TableCell>
                <TableCell sx={{ color: theme.palette.mode === "dark" ? "white" : "inherit" }}>
                  {row.email}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: theme.palette.mode === "dark" ? "white" : "inherit" }}
                >
                  {row.Rate}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: theme.palette.mode === "dark" ? "white" : "inherit" }}
                >
                  {row.CaseCountSinceJan}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TestLiveData;
