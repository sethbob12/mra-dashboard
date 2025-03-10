// src/apiService.js
import FLData from "./FLData";      // Mock Data
import QAData from "./QAData";
import FeedbackData from "./FeedbackData";

// Optional: simulate a short delay for mock calls
const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Toggle between mock and live (used if you want a forced fallback)
const USE_MOCK_DATA = false;

// Reviewer Data
export const fetchReviewerData = async (forceMock = false) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for Reviewer Data.");
      await simulateDelay(500);
      return FLData;
    } else {
      console.log("Fetching LIVE Reviewer Data from Render...");
      const response = await fetch("https://my-json-server-9oad.onrender.com/mockFLData"); //THIS IS WHERE LIVE API ENDPOINT WILL GO//
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Live Reviewer Data Loaded.");
      return data;
    }
  } catch (error) {
    console.error("Error fetching reviewer data:", error);
    console.log("Falling back to mock data.");
    return FLData;
  }
};

// QA Data
export const fetchQualityData = async (forceMock = false) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for QA Data.");
      await simulateDelay(500);
      return QAData;
    } else {
      console.log("Fetching LIVE QA Data from Render...");
      const response = await fetch("https://my-json-server-9oad.onrender.com/mockQAData");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Live QA Data Loaded.");
      return data;
    }
  } catch (error) {
    console.error("Error fetching QA data:", error);
    console.log("Falling back to mock data.");
    return QAData;
  }
};

// Feedback Data
export const fetchFeedbackData = async (forceMock = false) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for Feedback.");
      await simulateDelay(500);
      return FeedbackData;
    } else {
      console.log("Fetching LIVE Feedback Data from Render...");
      const response = await fetch("https://my-json-server-9oad.onrender.com/mockFeedbackData");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Live Feedback Data Loaded.");
      return data;
    }
  } catch (error) {
    console.error("Error fetching feedback data:", error);
    console.log("Falling back to mock data.");
    return FeedbackData;
  }
};

const apiService = {
  fetchReviewerData,
  fetchQualityData,
  fetchFeedbackData
};

export default apiService;
