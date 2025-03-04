// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Container, CssBaseline } from "@mui/material";
import Navbar from "./Navbar";
import Home from "./Home"; // NEW Home Page
import FLTable from "./FLTable";
import FLChart from "./FLChart";
import EmailListGenerator from "./EmailListGenerator";
import QAFeedbackAggregator from "./QAFeedbackAggregator";
import ClientFeedbackAggregator from "./ClientFeedbackAggregator";
import Reports from "./Reports";
import QAMetrics from "./QAMetrics"; // Import your new QA Metrics component
import FLData from "./FLData";
import FeedbackData from "./FeedbackData";

// Full list of reviewers
const reviewers = [
  "Alyssa Teves", "Beatrice Solon", "Becca Kennedy", "Chukwudi Akubueze", "Chris Ekundare",
  "Dilay Ackan", "Ebenezer Arisa", "Emmanuel Uduigwome", "Eliza Gomez", "Erika Sucgang",
  "Geni Payales", "Ieva Puidoke", "Ileri Lawal", "Iyanuoluwa Oni", "Joshua Arisa",
  "Joan Ajayi", "Khwaish Vasnani", "Lina Gutierrez", "Mary Goyenechea", "Mary Galos",
  "Maja Loja", "Miray Kaptan", "Oluseye Oluremi", "Oluwadamilola Ogunsemowo", "Thomas Oyinlola",
  "Ravit Haleva", "Sarah Watkins", "Shaila Maramara", "Vincent Medicielo", "Will Smith",
  "Yllana Saavedra", "Temilola Edu", "Toluwani Merari", "Oluwapelumi Gabriel", "Tolulope Ajayi",
  "Addison Marimberga", "Goodluck Odii", "Fiyinfoluwa Yemi-Lebi", "Elizabeth Adeyanju", "Opemipo Ade-Akingboye",
  "Lebari Damgbor", "Uchechukwu Ejike", "Oluwaseyi Adare", "Mariam Akubo", "Jamiu Olurunnisola",
  "Al Ameen Kalejaiye", "Solomon Bailey", "Oluwafemi Durojaiye"
];

const fetchReportData = (filters) => {
  console.log("Fetching report with filters:", filters);
};

function App() {
  return (
    <>
      <CssBaseline />
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} /> {/* Home Page */}
          <Route path="/table" element={<FLTable data={FLData} />} /> {/* Table at /table */}
          <Route path="/chart" element={<FLChart data={FLData} />} />
          <Route path="/emails" element={<EmailListGenerator data={FLData} />} />
          <Route path="/qa-feedback" element={<QAFeedbackAggregator feedbackData={FeedbackData} />} />
          <Route path="/client-feedback" element={<ClientFeedbackAggregator feedbackData={FeedbackData} />} />
          <Route path="/reports" element={<Reports reviewers={reviewers} fetchReportData={fetchReportData} />} />
          {/* New QA Metrics route */}
          <Route path="/qa-metrics" element={<QAMetrics />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
