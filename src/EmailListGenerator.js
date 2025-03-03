// src/EmailListGenerator.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Modal,
  Fade,
  Backdrop,
  Stack,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

const EmailListGenerator = ({ data }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [copiedClient, setCopiedClient] = useState(null);

  // **Psych Writers (Updated with Correct Emails)**
  const psychWriters = {
    "Becca Kennedy": "becca@peerlinkmedical.com",
    "Eliza Gómez Toro": "elizagomeztoro4545@gmail.com",
    "Khwaish Vasnani": "khwaishvasnani@gmail.com",
    "Lina Gutierrez": "linis2791@gmail.com",
    "Mary Lorens Goyenechea": "lorensgee1@gmail.com",
    "Maja Loja": "lojamaja@gmail.com",
    "Ravit Haleva": "ravithaleva@gmail.com",
    "Shaila Anne Maramara": "shailamaramara@gmail.com",
    "Will Smith": "will@peerlinkmedical.com",
    "Addison Marimberga": "addison@peerlinkmedical.com",
  };

  // **Group Emails by Client**
  const groupedEmails = data.reduce((acc, item) => {
    const clientsArray = item.clients.split(",").map((client) => client.trim());
    clientsArray.forEach((client) => {
      if (!acc[client]) acc[client] = [];
      if (!acc[client].includes(item.email)) acc[client].push(item.email);
    });
    return acc;
  }, {});

  // **Generate "All" Emails List (Unique Emails)**
  const allEmails = [...new Set(data.map((item) => item.email))];

  // **Generate "Psych" Emails List (Using Verified Psych Writers)**
  const psychEmails = Object.values(psychWriters);

  // **Insert "All" and "Psych" Categories at the Top**
  const emailCategories = {
    All: allEmails,
    Psych: psychEmails,
    ...groupedEmails, // Append all other clients after "All" and "Psych"
  };

  // Function to copy addresses for a given client (comma-separated for Bcc)
  const handleCopy = (client) => {
    const textToCopy = emailCategories[client].join(", ");
    navigator.clipboard.writeText(textToCopy);
    setCopiedClient(client);

    // Reset after 1 second
    setTimeout(() => setCopiedClient(null), 1000);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#000000" }}>
        Email List Generator
      </Typography>

      {/* ✅ Modular Grid Layout */}
      <Grid container spacing={2}>
        {Object.keys(emailCategories).map((client) => (
          <Grid item xs={12} sm={6} md={4} key={client}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                textAlign: "center",
                backgroundColor: "#fff",
                transition: "0.3s ease-in-out",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#E3F2FD" },
              }}
              onClick={() => setSelectedClient(client)}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {client}
              </Typography>
              <Button variant="contained" color="primary" fullWidth>
                Show Emails
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ✅ POPUP MODAL FOR EMAIL LIST (Comma-Separated) */}
      <Modal
        open={Boolean(selectedClient)}
        onClose={() => setSelectedClient(null)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 300 }}
      >
        <Fade in={Boolean(selectedClient)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "50%",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            {/* Modal Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {selectedClient} Emails
              </Typography>
              <IconButton onClick={() => setSelectedClient(null)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            {/* Email List (Comma-Separated) */}
            <Box sx={{ p: 2, backgroundColor: "#F5F5F5", borderRadius: 1 }}>
              <Typography
                sx={{
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  fontSize: "14px",
                }}
              >
                {emailCategories[selectedClient]?.join(", ")}
              </Typography>
            </Box>

            {/* Copy Button */}
            <Button
              variant="outlined"
              onClick={() => handleCopy(selectedClient)}
              fullWidth
              sx={{ mt: 2 }}
              startIcon={
                copiedClient === selectedClient ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <ContentCopyIcon />
                )
              }
            >
              {copiedClient === selectedClient ? "Copied!" : "Copy Addresses"}
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default EmailListGenerator;
