// src/ClientFeedbackAggregator.js ?* no need for REFACTORING as long as feedbackData prop matches expected JSON schema */
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

const ClientFeedbackAggregator = ({ feedbackData }) => {
  const clientFeedback = feedbackData.filter(
    (item) => item.feedbackType === 'client'
  );

  const [timeFilter, setTimeFilter] = useState('week');
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(false);

  const filterFeedback = (data, filter) => {
    const now = new Date();
    const threshold =
      filter === 'week'
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return data.filter((item) => new Date(item.date) >= threshold);
  };

  const filteredFeedback = filterFeedback(clientFeedback, timeFilter);

  const groupedFeedback = filteredFeedback.reduce((acc, item) => {
    const client = item.client;
    if (!acc[client]) {
      acc[client] = [];
    }
    acc[client].push(item);
    return acc;
  }, {});

  const aggregatedFeedbackText = {};
  Object.keys(groupedFeedback).forEach((client) => {
    aggregatedFeedbackText[client] = groupedFeedback[client]
      .map(
        (item) =>
          `(${new Date(item.date).toLocaleDateString()}) ${item.text}`
      )
      .join('\n\n');
  });

  const handleCopy = (client) => {
    const textToCopy = aggregatedFeedbackText[client];
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert(`Copied feedback for ${client}`);
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Aggregated Client Feedback
      </Typography>
      <Button
        variant="contained"
        onClick={() => setIsSectionCollapsed(!isSectionCollapsed)}
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: '#1976d2',
          color: 'white',
          '&:hover': { backgroundColor: '#115293' },
        }}
      >
        <ExpandMoreIcon
          sx={{
            transform: isSectionCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s ease',
            color: 'white',
          }}
        />
        {isSectionCollapsed ? 'Expand Feedback Section' : 'Collapse Feedback Section'}
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
            <Typography>
              No client feedback available for the selected period.
            </Typography>
          ) : (
            Object.keys(aggregatedFeedbackText).map((client) => (
              <Paper key={client} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {client}
                </Typography>
                <TextField
                  multiline
                  fullWidth
                  minRows={4}
                  value={aggregatedFeedbackText[client]}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleCopy(client)}
                >
                  Copy Feedback for {client}
                </Button>
              </Paper>
            ))
          )}
        </>
      )}
    </Box>
  );
};

export default ClientFeedbackAggregator;
