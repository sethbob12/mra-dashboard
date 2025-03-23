// src/CaseAssignmentTool.js
import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AdminFLData from "./AdminFLData";
import sampleCasesInfo from "./sampleCasesInfo";

// Define psych specialties (in lower case, for matching new case types)
const psychSpecialties = ["psychiatry", "psychology", "neuropsychology"];

// Helper: Check if the new case is a psych case by exact matching (case-insensitive)
function isPsychCase(caseType) {
  const lower = caseType.toLowerCase();
  return (
    lower === "psychiatry" ||
    lower === "psychology" ||
    lower === "neuropsychology"
  );
}

// Filtering function for case type
// For a psych case, allow only writers whose caseType is exactly "psych" or "both".
// For a non-psych case, allow only writers whose caseType is exactly "non-psych" or "both".
function filterByCaseType(writers, newCase) {
  if (isPsychCase(newCase.caseType)) {
    return writers.filter((writer) => {
      const writerType = writer.caseType.toLowerCase();
      return writerType === "psych" || writerType === "both";
    });
  } else {
    return writers.filter((writer) => {
      const writerType = writer.caseType.toLowerCase();
      return writerType === "non-psych" || writerType === "both";
    });
  }
}

const filterByClient = (writers, newCase) => {
  return writers.filter((writer) => writer.clients.includes(newCase.client));
};

const filterByAvailability = (writers) => {
  return writers.filter(
    (writer) => writer.currentWorkload < writer.dailyCaseLimit
  );
};

const filterByPriorWriter = (writers, newCase) => {
  if (newCase.priorCaseWriter) {
    return writers.filter(
      (writer) => writer.name !== newCase.priorCaseWriter
    );
  }
  return writers;
};

const computeCompositeScore = (writer, client) => {
  const cost = writer.costPerCase[client] || 25;
  const quality = writer.overallQualityScore;
  const turnaround = writer.turnaroundTime;
  const score = quality - 0.5 * cost - 0.2 * turnaround;
  return score;
};

const CaseAssignmentTool = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [newCase, setNewCase] = useState(null);

  // Import a random new case from sampleCasesInfo
  const importNewCase = () => {
    const randomCase =
      sampleCasesInfo[Math.floor(Math.random() * sampleCasesInfo.length)];
    setNewCase(randomCase);
  };

  // Start with all writers from AdminFLData
  const allWriters = useMemo(() => AdminFLData, []);

  // Step 1: Filter by case type using the updated logic.
  const writersByCaseType = useMemo(() => {
    return newCase ? filterByCaseType(allWriters, newCase) : [];
  }, [newCase, allWriters]);

  // Step 2: Filter by client.
  const writersByClient = useMemo(() => {
    return newCase ? filterByClient(writersByCaseType, newCase) : [];
  }, [newCase, writersByCaseType]);

  // Step 3: Filter by availability.
  const writersByAvailability = useMemo(() => {
    return filterByAvailability(writersByClient);
  }, [writersByClient]);

  // Step 4: Remove prior case writer (if applicable).
  const finalWriters = useMemo(() => {
    return newCase ? filterByPriorWriter(writersByAvailability, newCase) : [];
  }, [newCase, writersByAvailability]);

  // Step 5: Compute composite scores and sort descending.
  const sortedWriters = useMemo(() => {
    if (!newCase) return [];
    const scored = finalWriters.map((writer) => ({
      ...writer,
      compositeScore: computeCompositeScore(writer, newCase.client),
    }));
    return scored.sort((a, b) => b.compositeScore - a.compositeScore);
  }, [newCase, finalWriters]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: "bold",
          color: isDark ? "#fff" : "#000",
        }}
      >
        Case Assignment Tool
      </Typography>
      <Button variant="contained" onClick={importNewCase} sx={{ mb: 4 }}>
        Import New Case
      </Button>

      {newCase && (
        <Box
          sx={{
            mb: 4,
            p: 2,
            border: "1px solid",
            borderColor: isDark ? "#fff" : "#ccc",
            borderRadius: 2,
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
      )}

      {newCase && (
        <>
          <Divider sx={{ my: 2, borderColor: isDark ? "#fff" : "#ccc" }} />
          <Typography variant="h6" sx={{ mt: 2, color: isDark ? "#fff" : "#000" }}>
            Step 1: All Writers: {allWriters.length}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, color: isDark ? "#fff" : "#000" }}>
            Step 2: Qualified by Case Type: {writersByCaseType.length}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, color: isDark ? "#fff" : "#000" }}>
            Step 3: Qualified by Client: {writersByClient.length}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, color: isDark ? "#fff" : "#000" }}>
            Step 4: With Availability: {writersByAvailability.length}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, color: isDark ? "#fff" : "#000" }}>
            Step 5: Excluding Prior Writers: {finalWriters.length}
          </Typography>
          <Divider sx={{ my: 2, borderColor: isDark ? "#fff" : "#ccc" }} />
          <Typography variant="h5" sx={{ mb: 2, color: isDark ? "#fff" : "#000" }}>
            Final Sorted List ({sortedWriters.length})
          </Typography>

          <Grid container spacing={2}>
            {sortedWriters.map((writer, index) => (
              <Grid item key={writer.mra_id} xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: isDark ? "#424242" : "#fff",
                    color: isDark ? "#fff" : "#000",
                  }}
                >
                  <Typography variant="h6">
                    {writer.name}{" "}
                    {index === 0 && (
                      <Typography component="span" color="primary">
                        (Top Candidate)
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Composite Score:</strong>{" "}
                    {writer.compositeScore.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Quality Score:</strong> {writer.overallQualityScore}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cost (PFR):</strong>{" "}
                    ${writer.costPerCase[newCase.client] || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Turnaround Time:</strong> {writer.turnaroundTime} hrs
                  </Typography>
                  <Typography variant="body2">
                    <strong>Availability:</strong> {writer.availability}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Clients:</strong> {writer.clients.join(", ")}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default CaseAssignmentTool;
