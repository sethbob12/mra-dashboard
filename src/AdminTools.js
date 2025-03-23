// src/AdminTools.js
import React, { useState, useMemo } from "react";
import { TextField, MenuItem, Box, Button, Typography, Grid, Paper, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonIcon from "@mui/icons-material/Person";
import { motion, AnimatePresence } from "framer-motion";

import AdminFLData from "./AdminFLData";
import sampleCasesInfo from "./sampleCasesInfo";

/* 
  1) getOutlineColor: 
     - Top 3 always green
     - Others: green if ≥ 90, orange if 70–89.99, red if < 70
*/
function getOutlineColor(writer, index) {
  if (index < 3) {
    return "#66bb6a";
  }
  const score = writer.compositeScore;
  if (score >= 90) return "#66bb6a";
  if (score >= 70) return "#FFA726";
  return "#F44336";
}

/*
  2) getCaseLoad:
     - <700 pages => 1
     - 700–999 => 1.5
     - 1000+ => 2
*/
function getCaseLoad(caseLength) {
  if (caseLength >= 1000) return 2;
  if (caseLength >= 700) return 1.5;
  return 1;
}

/*
  3) Filtering Functions
*/
// Define psych specialties for new cases (in lower case)
const psychSpecialties = ["psychiatry", "psychology", "neuropsychology"];

/**
 * filterByCaseTypeDetailed:
 * - If the new case’s caseType (lowercased) is one of "psychiatry", "psychology", or "neuropsychology",
 *   then only allow writers whose caseType (lowercased) is exactly "psych" or "both".
 * - Otherwise, allow only writers whose caseType is exactly "non-psych" or "both".
 */
function filterByCaseTypeDetailed(writer, newCase) {
  const writerType = writer.caseType.toLowerCase();
  const caseTypeLower = newCase.caseType.toLowerCase();
  const isCasePsych = psychSpecialties.includes(caseTypeLower);
  if (isCasePsych) {
    if (writerType === "psych" || writerType === "both") {
      return { passed: true };
    }
    return { passed: false, reason: "Does not match psych case type" };
  } else {
    if (writerType === "non-psych" || writerType === "both") {
      return { passed: true };
    }
    return { passed: false, reason: "Does not match non-psych case type" };
  }
}

function filterByClientDetailed(writer, newCase) {
  if (writer.clients.includes(newCase.client)) {
    return { passed: true };
  }
  return { passed: false, reason: `Not associated with client ${newCase.client}` };
}

function filterByAvailabilityDetailed(writer, newCase) {
  const load = getCaseLoad(newCase.caseLength);
  if (writer.currentWorkload + load <= writer.dailyCaseLimit) {
    return { passed: true };
  }
  return { passed: false, reason: "At capacity" };
}

function filterByPriorWriterDetailed(writer, newCase) {
  if (newCase.priorCaseWriter && writer.name === newCase.priorCaseWriter) {
    return { passed: false, reason: "Already wrote a prior case" };
  }
  return { passed: true };
}

/*
  4) Composite Score Calculation
     Q = overallQualityScore
     T = turnaroundTime
     C = cost for the client

     Turnaround Bonus (Bₜ):
       if T < 24 => min(24 - T, 6)
       else => -(T - 24)

     Cost Bonus (B₍C₎):
       ((maxCost - C) / (maxCost - minCost)) × 5

     Composite Score = Q + Bₜ + B₍C₎ (clamped 0..100)
*/
function computeTurnaroundBonus(turnaround) {
  if (turnaround < 24) {
    return Math.min(24 - turnaround, 6);
  }
  return -(turnaround - 24);
}

function computeCostBonus(writerCost, minCost, maxCost) {
  if (maxCost === minCost) return 5;
  return ((maxCost - writerCost) / (maxCost - minCost)) * 5;
}

// 5) Manual filter constants
const clientOptions = [
  "Lincoln",
  "PFR",
  "Hartford",
  "NYL",
  "Muckleshoot",
  "Standard",
  "Peer Review",
  "Telco",
  "LTC",
];

const caseTypeOptions = [
  "Allergy & Immunology",
  "Anesthesiology",
  "Chiropractic",
  "Colon And Rectal Surgery",
  "Critical Care Medicine",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Family Medicine",
  "General Surgery",
  "Hematology And Oncology",
  "Internal Medicine",
  "Medical Toxicology",
  "Nephrology",
  "Neurology",
  "Neuromuscular Medicine",
  "Neuroophthalmology",
  "Neurological Surgery",
  "Neuropsychology",
  "Obstetrics And Gynecology",
  "Occupational Medicine",
  "Ophthalmology",
  "Orthopedic Surgery",
  "Otolaryngology",
  "Pediatrics",
  "Physical Medicine & Rehabilitation",
  "Plastic Surgery",
  "Podiatry",
  "Psychiatry",
  "Psychology",
  "Pulmonary Medicine",
  "Sleep Medicine",
  "Speech Pathology",
  "Urology",
  "Vascular Surgery",
];

/*
  Main Component
*/
export default function AdminTools() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [newCase, setNewCase] = useState(null);
  const [finalSortMode, setFinalSortMode] = useState("composite");

  // Manual filter states
  const [manualClient, setManualClient] = useState(clientOptions[0]);
  const [manualCaseType, setManualCaseType] = useState(caseTypeOptions[0]);
  const [manualCaseLength, setManualCaseLength] = useState(300);

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.5 } }),
  };

  function generateCaseID() {
    const randomNum = Math.floor(20000 + Math.random() * 1000);
    return `${randomNum}-01`;
  }

  function importNewCase() {
    const randomCase = sampleCasesInfo[Math.floor(Math.random() * sampleCasesInfo.length)];
    setNewCase(randomCase);
    setFinalSortMode("composite");
  }

  function optimizeAssignment() {
    const manualCase = {
      caseID: generateCaseID(),
      claimantId: "DemoClaimant",
      client: manualClient,
      caseType: manualCaseType,
      caseLength: manualCaseLength,
      priorCaseWriter: "",
    };
    setNewCase(manualCase);
    setFinalSortMode("composite");
  }

  // Step 1: All Writers
  const step1 = useMemo(() => {
    return AdminFLData.map((writer) => ({ writer, passed: true, reason: "" }));
  }, []);

  // Step 2: Filter by Case Type using updated filtering logic
  const step2 = useMemo(() => {
    if (!newCase) return { passed: [], filtered: [] };
    const passed = [];
    const filtered = [];
    step1.forEach(({ writer }) => {
      const result = filterByCaseTypeDetailed(writer, newCase);
      if (result.passed) {
        passed.push({ writer });
      } else {
        filtered.push({ writer, reason: result.reason });
      }
    });
    return { passed, filtered };
  }, [newCase, step1]);

  // Step 3: Filter by Client
  const step3 = useMemo(() => {
    if (!newCase) return { passed: [], filtered: [] };
    const passed = [];
    const filtered = [];
    step2.passed.forEach(({ writer }) => {
      const result = filterByClientDetailed(writer, newCase);
      if (result.passed) {
        passed.push({ writer });
      } else {
        filtered.push({ writer, reason: result.reason });
      }
    });
    return { passed, filtered };
  }, [newCase, step2]);

  // Step 4: Filter by Availability
  const step4 = useMemo(() => {
    if (!newCase) return { passed: [], filtered: [] };
    const passed = [];
    const filtered = [];
    step3.passed.forEach(({ writer }) => {
      const result = filterByAvailabilityDetailed(writer, newCase);
      if (result.passed) {
        passed.push({ writer });
      } else {
        filtered.push({ writer, reason: result.reason });
      }
    });
    return { passed, filtered };
  }, [newCase, step3]);

  // Step 5: Exclude Prior Case Writer
  const step5 = useMemo(() => {
    if (!newCase) return { passed: [], filtered: [] };
    const passed = [];
    const filtered = [];
    step4.passed.forEach(({ writer }) => {
      const result = filterByPriorWriterDetailed(writer, newCase);
      if (result.passed) {
        passed.push({ writer });
      } else {
        filtered.push({ writer, reason: result.reason });
      }
    });
    return { passed, filtered };
  }, [newCase, step4]);

  // Final eligible writers
  const finalWriters = useMemo(() => {
    return step5.passed.map(({ writer }) => writer);
  }, [step5]);

  // Compute min and max cost among final writers
  const { minCost, maxCost } = useMemo(() => {
    if (!newCase || finalWriters.length === 0) return { minCost: 25, maxCost: 25 };
    const costs = finalWriters.map((writer) => writer.costPerCase[newCase.client] || 25);
    return {
      minCost: Math.min(...costs),
      maxCost: Math.max(...costs),
    };
  }, [newCase, finalWriters]);

  // Final Sorted List
  const sortedWriters = useMemo(() => {
    if (!newCase) return [];
    const withScore = finalWriters.map((writer) => {
      const turnaroundBonus = computeTurnaroundBonus(writer.turnaroundTime);
      const costBonus = computeCostBonus(
        writer.costPerCase[newCase.client] || 25,
        minCost,
        maxCost
      );
      const compositeScore = writer.overallQualityScore + turnaroundBonus + costBonus;
      return { ...writer, compositeScore };
    });
    let sorted = [...withScore];
    if (finalSortMode === "cost") {
      sorted.sort(
        (a, b) =>
          (a.costPerCase[newCase.client] || 25) -
          (b.costPerCase[newCase.client] || 25)
      );
    } else if (finalSortMode === "quality") {
      sorted.sort((a, b) => b.overallQualityScore - a.overallQualityScore);
    } else {
      sorted.sort((a, b) => b.compositeScore - a.compositeScore);
    }
    return sorted;
  }, [newCase, finalSortMode, finalWriters, minCost, maxCost]);

  // onClick for final cards
  function handleCardClick(writer) {
    alert(
      `Detailed Data for ${writer.name}:\n` +
        `Quality Score: ${writer.overallQualityScore}\n` +
        `Turnaround Time: ${writer.turnaroundTime} hrs\n` +
        `Cost: $${writer.costPerCase[newCase.client] || "N/A"}\n` +
        `Availability: ${writer.availability}\n` +
        `Clients: ${writer.clients.join(", ")}`
    );
  }

  function renderWritersList(list, isPassedList = true) {
    return (
      <Box>
        {list.map(({ writer, reason }) => (
          <Typography
            key={writer.mra_id}
            variant="body2"
            sx={{
              textDecoration: reason ? "line-through" : "none",
              fontWeight: "bold",
              color: isPassedList
                ? isDark
                  ? "#66bb6a"
                  : "#388e3c"
                : isDark
                ? "#f44336"
                : "#d32f2f",
            }}
          >
            {writer.name} {reason && `- (${reason})`}
          </Typography>
        ))}
      </Box>
    );
  }

  function renderStepColumn(stepNumber, title, stepData) {
    return (
      <Box sx={{ flex: 1, p: 1, minWidth: 180, textAlign: "left" }}>
        <AnimatePresence>
          <motion.div
            key={newCase ? newCase.caseID + "-" + stepNumber : stepNumber}
            custom={stepNumber}
            initial="hidden"
            animate="visible"
            variants={stepVariants}
          >
            <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#000" }}>
              {title} <br />
              (Pass: {stepData.passed.length}, Out: {stepData.filtered.length})
            </Typography>

            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}
            >
              Passed:
            </Typography>
            {renderWritersList(stepData.passed, true)}

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "bold",
                color: isDark ? "#fff" : "#000",
                mt: 2,
              }}
            >
              Filtered Out:
            </Typography>
            {renderWritersList(stepData.filtered, false)}
          </motion.div>
        </AnimatePresence>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 2, fontWeight: "bold", color: isDark ? "#fff" : "#000" }}
      >
        Case Assignment Tool
      </Typography>

      {/* Random Case Import Section */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          border: "1px solid",
          borderColor: isDark ? "#fff" : "#ccc",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
          1) Random Case Import
        </Typography>
        <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000", mt: 1 }}>
          Click the button below to randomly select a case from the sample dataset.
        </Typography>
        <Button variant="contained" onClick={importNewCase} sx={{ mt: 2 }}>
          Import New Case
        </Button>
      </Box>

      {/* Manual Case Filter Section */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          border: "1px solid",
          borderColor: isDark ? "#fff" : "#ccc",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
          2) Manual Case Filter
        </Typography>
        <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000", mt: 1 }}>
          Select a client, case type, and case length, then click "Optimize MRA Assignment."
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
          {/* Client */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
              Client:
            </Typography>
            <TextField
              select
              size="small"
              value={manualClient}
              onChange={(e) => setManualClient(e.target.value)}
              sx={{
                minWidth: 120,
                background: isDark ? "#e0e0e0" : "#fff",
              }}
              InputProps={{ sx: { color: isDark ? "#000" : "#000" } }}
            >
              {clientOptions.map((client) => (
                <MenuItem key={client} value={client}>
                  {client}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          {/* Case Type */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
              Case Type:
            </Typography>
            <TextField
              select
              size="small"
              value={manualCaseType}
              onChange={(e) => setManualCaseType(e.target.value)}
              sx={{ minWidth: 150, background: isDark ? "#e0e0e0" : "#fff" }}
              InputProps={{ sx: { color: isDark ? "#000" : "#000" } }}
            >
              {caseTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          {/* Case Length */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
              Case Length:
            </Typography>
            <TextField
              type="number"
              size="small"
              value={manualCaseLength}
              onChange={(e) => setManualCaseLength(Number(e.target.value))}
              sx={{ minWidth: 100, background: isDark ? "#e0e0e0" : "#fff" }}
              InputProps={{ sx: { color: isDark ? "#000" : "#000" } }}
            />
          </Box>
          <Button variant="contained" onClick={optimizeAssignment} sx={{ mt: 1 }}>
            Optimize MRA Assignment
          </Button>
        </Box>
      </Box>

      {/* New Case Details */}
      <AnimatePresence>
        {newCase && (
          <motion.div
            key={newCase.caseID}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box
              sx={{
                mb: 4,
                p: 2,
                border: "1px solid",
                borderColor: isDark ? "#fff" : "#ccc",
                borderRadius: 2,
                background: isDark ? "#424242" : "#f5f5f5",
              }}
            >
              <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#000" }}>
                New Case Details
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                <strong>Case ID:</strong> {newCase.caseID}
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                <strong>Claimant ID:</strong> {newCase.claimantId}
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                <strong>Client:</strong> {newCase.client}
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                <strong>Case Type:</strong> {newCase.caseType}
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                <strong>Case Length:</strong> {newCase.caseLength}
              </Typography>
              {newCase.priorCaseWriter && (
                <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                  <strong>Prior Case Writer:</strong> {newCase.priorCaseWriter}
                </Typography>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {newCase && (
        <>
          <Divider sx={{ my: 2, borderColor: isDark ? "#fff" : "#ccc" }} />

          {/* Step Columns */}
          <Box
            key={newCase.caseID + "-steps"}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 1,
              overflowX: "auto",
              mb: 2,
            }}
          >
            {renderStepColumn(0, "Step 1: All Writers", { passed: step1, filtered: [] })}
            <ArrowForwardIcon sx={{ color: isDark ? "#fff" : "#000", mt: 2 }} />
            {renderStepColumn(1, "Step 2: Case Type", step2)}
            <ArrowForwardIcon sx={{ color: isDark ? "#fff" : "#000", mt: 2 }} />
            {renderStepColumn(2, "Step 3: Client", step3)}
            <ArrowForwardIcon sx={{ color: isDark ? "#fff" : "#000", mt: 2 }} />
            {renderStepColumn(3, "Step 4: Availability", step4)}
            <ArrowForwardIcon sx={{ color: isDark ? "#fff" : "#000", mt: 2 }} />
            {renderStepColumn(4, "Step 5: Exclude Prior", step5)}

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", ml: 1 }}>
              <ArrowDownwardIcon sx={{ color: isDark ? "#fff" : "#000", fontSize: 40, mt: 1, mb: 2 }} />
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: isDark ? "#fff" : "#ccc" }} />

          {/* Final Sorted List */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h5" sx={{ color: isDark ? "#fff" : "#000" }}>
              Final Sorted List ({sortedWriters.length})
            </Typography>
            <Button variant="outlined" onClick={() => setFinalSortMode("cost")}>
              Sort by Cost
            </Button>
            <Button variant="outlined" onClick={() => setFinalSortMode("quality")}>
              Sort by Quality
            </Button>
            <Button variant="outlined" onClick={() => setFinalSortMode("composite")}>
              Composite Score Sort
            </Button>
          </Box>

          <Grid container spacing={2}>
            {sortedWriters.map((writer, index) => (
              <Grid item key={writer.mra_id} xs={12} sm={6} md={4}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleCardClick(writer)}
                >
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: isDark ? "#424242" : "#fff",
                      color: isDark ? "#fff" : "#000",
                      border: `2px solid ${getOutlineColor(writer, index)}`,
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#000" }}>
                        {writer.name}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {writer.profilePic ? (
                          <Box
                            component="img"
                            src={writer.profilePic}
                            alt="Profile"
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              objectFit: "cover",
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
                              justifyContent: "center",
                            }}
                          >
                            <PersonIcon sx={{ color: isDark ? "#fff" : "#000" }} />
                          </Box>
                        )}
                        {index < 3 && <EmojiEventsIcon sx={{ color: "#66bb6a" }} />}
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                      <strong>Composite Score:</strong> {writer.compositeScore.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                      <strong>Quality Score:</strong> {writer.overallQualityScore}
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                      <strong>Cost (PFR):</strong> ${writer.costPerCase[newCase.client] || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                      <strong>TAT:</strong> {writer.turnaroundTime} hrs
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                      <strong>Availability:</strong> {writer.availability}
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                      <strong>Clients:</strong> {writer.clients.join(", ")}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 2, borderColor: isDark ? "#fff" : "#000" }} />

          <Box sx={{ p: 2, background: isDark ? "#333" : "#f5f5f5", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#000" }}>
              Composite Score Methodology:
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
              Let Q = overallQualityScore, T = turnaroundTime, and C = cost for the client.
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
              Turnaround Bonus (Bₜ) = <code>min(24 - T, 6)</code> if T &lt; 24; otherwise, Bₜ = <code>-(T - 24)</code>.
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
              Cost Bonus (B₍C₎) = <code>((maxCost - C) / (maxCost - minCost)) × 5</code>.
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
              Composite Score = Q + Bₜ + B₍C₎ (clamped between 0 and 100).
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
