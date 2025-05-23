// src/BillingReports.js
import React, { useState, useMemo } from "react";
import billingCases from "./billingCases";
import billingMRAReports from "./billingMRAReports";
import billingSLReports from "./billingSLReports";
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  TableSortLabel,
  TablePagination,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import GetAppIcon from "@mui/icons-material/GetApp";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTheme } from "@mui/material/styles";

// --- sorting helpers ---
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
function stableSort(array, comparator) {
  const stabilized = array.map((el, idx) => [el, idx]);
  stabilized.sort((a, b) => {
    const cmp = comparator(a[0], b[0]);
    return cmp !== 0 ? cmp : a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

// --- cost‐rating helpers ---
const mraRating = (cost) => {
  if (cost == null || cost === "") return { count: 0, color: "" };
  const count = cost < 20 ? 1 : cost <= 25 ? 2 : 3;
  const colors = { 1: "#4caf50", 2: "#8bc34a", 3: "#ffb300" };
  return { count, color: colors[count] };
};
const slRating = (cost) => {
  if (cost == null || cost === "") return { count: 0, color: "" };
  let count;
  if (cost < 20) count = 1;
  else if (cost < 30) count = 2;
  else if (cost < 50) count = 3;
  else if (cost < 200) count = 4;
  else count = 5;
  const colors = {
    1: "#4caf50",
    2: "#8bc34a",
    3: "#ffb300",
    4: "#ff5722",
    5: "#f44336",
  };
  return { count, color: colors[count] };
};

// --- status color mapping ---
const statusColor = {
  Released: "#4caf50",
  QA: "#ffeb3b",
  Pending: "#ff9800",
  MRA: "#e91e63",
};

const PIE_COLORS = [
  "#4caf50",
  "#8bc34a",
  "#ffb300",
  "#ff5722",
  "#f44336",
  "#03a9f4",
  "#9c27b0",
  "#e91e63",
  "#00bcd4",
  "#ffc107",
];

export default function BillingReports() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const today = new Date().toISOString().slice(0, 10);

  // State
  const [findCaseId, setFindCaseId] = useState("5-");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState(today);
  const [selectedMra, setSelectedMra] = useState("");
  const [selectedSl, setSelectedSl] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("submittedAt");
  const [page, setPage] = useState(0);
  const rowsPerPage = 500;

  const [ledger, setLedger] = useState(null);
  const [foundCase, setFoundCase] = useState(null);
  const [showCaseTable, setShowCaseTable] = useState(false);
  const [showDailyCostChart, setShowDailyCostChart] = useState(false);

  // Enrich and normalize cases with MRA/SL costs
  const enhanced = useMemo(() => {
    return billingCases.map((c, idx) => {
      const mra = billingMRAReports.find((m) => m.name === c.mra) || {};
      const validClients = Array.isArray(mra.clients) ? mra.clients : [];
      const client = validClients.includes(c.client)
        ? c.client
        : validClients[0] || c.client;
      const mraCost = mra.costPerCase?.[client] ?? "";
      const sl = billingSLReports[idx % billingSLReports.length] || {};
      let slCost = "";
      if (sl.costPerCase != null) {
        slCost =
          typeof sl.costPerCase === "object"
            ? sl.costPerCase[client] ?? ""
            : sl.costPerCase;
      }
      return { ...c, client, mraCost, sl: sl.name || "", slCost };
    });
  }, []);

  // Dropdown options
  const mraOptions = useMemo(
    () => ["All", ...new Set(enhanced.map((c) => c.mra))].sort(),
    [enhanced]
  );
  const slOptions = useMemo(
    () => ["All", ...new Set(enhanced.map((c) => c.sl))].sort(),
    [enhanced]
  );

  // Filtering by date/MRA/SL
  const filtered = useMemo(() => {
    return enhanced
      .filter(
        (c) =>
          (!startDate || c.submittedAt >= startDate) &&
          (!endDate || c.submittedAt <= endDate)
      )
      .filter((c) =>
        selectedMra && selectedMra !== "All" ? c.mra === selectedMra : true
      )
      .filter((c) =>
        selectedSl && selectedSl !== "All" ? c.sl === selectedSl : true
      );
  }, [enhanced, startDate, endDate, selectedMra, selectedSl]);

  // Daily cost chart data
  const dailyCostData = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      const day = r.submittedAt.slice(0, 10);
      if (!map[day]) map[day] = { date: day, mraCost: 0, slCost: 0 };
      map[day].mraCost += Number(r.mraCost) || 0;
      map[day].slCost += Number(r.slCost) || 0;
    });
    return Object.values(map).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [filtered]);

  // Sorting & pagination
  const sorted = useMemo(
    () => stableSort(filtered, getComparator(order, orderBy)),
    [filtered, order, orderBy]
  );
  const pageCount = Math.ceil(sorted.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page]);

  // CSV export helper
  const exportCSV = (data, filename) => {
    if (!data?.length) return;
    const header = Object.keys(data[0]);
    const rows = data.map((r) => header.map((f) => r[f]));
    let csv =
      header.join(",") +
      "\n" +
      rows
        .map((row) => row.map((f) => `"${f}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Find case handler
  const findCase = () => {
    const c = enhanced.find(
      (x) => x.caseID.toLowerCase() === findCaseId.toLowerCase()
    );
    setFoundCase(c || null);
  };

  // Generate payment ledger
  const generateLedger = () => {
    if (selectedMra && selectedSl) {
      alert("Please select either an MRA or an SL, not both.");
      return;
    }
    const includeStatus = selectedSl
      ? ["Released"]
      : ["Released", "QA", "Pending"];
    const submitted = filtered.filter((r) =>
      includeStatus.includes(r.status)
    );
    const totalAssigned = filtered.length;
    const totalSubmitted = submitted.length;

    const byClient = {};
    submitted.forEach((r) => {
      const costPerCase = selectedSl ? r.slCost : r.mraCost;
      if (!byClient[r.client]) {
        byClient[r.client] = { costPerCase, count: 0 };
      }
      byClient[r.client].count++;
    });
    const clientStats = Object.entries(byClient).map(
      ([client, { costPerCase, count }]) => ({
        client,
        costPerCase,
        count,
        totalCost: (Number(costPerCase) || 0) * count,
      })
    );
    const totalPayment = clientStats.reduce(
      (sum, cs) => sum + cs.totalCost,
      0
    );

    const monthlyMap = {};
    submitted.forEach((r) => {
      const month = r.submittedAt.slice(0, 7);
      const cost = Number(selectedSl ? r.slCost : r.mraCost) || 0;
      monthlyMap[month] = (monthlyMap[month] || 0) + cost;
    });
    const monthlyStats = Object.entries(monthlyMap)
      .sort()
      .map(([month, totalCost]) => ({ month, totalCost }));

    setLedger({
      dateRange: { startDate, endDate },
      totalAssigned,
      totalSubmitted,
      clientStats,
      totalPayment,
      monthlyStats,
    });

    setTimeout(() => {
      document
        .getElementById("ledger-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Clear everything
  const clearAll = () => {
    setFindCaseId("5-");
    setStartDate("2025-01-01");
    setEndDate(today);
    setSelectedMra("");
    setSelectedSl("");
    setPage(0);
    setLedger(null);
    setFoundCase(null);
    setShowCaseTable(false);
    setShowDailyCostChart(false);
  };

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: isDark ? "#121212" : "inherit",
        color: isDark ? "#fff" : "inherit",
      }}
    >
      {/* 1) Find Case */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          label="Case ID"
          value={findCaseId}
          onChange={(e) => setFindCaseId(e.target.value)}
          size="small"
          InputLabelProps={{
            sx: { color: isDark ? "#fff" : "inherit" },
          }}
          InputProps={{
            sx: { color: isDark ? "#fff" : "inherit" },
          }}
        />
        <Button variant="contained" onClick={findCase}>
          Find Case
        </Button>
      </Box>

      {/* Found Case Output */}
      {foundCase && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            maxWidth: 500,
            bgcolor: isDark ? "#1e1e1e" : "inherit",
          }}
        >
          <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
            <strong>Case ID:</strong> {foundCase.caseID}
          </Typography>
          <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
            <strong>Submitted:</strong> {foundCase.submittedAt}
          </Typography>
          <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
            <strong>Status:</strong>{" "}
            <Box
              component="span"
              sx={{
                color:
                  statusColor[foundCase.status.trim()] ||
                  (isDark ? "#fff" : "inherit"),
                fontWeight: "bold",
              }}
            >
              {foundCase.status}
            </Box>
          </Typography>
          <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
            <strong>Client:</strong> {foundCase.client}
          </Typography>
          <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
            <strong>MRA:</strong> {foundCase.mra}
          </Typography>
          <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
            <strong>SL:</strong> {foundCase.sl}
          </Typography>
        </Paper>
      )}

      {/* 2) Filters + Generate */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 1,
          alignItems: "center",
        }}
      >
        {/* MRA */}
        <FormControl
          size="small"
          sx={{
            minWidth: 160,
            ...(isDark && {
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#555",
              },
              "& .MuiSelect-icon": { color: "#fff" },
            }),
          }}
        >
          <InputLabel sx={{ color: isDark ? "#fff" : "inherit" }}>
            MRA
          </InputLabel>
          <Select
            value={selectedMra}
            label="MRA"
            onChange={(e) => {
              setSelectedMra(e.target.value);
              if (e.target.value !== "All") setSelectedSl("");
            }}
            sx={{ color: isDark ? "#fff" : "inherit" }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: isDark ? "#333" : "#fff",
                  color: isDark ? "#fff" : "inherit",
                },
              },
            }}
          >
            <MenuItem value="">
              <em></em>
            </MenuItem>
            {mraOptions.map((m) => (
              <MenuItem
                key={m}
                value={m}
                sx={{ color: isDark ? "#fff" : "inherit" }}
              >
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>or</Typography>

        {/* SL */}
        <FormControl
          size="small"
          sx={{
            minWidth: 160,
            ...(isDark && {
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#555",
              },
              "& .MuiSelect-icon": { color: "#fff" },
            }),
          }}
        >
          <InputLabel sx={{ color: isDark ? "#fff" : "inherit" }}>
            SL
          </InputLabel>
          <Select
            value={selectedSl}
            label="SL"
            onChange={(e) => {
              setSelectedSl(e.target.value);
              if (e.target.value !== "All") setSelectedMra("");
            }}
            sx={{ color: isDark ? "#fff" : "inherit" }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: isDark ? "#333" : "#fff",
                  color: isDark ? "#fff" : "inherit",
                },
              },
            }}
          >
            <MenuItem value="">
              <em></em>
            </MenuItem>
            {slOptions.map((s) => (
              <MenuItem
                key={s}
                value={s}
                sx={{ color: isDark ? "#fff" : "inherit" }}
              >
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Pickers */}
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
            sx: { color: isDark ? "#fff" : "inherit" },
          }}
          InputProps={{
            sx: { color: isDark ? "#fff" : "inherit" },
          }}
          size="small"
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
            sx: { color: isDark ? "#fff" : "inherit" },
          }}
          InputProps={{
            sx: { color: isDark ? "#fff" : "inherit" },
          }}
          size="small"
        />

        <Button
          variant="contained"
          color="secondary"
          onClick={() => setShowCaseTable(true)}
        >
          Generate Case/Cost Info
        </Button>
        <Button variant="contained" color="primary" onClick={generateLedger}>
          Generate Payment Ledger
        </Button>
      </Box>

      {/* Clear All */}
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={clearAll}>
          Clear All
        </Button>
      </Box>

      {/* 3) Ledger */}
      {ledger && (
        <Paper
          id="ledger-section"
          sx={{
            mb: 3,
            p: 2,
            bgcolor: isDark ? "#1e1e1e" : "#f9f9f9",
          }}>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                color: isDark ? "#fff" : "inherit",
              }}
            >
              Payment Ledger
            </Typography>
            <Button
              size="small"
              color="success"
              startIcon={<GetAppIcon />}
              onClick={() =>
                exportCSV(
                  ledger.clientStats.map((cs) => ({
                    Client: cs.client,
                    "Cost/Case": cs.costPerCase,
                    Count: cs.count,
                    "Total Cost": cs.totalCost.toFixed(2),
                  })),
                  "payment_ledger.csv"
                )
              }
            >
              CSV
            </Button>
          </Box>
          <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
            <strong>Date Range:</strong> {ledger.dateRange.startDate} to{" "}
            {ledger.dateRange.endDate}
          </Typography>
          <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
            <strong>Total Assigned:</strong> {ledger.totalAssigned}
          </Typography>
          <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
            <strong>Total Submitted:</strong> {ledger.totalSubmitted}
          </Typography>
          <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
            <strong>Total Payment:</strong> $
            {ledger.totalPayment.toFixed(2)}
          </Typography>
          <Divider sx={{ my: 1, borderColor: "#555" }} />

          <Box
            sx={{
              display: "flex",
              gap: 4,
              flexWrap: "nowrap",
              overflowX: "auto",
            }}
          >
            {/* Ledger Table */}
            <Box sx={{ minWidth: 250, flex: 1 }}>
              <Table
                size="small"
                sx={{
                  "& th, & td": {
                    py: 0.5,
                    px: 0.5,
                    color: isDark ? "#fff" : "inherit",
                    borderColor: isDark ? "#555" : "inherit",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell align="right">Cost/Case</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledger.clientStats.map((cs) => (
                    <TableRow key={cs.client}>
                      <TableCell>{cs.client}</TableCell>
                      <TableCell align="right">${cs.costPerCase}</TableCell>
                      <TableCell align="right">{cs.count}</TableCell>
                      <TableCell align="right">
                        ${cs.totalCost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                    <TableCell />
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {ledger.clientStats.reduce((sum, cs) => sum + cs.count, 0)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      ${ledger.totalPayment.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </Box>

            {/* Pie Chart */}
            <Box sx={{ width: 250, height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={ledger.clientStats}
                    dataKey="count"
                    nameKey="client"
                    outerRadius={80}
                    label
                  >
                    {ledger.clientStats.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name, entry) => [
                      `${value} cases`,
                      `${entry.payload.client}: $${entry.payload.totalCost.toFixed(
                        2
                      )}`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Monthly Cost Line Chart */}
            <Box sx={{ width: 325, height: 225 }}>
              <ResponsiveContainer>
                <LineChart data={ledger.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: isDark ? "#fff" : "inherit" }}
                  />
                  <YAxis tick={{ fill: isDark ? "#fff" : "inherit" }} />
                  <RechartsTooltip formatter={(val) => `$${val.toFixed(2)}`} />
                  <Legend wrapperStyle={{ color: isDark ? "#fff" : "#000" }} />
                  <Line
                    type="monotone"
                    dataKey="totalCost"
                    stroke="#8884d8"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Monthly Table */}
            <Box sx={{ minWidth: 250 }}>
              <Table
                size="small"
                sx={{
                  "& th, & td": {
                    py: 0.5,
                    px: 0.5,
                    color: isDark ? "#fff" : "inherit",
                    borderColor: isDark ? "#555" : "inherit",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Total Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledger.monthlyStats.map((ms) => (
                    <TableRow key={ms.month}>
                      <TableCell>{ms.month}</TableCell>
                      <TableCell align="right">
                        ${ms.totalCost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      $
                      {ledger.monthlyStats
                        .reduce((sum, ms) => sum + ms.totalCost, 0)
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </Box>
          </Box>
        </Paper>
      )}

      {/* 4) Main Table */}
      {showCaseTable && (
        <>
          {/* CSV + Chart + Pagination Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                size="small"
                color="success"
                startIcon={<GetAppIcon />}
                onClick={() => exportCSV(sorted, "billing_reports.csv")}
              >
                CSV
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowDailyCostChart((v) => !v)}
              >
                {showDailyCostChart ? "Hide Cost Chart" : "Show Cost Chart"}
              </Button>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
                sx={{ color: isDark ? "#fff" : "inherit" }}
              >
                <NavigateBeforeIcon />
              </IconButton>
              <Typography sx={{ color: isDark ? "#fff" : "inherit" }}>
                Page {page + 1} of {pageCount || 1}
              </Typography>
              <IconButton
                onClick={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
                disabled={page + 1 >= pageCount}
                sx={{ color: isDark ? "#fff" : "inherit" }}
              >
                <NavigateNextIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Daily Cost Chart */}
          {showDailyCostChart && (
            <Box sx={{ width: "100%", height: 300, mb: 2 }}>
              <ResponsiveContainer>
                <LineChart data={dailyCostData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: isDark ? "#fff" : "inherit" }}
                  />
                  <YAxis tick={{ fill: isDark ? "#fff" : "inherit" }} />
                  <RechartsTooltip formatter={(val) => `$${val.toFixed(2)}`} />
                  <Legend wrapperStyle={{ color: isDark ? "#fff" : "#000" }} />
                  <Line
                    type="monotone"
                    dataKey="mraCost"
                    name="MRA Cost"
                    stroke="#8884d8"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="slCost"
                    name="SL Cost"
                    stroke="#82ca9d"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

<Table
  size="small"
  sx={{
    "& th, & td": {
      py: 0.75,
      whiteSpace: "nowrap",
      color: isDark ? "#fff" : "inherit",
      borderColor: isDark ? "#555" : "inherit",
    },
  }}
>
  <TableHead>
    <TableRow>
      {[
        { id: "caseID", label: "Case ID" },
        { id: "submittedAt", label: "Submitted" },
        { id: "status", label: "Status" },
        { id: "client", label: "Client", width: 80 },
        { id: "mra", label: "MRA" },
        { id: "mraCost", label: "MRA Cost" },
        { id: "sl", label: "SL" },
        { id: "slCost", label: "SL Cost" },
      ].map((col, idx) => {
        const isSubmitted = col.id === "submittedAt";
      
        return (
          <TableCell
            key={col.id}
            sortDirection={orderBy === col.id ? order : false}
            sx={{
              borderRight: idx === 3 ? "2px solid #ccc" : undefined,
              px: ["mra", "mraCost", "sl", "slCost"].includes(col.id) ? 0.5 : 1,
              ...(col.width && { width: col.width }),
              color: isDark ? "#fff" : "inherit",    // base cell color
            }}
          >
            <TableSortLabel
              active={orderBy === col.id}
              direction={orderBy === col.id ? order : "asc"}
              onClick={() => {
                const isAsc = orderBy === col.id && order === "asc";
                setOrder(isAsc ? "desc" : "asc");
                setOrderBy(col.id);
              }}
              sx={{
                // force the label & icon to white only for "Submitted"
                "&, & .MuiTableSortLabel-label, & .MuiTableSortLabel-icon": {
                  color:
                    isSubmitted && isDark
                      ? "#fff !important"
                      : "inherit",
                },
              }}
            >
              {col.label}
            </TableSortLabel>
          </TableCell>
        );
      })}
    </TableRow>
  </TableHead>
            <TableBody>
              {paginated.map((row) => {
                const mraBar = mraRating(row.mraCost);
                const slBar = slRating(row.slCost);
                return (
                  <TableRow key={row.caseID}>
                    <TableCell>{row.caseID}</TableCell>
                    <TableCell>{row.submittedAt}</TableCell>
                    {/* STATUS CELL COLOR‐CODED */}
                    <TableCell
  sx={{
    color: `${statusColor[row.status.trim()] || (isDark ? "#fff" : "#000")} !important`,
    fontWeight: "bold",
  }}
>
  {row.status}
</TableCell>
                    <TableCell
                      sx={{ borderRight: "2px solid #eee", width: 80, px: 0.5 }}
                    >
                      {row.client}
                    </TableCell>
                    <TableCell sx={{ px: 0.5 }}>{row.mra}</TableCell>
                    <TableCell sx={{ px: 0.5 }}>
                      {row.mraCost !== "" ? `$${row.mraCost}` : "—"}
                      {mraBar.count > 0 && (
                        <Typography
                          component="span"
                          sx={{ color: mraBar.color, ml: 0.5 }}
                        >
                          {"$".repeat(mraBar.count)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ px: 0.5 }}>{row.sl}</TableCell>
                    <TableCell sx={{ px: 0.5 }}>
                      {row.slCost !== "" ? `$${row.slCost}` : "—"}
                      {slBar.count > 0 && (
                        <Typography
                          component="span"
                          sx={{ color: slBar.color, ml: 0.5 }}
                        >
                          {"$".repeat(slBar.count)}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={sorted.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
            sx={{
              color: isDark ? "#fff" : "inherit",
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                { color: isDark ? "#fff" : "inherit" },
              "& .MuiTablePagination-actions": {
                color: isDark ? "#fff" : "inherit",
              },
            }}
          />
        </>
      )}

      {/* Floating Scroll Buttons */}
      <IconButton
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          position: "fixed",
          top: "50%",
          right: 16,
          transform: "translateY(-110%)",
          bgcolor: "#1976d2",
          color: "#fff",
          "&:hover": { bgcolor: "#115293" },
        }}
      >
        <ArrowUpwardIcon />
      </IconButton>
      <IconButton
        onClick={() =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
        }
        sx={{
          position: "fixed",
          top: "50%",
          right: 16,
          transform: "translateY(10%)",
          bgcolor: "#1976d2",
          color: "#fff",
          "&:hover": { bgcolor: "#115293" },
        }}
      >
        <ArrowDownwardIcon />
      </IconButton>
    </Box>
  );
}