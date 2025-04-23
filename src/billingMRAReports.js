// src/billingMRAReports.js

import AdminFLData from "./AdminFLData";

/**
 * A simple data‐source of MRAs for your billing tool.
 * Exposes: name, email, clients, and costPerCase per client.
 */
const billingMRAReports = AdminFLData.map(
  ({ name, email, clients, costPerCase }) => ({
    name,
    email,
    clients,      // <-- now carried through
    costPerCase,
  })
);

export default billingMRAReports;
