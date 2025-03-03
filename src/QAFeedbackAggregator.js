// src/QAFeedbackAggregator.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Button,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const QAFeedbackAggregator = ({ feedbackData }) => {
  // Filter only internal QA feedback
  const internalFeedback = feedbackData.filter(
    (item) => item.feedbackType === 'internal'
  );

  // State for time filter: "week" or "month"
  const [timeFilter, setTimeFilter] = useState('week');
  // State to collapse/expand the entire QA feedback section (default collapsed)
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(false);

  // Helper: filter feedback based on selected time period
  const filterFeedback = (data, filter) => {
    const now = new Date();
    const threshold =
      filter === 'week'
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return data.filter((item) => new Date(item.date) >= threshold);
  };

  const filteredFeedback = filterFeedback(internalFeedback, timeFilter);

  // Group filtered feedback by reviewer name
  const groupedFeedback = filteredFeedback.reduce((acc, item) => {
    const reviewer = item.name;
    if (!acc[reviewer]) {
      acc[reviewer] = [];
    }
    acc[reviewer].push(item);
    return acc;
  }, {});

  // Concatenate feedback for each reviewer into one text block
  const aggregatedFeedbackText = {};
  Object.keys(groupedFeedback).forEach((reviewer) => {
    aggregatedFeedbackText[reviewer] = groupedFeedback[reviewer]
      .map(
        (item) =>
          `(${new Date(item.date).toLocaleDateString()}) ${item.text}`
      )
      .join('\n\n');
  });

  // Function to copy aggregated text to clipboard for a reviewer
  const handleCopy = (reviewer) => {
    const textToCopy = aggregatedFeedbackText[reviewer];
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert(`Copied QA feedback for ${reviewer}`);
    });
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      {/* Section Heading with black text */}
      <Typography variant="h5" sx={{ mb: 1, color: 'text.primary' }}>
        Aggregated Internal QA Feedback
      </Typography>
      {/* Collapse/Expand Button for Entire Section */}
      <Button
        variant="contained"
        color="primary"
        startIcon={isSectionCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        onClick={() => setIsSectionCollapsed(!isSectionCollapsed)}
        sx={{ mb: 2 }}
      >
        {isSectionCollapsed ? 'Expand QA Feedback' : 'Collapse QA Feedback'}
      </Button>

      {!isSectionCollapsed && (
        <>
          <ToggleButtonGroup
            value={timeFilter}
            exclusive
            onChange={(event, newFilter) => {
              if (newFilter !== null) setTimeFilter(newFilter);
            }}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="week">Past Week</ToggleButton>
            <ToggleButton value="month">Past Month</ToggleButton>
          </ToggleButtonGroup>
          {Object.keys(aggregatedFeedbackText).length === 0 ? (
            <Typography variant="body1">
              No internal QA feedback available for the selected period.
            </Typography>
          ) : (
            Object.keys(aggregatedFeedbackText).map((reviewer) => (
              <Paper key={reviewer} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {reviewer}
                </Typography>
                <TextField
                  multiline
                  fullWidth
                  minRows={4}
                  value={aggregatedFeedbackText[reviewer]}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 1 }}
                />
                <Button variant="contained" onClick={() => handleCopy(reviewer)}>
                  Copy QA Feedback for {reviewer}
                </Button>
              </Paper>
            ))
          )}
        </>
      )}
    </Box>
  );
};

export default QAFeedbackAggregator;
