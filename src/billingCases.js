// src/billingCases.js

import billingMRAReports from "./billingMRAReports";

// full list of clients & statuses
export const CLIENTS = [
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
export const STATUSES = ["Released", "Pending", "MRA", "QA"];

// total number of mock cases
const TOTAL_CASES = 800;

// helper to get a random integer in [min..max]
const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// helper to pick a random date between two dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const START = new Date("2025-01-01");
const END = new Date("2025-04-15");

const billingCases = [];

// 1) First 9 rows: guarantee one case per client, sequential IDs 5-0000..5-0008
CLIENTS.forEach((client, idx) => {
  const status = STATUSES[randInt(0, STATUSES.length - 1)];
  const date = randomDate(START, END);
  const submittedAt = date.toISOString().slice(0, 10); // YYYY-MM-DD
  const mra =
    billingMRAReports[randInt(0, billingMRAReports.length - 1)].name;
  const caseID = `5-${String(idx).padStart(4, "0")}`;

  billingCases.push({ caseID, submittedAt, status, client, mra });
});

// 2) Fill up to TOTAL_CASES with a round-robin of clients (IDs 5-0009..5-0199)
for (let i = billingCases.length; i < TOTAL_CASES; i++) {
  const client = CLIENTS[i % CLIENTS.length];
  const status = STATUSES[randInt(0, STATUSES.length - 1)];
  const date = randomDate(START, END);
  const submittedAt = date.toISOString().slice(0, 10);
  const mra =
    billingMRAReports[randInt(0, billingMRAReports.length - 1)].name;
  const caseID = `5-${String(i).padStart(4, "0")}`;

  billingCases.push({ caseID, submittedAt, status, client, mra });
}

export default billingCases;
