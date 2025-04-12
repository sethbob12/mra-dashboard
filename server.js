// src/apiService.js

// Import mock data as fallback
import FLData from "./FLData";
import QAData from "./QAData";
import FeedbackData from "./FeedbackData";

// Toggle to force using mock data (for debugging/demonstration)
const USE_MOCK_DATA = false;

/**
 * Fetch Reviewer Data directly from the live API.
 */
export const fetchReviewerData = async (
  d1 = "2025-01-01",
  d2 = "2025-01-03",
  forceMock = false
) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for Reviewer Data.");
      return FLData;
    }

    const endpointUrl = `https://apifm.peerxc.com/api/reviewer-stats?d1=${d1}&d2=${d2}`;
    console.log("Fetching Reviewer Data from live API:", endpointUrl);

    const response = await fetch(endpointUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "pxc-super-secret-key",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Reviewer Data successfully loaded from live API.");
    return data;
  } catch (error) {
    console.error("Error fetching Reviewer Data from live API:", error);
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
    }
    const endpointUrl = "https://apifm.peerxc.com/api/mockQAData"; // update when real QA endpoint exists
    console.log("Fetching QA Data from live API endpoint...", endpointUrl);
    const response = await fetch(endpointUrl, {
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    console.log("QA Data successfully loaded.");
    return data;
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
    }
    const endpointUrl = "https://apifm.peerxc.com/api/mockFeedbackData"; // update when real Feedback endpoint exists
    console.log("Fetching Feedback Data from live API endpoint...", endpointUrl);
    const response = await fetch(endpointUrl, {
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    console.log("Feedback Data successfully loaded.");
    return data;
  } catch (error) {
    console.error("Error fetching Feedback Data:", error);
    console.log("Falling back to MOCK data.");
    return FeedbackData;
  }
};

const apiService = {
  fetchReviewerData,
  fetchQualityData,
  fetchFeedbackData,
};

export default apiService;
