// src/RevisionAssignmentTool.js
import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Autocomplete
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import PersonIcon from "@mui/icons-material/Person";
import AdminFLData from "./AdminFLData";
import sampleCasesInfo from "./sampleCasesInfo";

dayjs.extend(utc);
dayjs.extend(timezone);

// Revision Types available
const revisionTypes = [
  { value: "correction", label: "Correction" },
  { value: "clarification", label: "Clarification" },
  { value: "addendum", label: "Addendum" }
];

// Hardcoded fake names for demonstration of FLQ
const fakeNames = ["Julie S.", "Juan B.", "Haniyah B.", "Resa P.", "Miranda P."];

// Helper for Revision Availability
function computeRevisionAvailability(writer, revisionType) {
  if (!writer.location || !writer.location.timezone) return "Unknown";
  if (revisionType === "addendum") return "Available";
  const localTime = dayjs().tz(writer.location.timezone);
  const localHour = localTime.hour();
  const localDay = localTime.day(); // Sunday = 0, Saturday = 6
  if (localDay >= 1 && localDay <= 5 && localHour >= 5 && localHour < 18) {
    return "Available";
  }
  return "Not Available";
}

// Helper for outline color
function getOutlineColor(writer, index) {
  if (index < 3) return "#66bb6a";
  const score = writer.compositeScore;
  if (score >= 90) return "#66bb6a";
  if (score >= 70) return "#FFA726";
  return "#F44336";
}

// Motion variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function RevisionAssignmentTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // State for the revision case
  const [newRevisionCase, setNewRevisionCase] = useState(null);
  // Manual filter states
  const [manualClient, setManualClient] = useState("PFR");
  const [manualRevisionType, setManualRevisionType] = useState("correction");
  const [manualMRAName, setManualMRAName] = useState("");

  // MRA names for the Autocomplete
  const mraNames = useMemo(() => {
    return AdminFLData.map((writer) => writer.name).sort();
  }, []);

  function generateRevisionCaseID() {
    const randomNum = Math.floor(30000 + Math.random() * 1000);
    return `${randomNum}-REV`;
  }

  // RANDOM REVISION IMPORT
  function importNewRevisionCase() {
    if (sampleCasesInfo.length === 0) return;
    const randomBase =
      sampleCasesInfo[Math.floor(Math.random() * sampleCasesInfo.length)];
    const randomRevisionType =
      revisionTypes[Math.floor(Math.random() * revisionTypes.length)].value;

    let assignedMRAName;
    // 25% chance to pick a fake name
    if (Math.random() < 0.25) {
      assignedMRAName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    } else {
      if (AdminFLData.length === 0) return;
      const randomWriter =
        AdminFLData[Math.floor(Math.random() * AdminFLData.length)];
      assignedMRAName = randomWriter.name;
    }

    const newCase = {
      revisionCaseID: generateRevisionCaseID(),
      claimantId: "DemoClaimantREV",
      client: randomBase.client,
      revisionType: randomRevisionType,
      assignedMRAName
    };
    setNewRevisionCase(newCase);
  }

  // MANUAL REVISION FILTER
  function optimizeRevisionAssignment() {
    if (!manualMRAName) {
      alert("Please enter an MRA name!");
      return;
    }
    const manualCase = {
      revisionCaseID: generateRevisionCaseID(),
      claimantId: "DemoClaimantREV",
      client: manualClient,
      revisionType: manualRevisionType,
      assignedMRAName: manualMRAName
    };
    setNewRevisionCase(manualCase);
  }

  // Clear selection
  function clearSelection() {
    setNewRevisionCase(null);
    setManualMRAName("");
  }

  // FLQ detection
  const isFLQ = useMemo(() => {
    if (!newRevisionCase || !newRevisionCase.assignedMRAName) return false;
    const names = AdminFLData.map((writer) => writer.name.toLowerCase());
    return !names.includes(newRevisionCase.assignedMRAName.toLowerCase());
  }, [newRevisionCase]);

  // Build candidates array
  const candidates = useMemo(() => {
    if (!newRevisionCase) return [];
    if (newRevisionCase.assignedMRAName) {
      const selected = AdminFLData.find(
        (writer) =>
          writer.name.toLowerCase() === newRevisionCase.assignedMRAName.toLowerCase()
      );
      if (selected) {
        const availability = computeRevisionAvailability(selected, newRevisionCase.revisionType);
        return [{ ...selected, revisionAvailability: availability }];
      }
      // Build a dummy candidate if not found
      return [
        {
          mra_id: "fake-" + newRevisionCase.assignedMRAName,
          name: newRevisionCase.assignedMRAName,
          overallQualityScore: 0,
          location: { timezone: dayjs.tz.guess() },
          clients: [],
          revisionAvailability: "Not Available",
          profilePic: null
        }
      ];
    }
    // Otherwise, if no assigned name, just map all
    return AdminFLData.map((writer) => {
      const availability = computeRevisionAvailability(writer, newRevisionCase.revisionType);
      return { ...writer, revisionAvailability: availability };
    });
  }, [newRevisionCase]);

  // Sort candidates
  const sortedCandidates = useMemo(() => {
    if (!newRevisionCase) return [];
    return [...candidates].sort((a, b) => {
      if (a.revisionAvailability === b.revisionAvailability) {
        return b.overallQualityScore - a.overallQualityScore;
      }
      return a.revisionAvailability === "Available" ? -1 : 1;
    });
  }, [candidates, newRevisionCase]);

  function handleCandidateClick(writer) {
    alert(
      `Detailed Data for ${writer.name}:\n` +
        `Quality Score: ${writer.overallQualityScore}\n` +
        `Revision Availability: ${writer.revisionAvailability}\n` +
        `Local Time: ${dayjs().tz(writer.location.timezone).format("h:mm A")}\n` +
        `Clients: ${writer.clients.join(", ")}`
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: -3, fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
      </Typography>

      {/* RANDOM REVISION IMPORT */}
      <Box sx={{ mb: 3, p: 2, border: "1px solid", borderColor: isDark ? "#fff" : "#ccc", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, color: isDark ? "#fff" : "#000" }}>
          Random Revision Import
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDark ? "#fff" : "#000" }}>
          Click the button below to generate a revision case that includes a specific MRA's name.
        </Typography>
        <Button variant="contained" onClick={importNewRevisionCase}>
          Random Revision Import
        </Button>
      </Box>

      {/* MANUAL REVISION FILTER */}
      <Box sx={{ mb: 3, p: 2, border: "1px solid", borderColor: isDark ? "#fff" : "#ccc", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, color: isDark ? "#fff" : "#000" }}>
          Manual Revision Filter
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDark ? "#fff" : "#000" }}>
          Enter the MRA name (select from list or type in), select the client and revision type (typically "Correction") to generate a case.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Autocomplete
            freeSolo
            options={mraNames}
            value={manualMRAName}
            onChange={(event, newValue) => {
              setManualMRAName(newValue || "");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="MRA Name"
                size="small"
                InputLabelProps={{ sx: { color: isDark ? "#fff" : "#000" } }}
                InputProps={{
                  ...params.InputProps,
                  sx: { color: isDark ? "#fff" : "#000" }
                }}
              />
            )}
            sx={{ minWidth: 250 }}
            PaperProps={{
              sx: {
                bgcolor: isDark ? "#424242" : "#fff",
                color: isDark ? "#fff" : "#000"
              }
            }}
            ListboxProps={{
              sx: {
                bgcolor: isDark ? "#424242" : "#fff",
                color: isDark ? "#fff" : "#000"
              }
            }}
          />
          <TextField
            select
            label="Client"
            size="small"
            value={manualClient}
            onChange={(e) => setManualClient(e.target.value)}
            InputLabelProps={{ sx: { color: isDark ? "#fff" : "#000" } }}
            InputProps={{ sx: { color: isDark ? "#fff" : "#000" } }}
            sx={{ minWidth: 120 }}
          >
            {["Lincoln", "PFR", "Hartford", "NYL", "LTC"].map((client) => (
              <MenuItem key={client} value={client} sx={{ color: isDark ? "#fff" : "#000" }}>
                {client}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Revision Type"
            size="small"
            value={manualRevisionType}
            onChange={(e) => setManualRevisionType(e.target.value)}
            InputLabelProps={{ sx: { color: isDark ? "#fff" : "#000" } }}
            InputProps={{ sx: { color: isDark ? "#fff" : "#000" } }}
            sx={{ minWidth: 150 }}
          >
            {revisionTypes.map((type) => (
              <MenuItem key={type.value} value={type.value} sx={{ color: isDark ? "#fff" : "#000" }}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={optimizeRevisionAssignment}>
            Manual Revision Filter
          </Button>
        </Box>
        <Button variant="outlined" onClick={clearSelection}>
          Clear Selection
        </Button>
      </Box>

      {/* Display Revision Case Details */}
      {newRevisionCase && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            border: "1px solid",
            borderColor: isDark ? "#fff" : "#ccc",
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#000" }}>
            Revision Case Details
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
            <strong>Case ID:</strong> {newRevisionCase.revisionCaseID}
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
            <strong>Claimant ID:</strong> {newRevisionCase.claimantId}
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
            <strong>Client:</strong> {newRevisionCase.client}
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
            <strong>Revision Type:</strong> {newRevisionCase.revisionType}
          </Typography>
          {newRevisionCase.assignedMRAName && (
            <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
              <strong>Assigned MRA:</strong> {newRevisionCase.assignedMRAName}
            </Typography>
          )}
          {isFLQ && (
            <Typography variant="body1" sx={{ color: "red", fontWeight: "bold" }}>
              Status: Unavailable (FLQ)
            </Typography>
          )}
        </Box>
      )}

      {/* Display Candidate List if a revision case exists (FLQ or not) */}
      {newRevisionCase && (
        <>
          <Typography variant="h5" sx={{ mb: 2, color: isDark ? "#fff" : "#000" }}>
            Revision Candidate
          </Typography>
          <Grid container spacing={2}>
            {sortedCandidates.map((writer, index) => {
              const availabilityColor =
                writer.revisionAvailability === "Available"
                  ? "green"
                  : writer.revisionAvailability === "Not Available"
                  ? "red"
                  : "gray";
              // If not available, force border to red.
              const borderColor =
                writer.revisionAvailability === "Not Available"
                  ? "red"
                  : getOutlineColor(writer, index);
              // Compute local time using writer's timezone (or guess if missing).
              const localTime =
                writer.location && writer.location.timezone
                  ? dayjs().tz(writer.location.timezone).format("h:mm A")
                  : "Unknown";
              // Determine decision text and background
              const decision =
                writer.revisionAvailability === "Available"
                  ? { text: "Send to MRA", bg: "#4caf50" }
                  : { text: "Send to QA", bg: "#f44336" };

              return (
                <Grid item key={writer.mra_id} xs={12} sm={6} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <motion.div
                      variants={cardVariants}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleCandidateClick(writer)}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: isDark ? "#424242" : "#fff",
                          color: isDark ? "#fff" : "#000",
                          border: `7px solid ${borderColor}`,
                          cursor: "pointer"
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ color: isDark ? "#fff" : "#000" }}
                          >
                            {writer.name}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {writer.profilePic ? (
                              <Box
                                component="img"
                                src={writer.profilePic}
                                alt="Profile"
                                sx={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: "50%",
                                  objectFit: "cover"
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: "50%",
                                  backgroundColor: isDark ? "#555" : "#ccc",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                              >
                                <PersonIcon />
                              </Box>
                            )}
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ color: isDark ? "#fff" : "#000" }}
                        >
                          <strong>Quality Score:</strong>{" "}
                          {writer.overallQualityScore}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: availabilityColor, mt: 1 }}
                        >
                          {writer.revisionAvailability}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: isDark ? "#fff" : "#000" }}
                        >
                          <strong>Local Time:</strong> {localTime}
                        </Typography>
                      </Paper>
                    </motion.div>
                    <ArrowForwardIcon
                      sx={{ fontSize: "2rem", color: isDark ? "#fff" : "#000" }}
                    />
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: decision.bg,
                        color: "#fff",
                        minWidth: 120,
                        textAlign: "center"
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {decision.text}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {/* Revision Availability Methodology */}
      {newRevisionCase && (
        <Box
          sx={{
            mt: 4,
            p: 2,
            background: isDark ? "#333" : "#f5f5f5",
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#000" }}>
            Revision Availability Methodology:
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
            For Corrections & Clarifications: Available if local time is between
            05:00 and 18:00 on Monday–Friday.
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
            For Addenda: Always available.
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
            If the assigned MRA is not found in our records, they are marked as
            Unavailable (FLQ).
          </Typography>
        </Box>
      )}
    </Box>
  );
}
