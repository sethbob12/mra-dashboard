// billingSLReports.js

import SLData from "./SLData";

/**
 * A minimal data source for Senior Leaders (SLs).
 * Exposes only: name and costPerCase.
 */
const billingSLReports = SLData.map(({ name, costPerCase }) => ({
  name,
  costPerCase
}));

export default billingSLReports;
