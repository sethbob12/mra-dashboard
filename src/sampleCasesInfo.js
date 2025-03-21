// src/sampleCasesInfo.js

// Helper function to title-case a string (capitalize the first letter of each word)
const titleCase = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  const clients = [
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
  
  const nonPsychCaseTypes = [
    "anesthesiology",
    "chiropractic",
    "colon and rectal surgery",
    "dermatology",
    "emergency medicine",
    "family medicine",
    "general surgery",
    "internal medicine",
    "neurology",
    "neurological surgery",
    "obstetrics and gynecology",
    "occupational medicine",
    "hematology and oncology",
    "ophthalmology",
    "neuroophthalmology",
    "orthopedic surgery",
    "otolaryngology",
    "pediatrics",
    "physical medicine & rehabilitation",
    "plastic surgery",
    "podiatry",
    "speech pathology",
    "urology",
    "medical toxicology",
    "nephrology",
    "pulmonary medicine",
    "critical care medicine",
    "endocrinology",
    "allergy & immunology",
    "sleep medicine",
    "vascular surgery",
    "neuromuscular medicine",
  ];
  
  const psychCaseTypes = ["psychiatry", "psychology", "neuropsychology"];
  
  // Generate 200 sample cases.
  const sampleCasesInfo = Array.from({ length: 200 }, (_, i) => {
    // Cycle claimant IDs through C1000 to C1099.
    const claimantId = "C" + (1000 + (i % 100)).toString();
    // Cycle through the clients.
    const client = clients[i % clients.length];
    // Every 10th sample is psych; others are non-psych.
    const isPsych = i % 10 === 0;
    const caseTypeRaw = isPsych
      ? psychCaseTypes[i % psychCaseTypes.length]
      : nonPsychCaseTypes[i % nonPsychCaseTypes.length];
    const caseType = titleCase(caseTypeRaw);
    // Case length: vary between roughly 200 and 710.
    const caseLength = 200 + (i % 17) * 30;
    // Create a caseID in the form "2xxxx-01".
    const caseID =
      "20" + ("" + (100 + i)).slice(-5) + "-01"; // e.g., "20000-01", "20001-01", etc.
    // For priorCaseWriter, about 40% of cases (and not for psych cases) get a priorCaseWriter.
    const addPrior = i % 3 === 0 && i % 10 !== 0;
    const priorCaseWriter = addPrior ? "Reviewer " + ((i % 15) + 1) : undefined;
    const obj = { caseID, claimantId, client, caseType, caseLength };
    if (priorCaseWriter) obj.priorCaseWriter = priorCaseWriter;
    return obj;
  });
  
  export default sampleCasesInfo;
  