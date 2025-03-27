import React, { useState, useMemo } from "react";
import {
  TextField,
  MenuItem,
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RateReviewIcon from "@mui/icons-material/RateReview";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import AdminFLData from "./AdminFLData";
import sampleCasesInfo from "./sampleCasesInfo";
import RevisionAssignmentTool from "./RevisionAssignmentTool";
import SLData from "./SLData"; // Must be an array exported as default

dayjs.extend(utc);
dayjs.extend(timezone);

// ============ MRA ASSIGNING SECTION ============

// Helper for MRA outlines
function getOutlineColor(writer, index) {
  if (index < 3) {
    return "#66bb6a";
  }
  const score = writer.compositeScore;
  if (score >= 90) return "#66bb6a";
  if (score >= 70) return "#FFA726";
  return "#F44336";
}

// Helper for MRA load
function getCaseLoad(caseLength) {
  if (caseLength >= 1000) return 2;
  if (caseLength >= 700) return 1.5;
  return 1;
}

// MRA filters
const psychSpecialties = ["psychiatry", "psychology", "neuropsychology"];

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

// MRA scoring functions
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

// Helper: Compute Revision Availability based on writer's timezone.
function computeRevisionAvailability(writer, revisionType) {
  if (revisionType === "addendum") return "Available";
  if (!writer.location || !writer.location.timezone) return "Unknown";
  const localHour = dayjs().tz(writer.location.timezone).hour();
  return localHour >= 5 && localHour < 18 ? "Available" : "Not Available";
}

// MRA picklists
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
  "Addiction Medicine",
  "Allergy & Immunology",
  "Anesthesiology",
  "Brain Injury Medicine",
  "Cardiovascular Disease",
  "Cardiovascular Medicine",
  "Cardiology",
  "Child & Adolescent Psychiatry",
  "Chiropractic",
  "Clinical Informatics",
  "Colon & Rectal Surgery",
  "Critical Care",
  "Critical Care Medicine",
  "Dermatology",
  "Diabetes and Metabolism",
  "Endocrinology",
  "Emergency Medicine",
  "Family Medicine",
  "Forensic Pathology",
  "Foot Surgery",
  "Gastroenterology",
  "GI",
  "Geriatric Medicine",
  "General Preventive Medicine",
  "Hand Surgery",
  "Hematology",
  "Hospice & Palliative Medicine",
  "Infectious Disease",
  "Internal Medicine",
  "Medical Oncology",
  "Medical Toxicology",
  "Nephrology",
  "Neurology",
  "Neuromuscular Medicine",
  "Neuro-Ophthalmology",
  "Neuroophthalmology",
  "Neuropsychology",
  "Neurological Surgery",
  "Oncology",
  "Occupational Medicine",
  "Ophthalmology",
  "Orthopedic Surgery",
  "Otolaryngology",
  "Obstetrics & Gynecology",
  "Pain Management",
  "Pain Medicine",
  "Pathology",
  "Periodontics",
  "Pediatrics",
  "Physical Medicine & Rehabilitation",
  "Plastic Surgery",
  "PMR",
  "Preventive Medicine",
  "Psychiatry",
  "Psychology",
  "Public Health",
  "Rheumatology",
  "Sleep Medicine",
  "Spine Surgery",
  "Surgery of the Hand",
  "Speech Pathology",
  "Toxicology",
  "Urology",
  "Vascular Surgery",
];

// Motion variants for step animations
const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminTools() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // ======= MRA STATES & LOGIC =======
  const [newCase, setNewCase] = useState(null);
  const [finalSortMode, setFinalSortMode] = useState("composite");

  // Dropdown states
  const [manualClient, setManualClient] = useState(clientOptions[0]);
  const [manualCaseType, setManualCaseType] = useState(caseTypeOptions[0]);
  const [manualCaseLength, setManualCaseLength] = useState(300);

  // Random case generation
  function generateCaseID() {
    const randomNum = Math.floor(20000 + Math.random() * 1000);
    return `${randomNum}-01`;
  }

  function importNewCase() {
    const randomCase =
      sampleCasesInfo[Math.floor(Math.random() * sampleCasesInfo.length)];
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

  /****************** MRA Steps ******************/
  const step1 = useMemo(() => {
    return AdminFLData.map((writer) => ({ writer, passed: true, reason: "" }));
  }, []);

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

  const finalWriters = useMemo(() => {
    return step5.passed.map(({ writer }) => writer);
  }, [step5]);

  const { minCost, maxCost } = useMemo(() => {
    if (!newCase || finalWriters.length === 0) return { minCost: 25, maxCost: 25 };
    const costs = finalWriters.map(
      (writer) => writer.costPerCase[newCase.client] || 25
    );
    return {
      minCost: Math.min(...costs),
      maxCost: Math.max(...costs),
    };
  }, [newCase, finalWriters]);

  /****************** Final Composite Score with Specialty & Client Modifiers ******************/
  const sortedWriters = useMemo(() => {
    if (!newCase) return [];
    const withScore = finalWriters.map((writer) => {
      const turnaroundBonus = computeTurnaroundBonus(writer.turnaroundTime);
      const costBonus = computeCostBonus(
        writer.costPerCase[newCase.client] || 25,
        minCost,
        maxCost
      );
      const caseTypeLower = newCase.caseType.trim().toLowerCase();
      let specialtyModifier = 0;
      if (newCase.client !== "LTC") {
        if (
          Array.isArray(writer.preferredSpecialties) &&
          writer.preferredSpecialties.length > 0
        ) {
          const preferred = writer.preferredSpecialties.map((s) =>
            s.trim().toLowerCase()
          );
          if (preferred.includes(caseTypeLower)) {
            specialtyModifier = writer.scoreModifier ?? 30;
          }
        }
        if (
          specialtyModifier === 0 &&
          Array.isArray(writer.nonPreferredSpecialties) &&
          writer.nonPreferredSpecialties.length > 0
        ) {
          const nonPreferred = writer.nonPreferredSpecialties.map((s) =>
            s.trim().toLowerCase()
          );
          if (nonPreferred.includes(caseTypeLower)) {
            specialtyModifier = -20;
          }
        }
      }
      // Look up the client modifier from the writer's clientModifiers field.
      const clientModifier =
        (writer.clientModifiers && writer.clientModifiers[newCase.client]) || 0;
      console.log(
        `Writer: ${writer.name}, newCase.client: ${newCase.client}, Specialty Modifier: ${specialtyModifier}, Client Modifier: ${clientModifier}`
      );
      const compositeScore =
        writer.overallQualityScore +
        turnaroundBonus +
        costBonus +
        specialtyModifier +
        clientModifier;
      return { ...writer, compositeScore, specialtyModifier, clientModifier };
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
                ? (isDark ? "#66bb6a" : "#388e3c")
                : (isDark ? "#f44336" : "#d32f2f"),
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
      <Box
        sx={{
          flex: 1,
          p: 1,
          minWidth: 180,
          textAlign: "left",
          border: "1px solid",
          borderColor: isDark ? "#eee" : "#333",
          borderRadius: 1,
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#000" }}>
          {title} <br />
          (Pass: {stepData.passed.length}, Out: {stepData.filtered.length})
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
          Passed:
        </Typography>
        {renderWritersList(stepData.passed, true)}
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000", mt: 2 }}>
          Filtered Out:
        </Typography>
        {renderWritersList(stepData.filtered, false)}
      </Box>
    );
  }

  function clearMRA() {
    setNewCase(null);
  }

  // ======= SL ASSIGNING SECTION =======
  const allSLSpecialties = useMemo(() => {
    const specs = new Set();
    SLData.forEach((sl) => {
      sl.specialties.forEach((s) => specs.add(s));
    });
    return Array.from(specs).sort();
  }, []);

  // States for SL assignment
  const [newSLCase, setNewSLCase] = useState(null);
  const [finalSortModeSL, setFinalSortModeSL] = useState("cost");
  const [manualSLSpecialty, setManualSLSpecialty] = useState("");

  function importNewSLCase() {
    if (sampleCasesInfo.length === 0) return;
    const randomCase =
      sampleCasesInfo[Math.floor(Math.random() * sampleCasesInfo.length)];

    let priorSL = "";
    if (Math.random() < 0.25 && SLData.length > 0) {
      const randomSL = SLData[Math.floor(Math.random() * SLData.length)];
      priorSL = randomSL.name;
    }

    setNewSLCase({
      caseID: randomCase.caseID,
      claimantId: randomCase.claimantId,
      client: randomCase.client,
      requestedSpecialty: randomCase.caseType,
      priorSL,
    });
    setFinalSortModeSL("cost");
  }

  function optimizeSLAssignment() {
    if (!manualSLSpecialty) {
      alert("Please select a specialty first!");
      return;
    }
    let priorSL = "";
    if (Math.random() < 0.25 && SLData.length > 0) {
      const randomSL = SLData[Math.floor(Math.random() * SLData.length)];
      priorSL = randomSL.name;
    }
    setNewSLCase({
      caseID: generateCaseID(),
      claimantId: "DemoClaimantSL",
      client: "ManualClient",
      requestedSpecialty: manualSLSpecialty,
      priorSL,
    });
    setFinalSortModeSL("cost");
  }

  // SL Steps
  const step1SL = useMemo(() => {
    if (!Array.isArray(SLData)) {
      return [];
    }
    return SLData.map((sl) => ({ sl, passed: true }));
  }, []);

  const step2SL = useMemo(() => {
    if (!newSLCase) return { passed: [], filtered: [] };
    const passed = [];
    const filtered = [];
    const requestedSpec = newSLCase.requestedSpecialty?.trim().toLowerCase();
    step1SL.forEach(({ sl }) => {
      const specialties = sl.specialties.map((sp) => sp.trim().toLowerCase());
      const specialtyMatch = specialties.includes(requestedSpec);
      const isOnDNU = sl.dnu.includes(newSLCase.client);
      if (!specialtyMatch) {
        filtered.push({ sl, reason: "Does not match requested specialty" });
      } else if (isOnDNU) {
        filtered.push({ sl, reason: `SL is on DNU for ${newSLCase.client}` });
      } else {
        passed.push({ sl });
      }
    });
    return { passed, filtered };
  }, [newSLCase, step1SL]);

  const step3SL = useMemo(() => {
    if (!newSLCase) return { passed: [] };
    const arr = step2SL.passed.map((item) => {
      if (newSLCase.priorSL && item.sl.name === newSLCase.priorSL) {
        return { ...item, priorNote: "Check Priors and Client Comments" };
      }
      return item;
    });
    return { passed: arr };
  }, [newSLCase, step2SL]);

  const sortedSLs = useMemo(() => {
    if (!newSLCase) return [];
    const arr = step3SL.passed.map((item) => ({
      ...item.sl,
      priorNote: item.priorNote || "",
    }));
    if (finalSortModeSL === "cost") {
      arr.sort((a, b) => a.costPerCase - b.costPerCase);
    } else if (finalSortModeSL === "avgSignOffTime") {
      arr.sort((a, b) => a.avgSignOffTime - b.avgSignOffTime);
    } else if (finalSortModeSL === "casesCompleted") {
      arr.sort((a, b) => b.casesCompleted30Days - a.casesCompleted30Days);
    }
    return arr;
  }, [newSLCase, finalSortModeSL, step3SL]);

  function getSLOutlineColor(_, index) {
    return index < 3 ? "#66bb6a" : "#FFA726";
  }

  function handleSLCardClick(sl) {
    alert(
      `Detailed Data for ${sl.name}:\n` +
        `Specialties: ${sl.specialties.join(", ")}\n` +
        `States: ${sl.states.join(", ")}\n` +
        `Client DNU: ${sl.dnu.join(", ") || "(none)"}\n` +
        `Cost per Case: $${sl.costPerCase}\n` +
        `Avg Sign Off Time: ${sl.avgSignOffTime} hrs\n` +
        `Cases Completed (30 days): ${sl.casesCompleted30Days}\n` +
        (sl.priorNote ? `\nNote: ${sl.priorNote}` : "")
    );
  }

  
  function renderSLList(list, isPassedList = true) {
    return (
      <Box>
        {list.map(({ sl, reason, priorNote }) => (
          <Typography
            key={sl.name}
            variant="body2"
            sx={{
              textDecoration: reason ? "line-through" : "none",
              fontWeight: "bold",
              color: isPassedList
                ? (isDark ? "#66bb6a" : "#388e3c")
                : (isDark ? "#f44336" : "#d32f2f"),
            }}
          >
            {sl.name}
            {priorNote && ` - (${priorNote})`}
            {reason && ` - (${reason})`}
          </Typography>
        ))}
      </Box>
    );
  }

  function renderStepColumnSL(stepNumber, title, stepData) {
    const passedCount = stepData?.passed?.length || 0;
    const filteredCount = stepData?.filtered?.length || 0;
    return (
      <Box
        sx={{
          flex: 1,
          p: 1,
          minWidth: 180,
          textAlign: "left",
          border: "1px solid",
          borderColor: isDark ? "#eee" : "#333",
          borderRadius: 1,
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#000" }}>
          {title} <br />
          (Pass: {passedCount}, Out: {filteredCount})
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
          Passed:
        </Typography>
        {stepData?.passed && renderSLList(stepData.passed, true)}
        {stepData?.filtered && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000", mt: 2 }}>
              Filtered Out:
            </Typography>
            {renderSLList(stepData.filtered, false)}
          </>
        )}
      </Box>
    );
  }

  function clearSL() {
    setNewSLCase(null);
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* MRA Assignment Tool Accordion */}
      <Accordion
        sx={{
          border: "1px solid",
          borderColor: isDark ? "#eee" : "#333",
          borderRadius: 2,
          mb: 2,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentIcon sx={{ fontSize: 28, color: isDark ? "#90caf9" : "#1565c0" }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: isDark ? "#90caf9" : "#1565c0",
                borderBottom: `3px solid ${isDark ? "#90caf9" : "#1565c0"}`,
                pb: 1,
              }}
            >
              Case Assignment Tool (MRA)
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: "100%" }}>
            {/* Random Case Import for MRA */}
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

            {/* Manual Case Filter for MRA */}
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
                {/* Client Dropdown */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
                    Client:
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={manualClient}
                    onChange={(e) => setManualClient(e.target.value)}
                    sx={{ minWidth: 120, background: isDark ? "#e0e0e0" : "#fff" }}
                    InputProps={{ sx: { color: "#000" } }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            background: isDark ? "#424242" : "#fff",
                            "& .MuiMenuItem-root": { color: isDark ? "#fff" : "#000" },
                          },
                        },
                      },
                    }}
                  >
                    {clientOptions.map((client) => (
                      <MenuItem key={client} value={client}>
                        {client}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                {/* Case Type Dropdown */}
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
                    InputProps={{ sx: { color: "#000" } }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            background: isDark ? "#424242" : "#fff",
                            "& .MuiMenuItem-root": { color: isDark ? "#fff" : "#000" },
                          },
                        },
                      },
                    }}
                  >
                    {caseTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                {/* Case Length Field */}
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
                    InputProps={{ sx: { color: "#000" } }}
                  />
                </Box>
                <Button variant="contained" onClick={optimizeAssignment} sx={{ mt: 1 }}>
                  Optimize MRA Assignment
                </Button>
              </Box>
            </Box>

            {/* New MRA Case Details */}
            <AnimatePresence>
              {newCase && (
                <motion.div key={newCase.caseID} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Box
                    sx={{
                      mb: 4,
                      p: 2,
                      border: "1px solid",
                      borderColor: isDark ? "#fff" : "#ccc",
                      borderRadius: 2,
                      background: isDark ? "#424242" : "#f5f5f5",
                      position: "relative",
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
                    <Button variant="outlined" onClick={clearMRA} sx={{ position: "absolute", top: 10, right: 10 }}>
                      Clear
                    </Button>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MRA Steps Display */}
            {newCase && (
              <>
                <Divider sx={{ my: 2, borderColor: isDark ? "#fff" : "#000" }} />
                <Box
                  key={newCase.caseID + "-steps"}
                  component={motion.div}
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 1,
                    overflowX: "auto",
                    mb: 2,
                  }}
                >
                  <motion.div variants={stepVariants}>
                    {renderStepColumn(0, "Step 1: All Writers", { passed: step1, filtered: [] })}
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    <ArrowForwardIcon sx={{ color: isDark ? "#fff" : "#000", mt: 2 }} />
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    {renderStepColumn(1, "Step 2: Case Type", step2)}
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    <ArrowForwardIcon sx={{ color: isDark ? "#fff" : "#000", mt: 2 }} />
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    {renderStepColumn(2, "Step 3: Client", step3)}
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    <ArrowForwardIcon sx={{ color: isDark ? "#fff" : "#000", mt: 2 }} />
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    {renderStepColumn(3, "Step 4: Availability", step4)}
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    <ArrowForwardIcon sx={{ color: isDark ? "#fff" : "#000", mt: 2 }} />
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    {renderStepColumn(4, "Step 5: Exclude Prior", step5)}
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", ml: 1 }}>
                      <ArrowDownwardIcon sx={{ color: isDark ? "#fff" : "#000", fontSize: 40, mt: 1, mb: 2 }} />
                    </Box>
                  </motion.div>
                </Box>
                <Divider sx={{ my: 2, borderColor: isDark ? "#fff" : "#000" }} />
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
                      <motion.div whileHover={{ scale: 1.05 }} onClick={() => handleCardClick(writer)}>
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
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                          <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                            <strong>Revision Availability:</strong> {computeRevisionAvailability(writer, "correction")}
                          </Typography>
                          {typeof writer.specialtyModifier === "number" && writer.specialtyModifier !== 0 && (
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                mt: 1,
                                color: writer.specialtyModifier > 0 ? "green" : "red",
                              }}
                            >
                              Specialty Modifier: {writer.specialtyModifier > 0 ? `+${writer.specialtyModifier}` : writer.specialtyModifier}
                            </Typography>
                          )}
                          {typeof writer.clientModifier === "number" && writer.clientModifier !== 0 && (
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                mt: 1,
                                color: writer.clientModifier > 0 ? "green" : "red",
                              }}
                            >
                              Client Modifier: {writer.clientModifier > 0 ? `+${writer.clientModifier}` : writer.clientModifier}
                            </Typography>
                          )}
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
                    Composite Score = Q + Bₜ + B₍C₎ + Specialty Modifier + Client Modifier.
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Revision Assignment Tool Accordion */}
      <Accordion
        sx={{
          border: "1px solid",
          borderColor: isDark ? "#eee" : "#333",
          borderRadius: 2,
          mb: 2,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <RateReviewIcon sx={{ fontSize: 28, color: isDark ? "#81c784" : "#2e7d32" }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: isDark ? "#81c784" : "#2e7d32",
                borderBottom: `3px solid ${isDark ? "#81c784" : "#2e7d32"}`,
                pb: 1,
              }}
            >
              Revision Assignment Tool
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <RevisionAssignmentTool computeRevisionAvailability={computeRevisionAvailability} />
        </AccordionDetails>
      </Accordion>

      {/* SL Assignment Tool Accordion */}
      <Accordion
        sx={{
          border: "1px solid",
          borderColor: isDark ? "#eee" : "#333",
          borderRadius: 2,
          mb: 2,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GroupWorkIcon sx={{ fontSize: 28, color: isDark ? "#ffcc80" : "#ff9800" }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: isDark ? "#ffcc80" : "#ff9800",
                borderBottom: `3px solid ${isDark ? "#ffcc80" : "#ff9800"}`,
                pb: 1,
              }}
            >
              SL Assigning
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: "100%" }}>
            {/* Random Case Import for SL */}
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
                Click the button below to randomly select a case for SL assignment.
              </Typography>
              <Button variant="contained" onClick={importNewSLCase} sx={{ mt: 2 }}>
                Import New SL Case
              </Button>
            </Box>

            {/* Manual Filter for SL */}
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
                2) Manual Filter
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000", mt: 1 }}>
                Select a requested specialty, then click "Optimize SL Assignment."
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2, alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
                  Requested Specialty:
                </Typography>
                <TextField
                  select
                  size="small"
                  value={manualSLSpecialty}
                  onChange={(e) => setManualSLSpecialty(e.target.value)}
                  sx={{ minWidth: 150, background: isDark ? "#e0e0e0" : "#fff" }}
                  InputProps={{ sx: { color: "#000" } }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          background: isDark ? "#424242" : "#fff",
                          "& .MuiMenuItem-root": { color: isDark ? "#fff" : "#000" },
                        },
                      },
                    },
                  }}
                >
                  {allSLSpecialties.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" onClick={optimizeSLAssignment}>
                  Optimize SL Assignment
                </Button>
              </Box>
            </Box>

            {/* New SL Case Details */}
            <AnimatePresence>
              {newSLCase && (
                <motion.div key={newSLCase.caseID} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Box
                    sx={{
                      mb: 4,
                      p: 2,
                      border: "1px solid",
                      borderColor: isDark ? "#fff" : "#ccc",
                      borderRadius: 2,
                      background: isDark ? "#424242" : "#f5f5f5",
                      position: "relative",
                    }}
                  >
                    <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#000" }}>
                      New SL Case Details
                    </Typography>
                    <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                      <strong>Case ID:</strong> {newSLCase.caseID}
                    </Typography>
                    <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                      <strong>Claimant ID:</strong> {newSLCase.claimantId}
                    </Typography>
                    <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                      <strong>Client:</strong> {newSLCase.client}
                    </Typography>
                    <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                      <strong>Requested Specialty:</strong> {newSLCase.requestedSpecialty}
                    </Typography>
                    {newSLCase.priorSL && (
                      <Typography variant="body1" sx={{ color: isDark ? "#fff" : "#000" }}>
                        <strong>Prior SL:</strong> {newSLCase.priorSL}
                      </Typography>
                    )}
                    <Button variant="outlined" onClick={clearSL} sx={{ position: "absolute", top: 10, right: 10 }}>
                      Clear
                    </Button>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {newSLCase && (
              <>
                <Divider sx={{ my: 2, borderColor: isDark ? "#fff" : "#ccc" }} />
                <Box
                  key={newSLCase.caseID + "-SLsteps"}
                  component={motion.div}
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 1,
                    overflowX: "auto",
                    mb: 2,
                  }}
                >
                  <motion.div variants={stepVariants}>
                    {renderStepColumnSL(0, "Step 1: All SLs", { passed: step1SL, filtered: [] })}
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    <ArrowForwardIcon sx={{ color: isDark ? "#fff" : "#000", mt: 2 }} />
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    {renderStepColumnSL(1, "Step 2: Specialty & DNU Filter", step2SL)}
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    <ArrowForwardIcon sx={{ color: isDark ? "#fff" : "#000", mt: 2 }} />
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    {renderStepColumnSL(2, "Step 3: Check Priors", step3SL)}
                  </motion.div>
                  <motion.div variants={stepVariants}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", ml: 1 }}>
                      <ArrowDownwardIcon sx={{ color: isDark ? "#fff" : "#000", fontSize: 40, mt: 1, mb: 2 }} />
                    </Box>
                  </motion.div>
                </Box>
                <Divider sx={{ my: 2, borderColor: isDark ? "#fff" : "#000" }} />
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="h5" sx={{ color: isDark ? "#fff" : "#000" }}>
                    Final Sorted SL List ({sortedSLs.length})
                  </Typography>
                  <Button variant="outlined" onClick={() => setFinalSortModeSL("cost")}>
                    Sort by Cost
                  </Button>
                  <Button variant="outlined" onClick={() => setFinalSortModeSL("avgSignOffTime")}>
                    Sort by Avg Sign Off Time
                  </Button>
                  <Button variant="outlined" onClick={() => setFinalSortModeSL("casesCompleted")}>
                    Sort by Cases Completed
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {sortedSLs.map((sl, index) => (
                    <Grid item key={sl.name} xs={12} sm={6} md={4}>
                      <motion.div whileHover={{ scale: 1.05 }} onClick={() => handleSLCardClick(sl)}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: isDark ? "#424242" : "#fff",
                            color: isDark ? "#fff" : "#000",
                            border: `2px solid ${getSLOutlineColor(sl, index)}`,
                            cursor: "pointer",
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#000" }}>
                              {sl.name}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {index < 3 && <EmojiEventsIcon sx={{ color: "#66bb6a" }} />}
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                            <strong>Specialties:</strong> {sl.specialties.join(", ")}
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                            <strong>States:</strong> {sl.states.join(", ")}
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                            <strong>Cost per Case:</strong> ${sl.costPerCase}
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                            <strong>Avg Sign Off Time:</strong> {sl.avgSignOffTime} hrs
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000" }}>
                            <strong>Cases Completed (30 days):</strong> {sl.casesCompleted30Days}
                          </Typography>
                          {sl.priorNote && (
                            <Typography variant="body2" sx={{ color: isDark ? "#fff" : "#000", mt: 1 }}>
                              <strong>Note:</strong> {sl.priorNote}
                            </Typography>
                          )}
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
