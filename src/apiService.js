// src/apiService.js

import FLData from "./FLData";
import QAData from "./QAData";
import FeedbackData from "./FeedbackData";

const USE_MOCK_DATA = false;

export const fetchReviewerData = async (
  d1 = "2025-01-01",
  d2 = "2025-01-03",
  forceMock = false
) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for Reviewer Data.");
      return FLData;
    } else {
      const endpointUrl = `http://localhost:5000/api/reviewer-stats?d1=${d1}&d2=${d2}`;
      console.log("Fetching Reviewer Data from local proxy:", endpointUrl);

      const response = await fetch(endpointUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Reviewer Data loaded from proxy.");
      return data;
    }
  } catch (error) {
    console.error("Error fetching Reviewer Data from proxy:", error);
    console.log("Falling back to MOCK data.");
    return FLData;
  }
};

/**
 * Fetch QA Data (Quality Assurance Data) from the live API.
 */
export const fetchQualityData = async (forceMock = false) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for QA Data.");
      return QAData;
    } else {
      // Replace the URL below with your live QA API endpoint when ready.
      const endpointUrl = "https://my-json-server-9oad.onrender.com/mockQAData";
      console.log("Fetching QA Data from live API endpoint...", endpointUrl);
      const response = await fetch(endpointUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("QA Data successfully loaded.");
      return data;
    }
  } catch (error) {
    console.error("Error fetching QA Data:", error);
    console.log("Falling back to MOCK data.");
    return QAData;
  }
};

/**
 * Fetch Feedback Data from the live API.
 */
export const fetchFeedbackData = async (forceMock = false) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for Feedback Data.");
      return FeedbackData;
    } else {
      // Replace the URL below with your live Feedback API endpoint when ready.
      const endpointUrl = "https://my-json-server-9oad.onrender.com/mockFeedbackData";
      console.log("Fetching Feedback Data from live API endpoint...", endpointUrl);
      const response = await fetch(endpointUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Feedback Data successfully loaded.");
      return data;
    }
  } catch (error) {
    console.error("Error fetching Feedback Data:", error);
    console.log("Falling back to MOCK data.");
    return FeedbackData;
  }
};

const apiService = {
  fetchReviewerData,
  fetchQualityData,
  fetchFeedbackData
};

export default apiService;
