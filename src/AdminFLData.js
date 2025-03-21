// AdminFLData.js
// This file transforms the existing FLData into the Admin Reviewer Schema,
// using tzLookup to assign correct timezones, countries, and base coordinates.

const tzLookup = {
    "alyssakristins@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "beatricesolon@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "becca@peerlinkmedical.com": { timezone: "America/Chicago", country: "United States", baseLat: 41.8781, baseLng: -87.6298 },
    "kudiakubueze@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "chrisekundare@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "dilay.akcan@gmail.com": { timezone: "Europe/Istanbul", country: "Turkey", baseLat: 41.0082, baseLng: 28.9784 },
    "ebenezerarisa17@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "eo.uduigwome@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "elizagomeztoro4545@gmail.com": { timezone: "America/Bogota", country: "Colombia", baseLat: 4.7110, baseLng: -74.0721 },
    "theerikajee@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "grpayales@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "Ieva.puidoke@gmail.com": { timezone: "Europe/Vilnius", country: "Lithuania", baseLat: 54.6872, baseLng: 25.2797 },
    "ilerioluwalawal@outlook.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "iyanuopemipo@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "joshuaarisa14@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "joanoajayi@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "khwaishvasnani@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "linis2791@gmail.com": { timezone: "America/Bogota", country: "Colombia", baseLat: 4.7110, baseLng: -74.0721 },
    "lorensgee1@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "cornillezjoyce@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "lojamaja@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "oluseyekoluremi@su.edu.ph": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "damilolamogunsemowo@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "thomasoyinlola@yahoo.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "ravithaleva@gmail.com": { timezone: "Europe/Istanbul", country: "Turkey", baseLat: 41.0082, baseLng: 28.9784 },
    "sarahw445@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "shailamaramara@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "medicielo.prosvincent@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "will@peerlinkmedical.com": { timezone: "America/Chicago", country: "United States", baseLat: 41.8781, baseLng: -87.6298 },
    "iyannsaavedra@gmail.com": { timezone: "Asia/Manila", country: "Philippines", baseLat: 14.5995, baseLng: 120.9842 },
    "temilolaedun@outlook.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "nt.merari@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "pelumio.gabriel@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "to.ajayimd@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "addison@peerlinkmedical.com": { timezone: "America/Chicago", country: "United States", baseLat: 41.8781, baseLng: -87.6298 },
    "goodluckmodii@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "fiyinmlebi@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "elizabethmadeyanju@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "opemipomade@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "lebarimdamgbor@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "uchemejike@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "oluwaseyimadare@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "mariammakubo@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "jamiumolorunnisola@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "alameenmkalejaiye@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "solomonmbailey@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 },
    "oluwafemimdurojaiye@gmail.com": { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 }
  };
  
  // For any email not found in tzLookup, we use a default:
  const defaultTz = { timezone: "Africa/Lagos", country: "Nigeria", baseLat: 6.5244, baseLng: 3.3792 };
  
  const caseLengthOptions = ["≤200", "200-500", "500-1000", "1000+", "Any"];
  
  // Helper to get timezone info for an email:
  const getTzInfo = (email) => tzLookup[email] || defaultTz;
  
  const AdminFLData = [
    {
      id: 1,
      mra_id: 1,
      name: "Alyssa Teves",
      email: "alyssakristins@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_1.jpg",
      location: {
        country: getTzInfo("alyssakristins@gmail.com").country,
        latitude: getTzInfo("alyssakristins@gmail.com").baseLat + (1 % 5) * 0.01,
        longitude: getTzInfo("alyssakristins@gmail.com").baseLng + (1 % 5) * 0.01,
        timezone: getTzInfo("alyssakristins@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Muckleshoot"],
      caseType: "Non-Psych",
      dailyCaseLimit: (1 % 7) + 2, // 3
      caseLengthPreference: caseLengthOptions[1 % 5], // "200-500"
      currentWorkload: 1 % 9, // 1
      availability: (1 % 9) < ((1 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 92,
      accuracyScore: 64.84,
      overallQualityScore: 75.85,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (1 % 25), // 13
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 2,
      mra_id: 2,
      name: "Beatrice Solon",
      email: "beatricesolon@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_2.jpg",
      location: {
        country: getTzInfo("beatricesolon@gmail.com").country,
        latitude: getTzInfo("beatricesolon@gmail.com").baseLat + (2 % 5) * 0.01,
        longitude: getTzInfo("beatricesolon@gmail.com").baseLng + (2 % 5) * 0.01,
        timezone: getTzInfo("beatricesolon@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "LTC"],
      caseType: "Both",
      dailyCaseLimit: (2 % 7) + 2, // 4
      caseLengthPreference: caseLengthOptions[2 % 5], // "500-1000"
      currentWorkload: 2 % 9, // 2
      availability: (2 % 9) < ((2 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 75,
      accuracyScore: 70.37,
      overallQualityScore: 75.27,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (2 % 25), // 14
      revisionAvailability: "Available",
      lastSnapshot: "2025-01-02T12:34:56Z"
    },
    {
      id: 3,
      mra_id: 3,
      name: "Becca Kennedy",
      email: "becca@peerlinkmedical.com",
      headshotUrl: "https://example.com/headshots/mra_3.jpg",
      location: {
        country: getTzInfo("becca@peerlinkmedical.com").country,
        latitude: getTzInfo("becca@peerlinkmedical.com").baseLat + (3 % 5) * 0.01,
        longitude: getTzInfo("becca@peerlinkmedical.com").baseLng + (3 % 5) * 0.01,
        timezone: getTzInfo("becca@peerlinkmedical.com").timezone
      },
      clients: ["PFR", "Lincoln"],
      caseType: "Psych",
      dailyCaseLimit: (3 % 7) + 2, // 5
      caseLengthPreference: caseLengthOptions[3 % 5], // "1000+"
      currentWorkload: 3 % 9, // 3
      availability: (3 % 9) < ((3 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 88,
      accuracyScore: 50.0,
      overallQualityScore: 66.4,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (3 % 25), // 15
      revisionAvailability: "Available",
      lastSnapshot: "2024-06-11T12:34:56Z"
    },
    {
      id: 4,
      mra_id: 4,
      name: "Chukwudi Akubueze",
      email: "kudiakubueze@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_4.jpg",
      location: {
        country: getTzInfo("kudiakubueze@gmail.com").country,
        latitude: getTzInfo("kudiakubueze@gmail.com").baseLat + (4 % 5) * 0.01,
        longitude: getTzInfo("kudiakubueze@gmail.com").baseLng + (4 % 5) * 0.01,
        timezone: getTzInfo("kudiakubueze@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "Standard"],
      caseType: "Non-Psych",
      dailyCaseLimit: (4 % 7) + 2, // 6
      caseLengthPreference: caseLengthOptions[4 % 5], // "Any"
      currentWorkload: 4 % 9, // 4
      availability: (4 % 9) < ((4 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 80,
      accuracyScore: 78.67,
      overallQualityScore: 80.95,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (4 % 25), // 16
      revisionAvailability: "Available",
      lastSnapshot: "2024-02-16T12:34:56Z"
    },
    {
      id: 5,
      mra_id: 5,
      name: "Chris Ekundare",
      email: "chrisekundare@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_5.jpg",
      location: {
        country: getTzInfo("chrisekundare@gmail.com").country,
        latitude: getTzInfo("chrisekundare@gmail.com").baseLat + (5 % 5) * 0.01, // no offset since 5 % 5 = 0
        longitude: getTzInfo("chrisekundare@gmail.com").baseLng + (5 % 5) * 0.01,
        timezone: getTzInfo("chrisekundare@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford"],
      caseType: "Non-Psych",
      dailyCaseLimit: (5 % 7) + 2, // 7
      caseLengthPreference: caseLengthOptions[5 % 5], // index 0 -> "≤200"
      currentWorkload: 5 % 9, // 5
      availability: (5 % 9) < ((5 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 98,
      accuracyScore: 89.57,
      overallQualityScore: 93.09,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (5 % 25), // 17
      revisionAvailability: "Available",
      lastSnapshot: "2025-02-22T12:34:56Z"
    },
    {
      id: 6,
      mra_id: 6,
      name: "Dilay Ackan",
      email: "dilay.akcan@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_6.jpg",
      location: {
        country: getTzInfo("dilay.akcan@gmail.com").country,
        latitude: getTzInfo("dilay.akcan@gmail.com").baseLat + (6 % 5) * 0.01,
        longitude: getTzInfo("dilay.akcan@gmail.com").baseLng + (6 % 5) * 0.01,
        timezone: getTzInfo("dilay.akcan@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "NYL", "Standard", "LTC"],
      caseType: "Non-Psych",
      dailyCaseLimit: (6 % 7) + 2, // 8
      caseLengthPreference: caseLengthOptions[6 % 5], // index 1 -> "200-500"
      currentWorkload: 6 % 9, // 6
      availability: (6 % 9) < ((6 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 90,
      accuracyScore: 62.62,
      overallQualityScore: 74.92,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (6 % 25), // 18
      revisionAvailability: "Available",
      lastSnapshot: "2025-02-09T12:34:56Z"
    },
    {
      id: 7,
      mra_id: 7,
      name: "Ebenezer Arisa",
      email: "ebenezerarisa17@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_7.jpg",
      location: {
        country: getTzInfo("ebenezerarisa17@gmail.com").country,
        latitude: getTzInfo("ebenezerarisa17@gmail.com").baseLat + (7 % 5) * 0.01,
        longitude: getTzInfo("ebenezerarisa17@gmail.com").baseLng + (7 % 5) * 0.01,
        timezone: getTzInfo("ebenezerarisa17@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford"],
      caseType: "Non-Psych",
      dailyCaseLimit: (7 % 7) + 2, // 2
      caseLengthPreference: caseLengthOptions[7 % 5], // index 2 -> "500-1000"
      currentWorkload: 7 % 9, // 7
      availability: (7 % 9) < ((7 % 7) + 2) ? "Available" : "Full", // 7 >= 2 → "Full"
      onTimePercentage: 92,
      accuracyScore: 66.32,
      overallQualityScore: 76.94,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (7 % 25), // 19
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 8,
      mra_id: 8,
      name: "Emmanuel Uduigwome",
      email: "eo.uduigwome@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_8.jpg",
      location: {
        country: getTzInfo("eo.uduigwome@gmail.com").country,
        latitude: getTzInfo("eo.uduigwome@gmail.com").baseLat + (8 % 5) * 0.01,
        longitude: getTzInfo("eo.uduigwome@gmail.com").baseLng + (8 % 5) * 0.01,
        timezone: getTzInfo("eo.uduigwome@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "NYL"],
      caseType: "Non-Psych",
      dailyCaseLimit: (8 % 7) + 2, // (8 % 7 = 1) + 2 = 3
      caseLengthPreference: caseLengthOptions[8 % 5], // index 3 -> "1000+"
      currentWorkload: 8 % 9, // 8
      availability: (8 % 9) < ((8 % 7) + 2) ? "Available" : "Full", // 8 >= 3 → "Full"
      onTimePercentage: 94,
      accuracyScore: 81.65,
      overallQualityScore: 87.24,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (8 % 25), // 12+8 = 20
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 9,
      mra_id: 9,
      name: "Eliza Gomez",
      email: "elizagomeztoro4545@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_9.jpg",
      location: {
        country: getTzInfo("elizagomeztoro4545@gmail.com").country,
        latitude: getTzInfo("elizagomeztoro4545@gmail.com").baseLat + (9 % 5) * 0.01,
        longitude: getTzInfo("elizagomeztoro4545@gmail.com").baseLng + (9 % 5) * 0.01,
        timezone: getTzInfo("elizagomeztoro4545@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "NYL"],
      caseType: "Both",
      dailyCaseLimit: (9 % 7) + 2, // (9 % 7 = 2) + 2 = 4
      caseLengthPreference: caseLengthOptions[9 % 5], // index 4 -> "Any"
      currentWorkload: 9 % 9, // 0
      availability: (9 % 9) < ((9 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 85,
      accuracyScore: 67.74,
      overallQualityScore: 74.75,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (9 % 25), // 12+9 = 21
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 10,
      mra_id: 10,
      name: "Erika Sucgang",
      email: "theerikajee@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_10.jpg",
      location: {
        country: getTzInfo("theerikajee@gmail.com").country,
        latitude: getTzInfo("theerikajee@gmail.com").baseLat + (10 % 5) * 0.01,
        longitude: getTzInfo("theerikajee@gmail.com").baseLng + (10 % 5) * 0.01,
        timezone: getTzInfo("theerikajee@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford"],
      caseType: "Non-Psych",
      dailyCaseLimit: (10 % 7) + 2, // (10 % 7 = 3) + 2 = 5
      caseLengthPreference: caseLengthOptions[10 % 5], // index 0 -> "≤200"
      currentWorkload: 10 % 9, // 1
      availability: (10 % 9) < ((10 % 7) + 2) ? "Available" : "Full", // 1 < 5 → "Available"
      onTimePercentage: 94,
      accuracyScore: 61.9,
      overallQualityScore: 74.14,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (10 % 25), // 12+10 = 22
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 11,
      mra_id: 11,
      name: "Geni Payales",
      email: "grpayales@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_11.jpg",
      location: {
        country: getTzInfo("grpayales@gmail.com").country,
        latitude: getTzInfo("grpayales@gmail.com").baseLat + (11 % 5) * 0.01,
        longitude: getTzInfo("grpayales@gmail.com").baseLng + (11 % 5) * 0.01,
        timezone: getTzInfo("grpayales@gmail.com").timezone
      },
      clients: ["PFR"],
      caseType: "Non-Psych",
      dailyCaseLimit: (11 % 7) + 2, // (11 % 7 = 4) + 2 = 6
      caseLengthPreference: caseLengthOptions[11 % 5], // index 1 -> "200-500"
      currentWorkload: 11 % 9, // 2
      availability: (11 % 9) < ((11 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 93,
      accuracyScore: 90.12,
      overallQualityScore: 90.72,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (11 % 25), // 12+11 = 23
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 12,
      mra_id: 12,
      name: "Ieva Puidoke",
      email: "Ieva.puidoke@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_12.jpg",
      location: {
        country: getTzInfo("Ieva.puidoke@gmail.com").country,
        latitude: getTzInfo("Ieva.puidoke@gmail.com").baseLat + (12 % 5) * 0.01,
        longitude: getTzInfo("Ieva.puidoke@gmail.com").baseLng + (12 % 5) * 0.01,
        timezone: getTzInfo("Ieva.puidoke@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco"],
      caseType: "Non-Psych",
      dailyCaseLimit: (12 % 7) + 2, // (12 % 7 = 5) + 2 = 7
      caseLengthPreference: caseLengthOptions[12 % 5], // index 2 -> "500-1000"
      currentWorkload: 12 % 9, // 3
      availability: (12 % 9) < ((12 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 92,
      accuracyScore: 62.5,
      overallQualityScore: 73.1,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (12 % 25), // 12+12 = 24
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 13,
      mra_id: 13,
      name: "Ileri Lawal",
      email: "ilerioluwalawal@outlook.com",
      headshotUrl: "https://example.com/headshots/mra_13.jpg",
      location: {
        country: getTzInfo("ilerioluwalawal@outlook.com").country,
        latitude: getTzInfo("ilerioluwalawal@outlook.com").baseLat + (13 % 5) * 0.01,
        longitude: getTzInfo("ilerioluwalawal@outlook.com").baseLng + (13 % 5) * 0.01,
        timezone: getTzInfo("ilerioluwalawal@outlook.com").timezone
      },
      clients: ["PFR"],
      caseType: "Non-Psych",
      dailyCaseLimit: (13 % 7) + 2, // (13 % 7 = 6) + 2 = 8
      caseLengthPreference: caseLengthOptions[13 % 5], // index 3 -> "1000+"
      currentWorkload: 13 % 9, // 4
      availability: (13 % 9) < ((13 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 98,
      accuracyScore: 64.91,
      overallQualityScore: 75.4,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (13 % 25), // 12+13 = 25
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 14,
      mra_id: 14,
      name: "Iyanuoluwa Oni",
      email: "iyanuopemipo@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_14.jpg",
      location: {
        country: getTzInfo("iyanuopemipo@gmail.com").country,
        latitude: getTzInfo("iyanuopemipo@gmail.com").baseLat + (14 % 5) * 0.01,
        longitude: getTzInfo("iyanuopemipo@gmail.com").baseLng + (14 % 5) * 0.01,
        timezone: getTzInfo("iyanuopemipo@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "LTC"],
      caseType: "Non-Psych",
      dailyCaseLimit: (14 % 7) + 2, // (14 % 7 = 0) + 2 = 2
      caseLengthPreference: caseLengthOptions[14 % 5], // index 4 -> "Any"
      currentWorkload: 14 % 9, // 5
      availability: (14 % 9) < ((14 % 7) + 2) ? "Available" : "Full", // 5 >= 2 → "Full"
      onTimePercentage: 92,
      accuracyScore: 66.67,
      overallQualityScore: 74.8,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (14 % 25), // 12+14 = 26
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 15,
      mra_id: 15,
      name: "Joshua Arisa",
      email: "joshuaarisa14@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_15.jpg",
      location: {
        country: getTzInfo("joshuaarisa14@gmail.com").country,
        latitude: getTzInfo("joshuaarisa14@gmail.com").baseLat + (15 % 5) * 0.01,
        longitude: getTzInfo("joshuaarisa14@gmail.com").baseLng + (15 % 5) * 0.01,
        timezone: getTzInfo("joshuaarisa14@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "LTC"],
      caseType: "Non-Psych",
      dailyCaseLimit: (15 % 7) + 2, // (15 % 7 = 1) + 2 = 3
      caseLengthPreference: caseLengthOptions[15 % 5], // index 0 -> "≤200"
      currentWorkload: 15 % 9, // 6
      availability: (15 % 9) < ((15 % 7) + 2) ? "Available" : "Full", // 6 >= 3 → "Full"
      onTimePercentage: 95,
      accuracyScore: 58.97,
      overallQualityScore: 72.28,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (15 % 25), // 12+15 = 27
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 16,
      mra_id: 16,
      name: "Joan Ajayi",
      email: "joanoajayi@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_16.jpg",
      location: {
        country: getTzInfo("joanoajayi@gmail.com").country,
        latitude: getTzInfo("joanoajayi@gmail.com").baseLat + (16 % 5) * 0.01,
        longitude: getTzInfo("joanoajayi@gmail.com").baseLng + (16 % 5) * 0.01,
        timezone: getTzInfo("joanoajayi@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Muckleshoot"],
      caseType: "Non-Psych",
      dailyCaseLimit: (16 % 7) + 2, // (16 % 7 = 2) + 2 = 4
      caseLengthPreference: caseLengthOptions[16 % 5], // index 1 -> "200-500"
      currentWorkload: 16 % 9, // 7
      availability: (16 % 9) < ((16 % 7) + 2) ? "Available" : "Full", // 7 >= 4 → "Full"
      onTimePercentage: 86,
      accuracyScore: 55.56,
      overallQualityScore: 67.68,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (16 % 25), // 12+16 = 28
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 17,
      mra_id: 17,
      name: "Khwaish Vasnani",
      email: "khwaishvasnani@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_17.jpg",
      location: {
        country: getTzInfo("khwaishvasnani@gmail.com").country,
        latitude: getTzInfo("khwaishvasnani@gmail.com").baseLat + (17 % 5) * 0.01,
        longitude: getTzInfo("khwaishvasnani@gmail.com").baseLng + (17 % 5) * 0.01,
        timezone: getTzInfo("khwaishvasnani@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "NYL", "Muckleshoot", "Standard", "LTC"],
      caseType: "Psych",
      dailyCaseLimit: (17 % 7) + 2, // (17 % 7 = 3) + 2 = 5
      caseLengthPreference: caseLengthOptions[17 % 5], // index 2 -> "500-1000"
      currentWorkload: 17 % 9, // 8
      availability: (17 % 9) < ((17 % 7) + 2) ? "Available" : "Full", // 8 >= 5 → "Full"
      onTimePercentage: 96,
      accuracyScore: 81.48,
      overallQualityScore: 87.49,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (17 % 25), // 12+17 = 29
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 18,
      mra_id: 18,
      name: "Lina Gutierrez",
      email: "linis2791@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_18.jpg",
      location: {
        country: getTzInfo("linis2791@gmail.com").country,
        latitude: getTzInfo("linis2791@gmail.com").baseLat + (18 % 5) * 0.01,
        longitude: getTzInfo("linis2791@gmail.com").baseLng + (18 % 5) * 0.01,
        timezone: getTzInfo("linis2791@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "NYL", "Standard"],
      caseType: "Both",
      dailyCaseLimit: (18 % 7) + 2, // (18 % 7 = 4) + 2 = 6
      caseLengthPreference: caseLengthOptions[18 % 5], // index 3 -> "1000+"
      currentWorkload: 18 % 9, // 0
      availability: (18 % 9) < ((18 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 90,
      accuracyScore: 20.0,
      overallQualityScore: 47.75,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (18 % 25), // 12+18 = 30
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 19,
      mra_id: 19,
      name: "Mary Goyenechea",
      email: "lorensgee1@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_19.jpg",
      location: {
        country: getTzInfo("lorensgee1@gmail.com").country,
        latitude: getTzInfo("lorensgee1@gmail.com").baseLat + (19 % 5) * 0.01,
        longitude: getTzInfo("lorensgee1@gmail.com").baseLng + (19 % 5) * 0.01,
        timezone: getTzInfo("lorensgee1@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "NYL", "Standard"],
      caseType: "Both",
      dailyCaseLimit: (19 % 7) + 2, // (19 % 7 = 5) + 2 = 7
      caseLengthPreference: caseLengthOptions[19 % 5], // index 4 -> "Any"
      currentWorkload: 19 % 9, // 1
      availability: (19 % 9) < ((19 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 98,
      accuracyScore: 53.85,
      overallQualityScore: 68.51,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (19 % 25), // 12+19 = 31
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 20,
      mra_id: 20,
      name: "Mary Galos",
      email: "cornillezjoyce@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_20.jpg",
      location: {
        country: getTzInfo("cornillezjoyce@gmail.com").country,
        latitude: getTzInfo("cornillezjoyce@gmail.com").baseLat + (20 % 5) * 0.01,
        longitude: getTzInfo("cornillezjoyce@gmail.com").baseLng + (20 % 5) * 0.01,
        timezone: getTzInfo("cornillezjoyce@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "NYL"],
      caseType: "Non-Psych",
      dailyCaseLimit: (20 % 7) + 2, // (20 % 7 = 6) + 2 = 8
      caseLengthPreference: caseLengthOptions[20 % 5], // index 0 -> "≤200"
      currentWorkload: 20 % 9, // 2
      availability: (20 % 9) < ((20 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 88,
      accuracyScore: 78.72,
      overallQualityScore: 83.53,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (20 % 25), // 12+20 = 32
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 21,
      mra_id: 21,
      name: "Maja Loja",
      email: "lojamaja@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_21.jpg",
      location: {
        country: getTzInfo("lojamaja@gmail.com").country,
        latitude: getTzInfo("lojamaja@gmail.com").baseLat + (21 % 5) * 0.01,
        longitude: getTzInfo("lojamaja@gmail.com").baseLng + (21 % 5) * 0.01,
        timezone: getTzInfo("lojamaja@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "NYL", "Standard"],
      caseType: "Both",
      dailyCaseLimit: (21 % 7) + 2, // (21 % 7 = 0) + 2 = 2
      caseLengthPreference: caseLengthOptions[21 % 5], // index 1 -> "200-500"
      currentWorkload: 21 % 9, // 3
      availability: (21 % 9) < ((21 % 7) + 2) ? "Available" : "Full", // 3 >= 2 → "Full"
      onTimePercentage: 95,
      accuracyScore: 67.68,
      overallQualityScore: 78.56,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (21 % 25), // 12+21 = 33
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 22,
      mra_id: 22,
      name: "Next Reviewer",
      email: "test@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_22.jpg",
      location: {
        // "test@gmail.com" not found in tzLookup; using default.
        country: defaultTz.country,
        latitude: defaultTz.baseLat + (22 % 5) * 0.01,
        longitude: defaultTz.baseLng + (22 % 5) * 0.01,
        timezone: defaultTz.timezone
      },
      clients: ["PFR", "Lincoln", "Hartford"],
      caseType: "Non-Psych",
      dailyCaseLimit: (22 % 7) + 2, // (22 % 7 = 1) + 2 = 3
      caseLengthPreference: caseLengthOptions[22 % 5], // index 2 -> "500-1000"
      currentWorkload: 22 % 9, // 4
      availability: (22 % 9) < ((22 % 7) + 2) ? "Available" : "Full", // 4 >= 3 → "Full"
      onTimePercentage: 82,
      accuracyScore: 87.5,
      overallQualityScore: 86.1,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (22 % 25), // 12+22 = 34
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 23,
      mra_id: 23,
      name: "Oluseye Oluremi",
      email: "oluseyekoluremi@su.edu.ph",
      headshotUrl: "https://example.com/headshots/mra_23.jpg",
      location: {
        country: getTzInfo("oluseyekoluremi@su.edu.ph").country,
        latitude: getTzInfo("oluseyekoluremi@su.edu.ph").baseLat + (23 % 5) * 0.01,
        longitude: getTzInfo("oluseyekoluremi@su.edu.ph").baseLng + (23 % 5) * 0.01,
        timezone: getTzInfo("oluseyekoluremi@su.edu.ph").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Standard"],
      caseType: "Non-Psych",
      dailyCaseLimit: (23 % 7) + 2, // (23 % 7 = 2) + 2 = 4
      caseLengthPreference: caseLengthOptions[23 % 5], // index 3 -> "1000+"
      currentWorkload: 23 % 9, // 5
      availability: (23 % 9) < ((23 % 7) + 2) ? "Available" : "Full", // 5 >= 4 → "Full"
      onTimePercentage: 95,
      accuracyScore: 96.15,
      overallQualityScore: 95.89,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (23 % 25), // 12+23 = 35
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 24,
      mra_id: 24,
      name: "Oluwadamilola Ogunsemowo",
      email: "damilolamogunsemowo@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_24.jpg",
      location: {
        country: getTzInfo("damilolamogunsemowo@gmail.com").country,
        latitude: getTzInfo("damilolamogunsemowo@gmail.com").baseLat + (24 % 5) * 0.01,
        longitude: getTzInfo("damilolamogunsemowo@gmail.com").baseLng + (24 % 5) * 0.01,
        timezone: getTzInfo("damilolamogunsemowo@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Standard"],
      caseType: "Non-Psych",
      dailyCaseLimit: (24 % 7) + 2, // (24 % 7 = 3) + 2 = 5
      caseLengthPreference: caseLengthOptions[24 % 5], // index 4 -> "Any"
      currentWorkload: 24 % 9, // 6
      availability: (24 % 9) < ((24 % 7) + 2) ? "Available" : "Full", // 6 >= 5 → "Full"
      onTimePercentage: 83,
      accuracyScore: 80.0,
      overallQualityScore: 81.6,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (24 % 25), // 12+24 = 36
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 25,
      mra_id: 25,
      name: "Thomas Oyinlola",
      email: "thomasoyinlola@yahoo.com",
      headshotUrl: "https://example.com/headshots/mra_25.jpg",
      location: {
        country: getTzInfo("thomasoyinlola@yahoo.com").country,
        latitude: getTzInfo("thomasoyinlola@yahoo.com").baseLat + (25 % 5) * 0.01,
        longitude: getTzInfo("thomasoyinlola@yahoo.com").baseLng + (25 % 5) * 0.01,
        timezone: getTzInfo("thomasoyinlola@yahoo.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Standard"],
      caseType: "Non-Psych",
      dailyCaseLimit: (25 % 7) + 2, // (25 % 7 = 4) + 2 = 6
      caseLengthPreference: caseLengthOptions[25 % 5], // index 0 -> "≤200"
      currentWorkload: 25 % 9, // 7
      availability: (25 % 9) < ((25 % 7) + 2) ? "Available" : "Full", // 7 >= 6 → "Full"
      onTimePercentage: 95,
      accuracyScore: 82.61,
      overallQualityScore: 86.32,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (25 % 25), // 25 % 25 = 0, so 12
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 26,
      mra_id: 26,
      name: "Ravit Haleva",
      email: "ravithaleva@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_26.jpg",
      location: {
        country: getTzInfo("ravithaleva@gmail.com").country,
        latitude: getTzInfo("ravithaleva@gmail.com").baseLat + (26 % 5) * 0.01,
        longitude: getTzInfo("ravithaleva@gmail.com").baseLng + (26 % 5) * 0.01,
        timezone: getTzInfo("ravithaleva@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "NYL", "Standard", "LTC", "Muckleshoot"],
      caseType: "Psych",
      dailyCaseLimit: (26 % 7) + 2, // (26 % 7 = 5) + 2 = 7
      caseLengthPreference: caseLengthOptions[26 % 5], // index 1 -> "200-500"
      currentWorkload: 26 % 9, // 8
      availability: (26 % 9) < ((26 % 7) + 2) ? "Available" : "Full", // 8 >= 7 → "Full"
      onTimePercentage: 95,
      accuracyScore: 83.33,
      overallQualityScore: 87.8,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (26 % 25), // (26 % 25 = 1) + 12 = 13
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 27,
      mra_id: 27,
      name: "Sarah Watkins",
      email: "sarahw445@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_27.jpg",
      location: {
        country: getTzInfo("sarahw445@gmail.com").country,
        latitude: getTzInfo("sarahw445@gmail.com").baseLat + (27 % 5) * 0.01,
        longitude: getTzInfo("sarahw445@gmail.com").baseLng + (27 % 5) * 0.01,
        timezone: getTzInfo("sarahw445@gmail.com").timezone
      },
      clients: ["Standard"],
      caseType: "Non-Psych",
      dailyCaseLimit: (27 % 7) + 2, // (27 % 7 = 6) + 2 = 8
      caseLengthPreference: caseLengthOptions[27 % 5], // index 2 -> "500-1000"
      currentWorkload: 27 % 9, // 0
      availability: (27 % 9) < ((27 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 76,
      accuracyScore: 49.21,
      overallQualityScore: 61.87,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (27 % 25), // (27 % 25 = 2) + 12 = 14
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 28,
      mra_id: 28,
      name: "Shaila Maramara",
      email: "shailamaramara@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_28.jpg",
      location: {
        country: getTzInfo("shailamaramara@gmail.com").country,
        latitude: getTzInfo("shailamaramara@gmail.com").baseLat + (28 % 5) * 0.01,
        longitude: getTzInfo("shailamaramara@gmail.com").baseLng + (28 % 5) * 0.01,
        timezone: getTzInfo("shailamaramara@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Standard"],
      caseType: "Psych",
      dailyCaseLimit: (28 % 7) + 2, // (28 % 7 = 0) + 2 = 2
      caseLengthPreference: caseLengthOptions[28 % 5], // index 3 -> "1000+"
      currentWorkload: 28 % 9, // 1
      availability: (28 % 9) < ((28 % 7) + 2) ? "Available" : "Full", // 1 < 2 → "Available"
      onTimePercentage: 94,
      accuracyScore: 64.29,
      overallQualityScore: 74.17,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (28 % 25), // (28 % 25 = 3) + 12 = 15
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 29,
      mra_id: 29,
      name: "Vincent Medicielo",
      email: "medicielo.prosvincent@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_29.jpg",
      location: {
        country: getTzInfo("medicielo.prosvincent@gmail.com").country,
        latitude: getTzInfo("medicielo.prosvincent@gmail.com").baseLat + (29 % 5) * 0.01,
        longitude: getTzInfo("medicielo.prosvincent@gmail.com").baseLng + (29 % 5) * 0.01,
        timezone: getTzInfo("medicielo.prosvincent@gmail.com").timezone
      },
      clients: ["PFR", "NYL"],
      caseType: "Non-Psych",
      dailyCaseLimit: (29 % 7) + 2, // (29 % 7 = 1) + 2 = 3
      caseLengthPreference: caseLengthOptions[29 % 5], // index 4 -> "Any"
      currentWorkload: 29 % 9, // 2
      availability: (29 % 9) < ((29 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 99,
      accuracyScore: 83.16,
      overallQualityScore: 88.44,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (29 % 25), // (29 % 25 = 4) + 12 = 16
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 30,
      mra_id: 30,
      name: "Will Smith",
      email: "will@peerlinkmedical.com",
      headshotUrl: "https://example.com/headshots/mra_30.jpg",
      location: {
        country: getTzInfo("will@peerlinkmedical.com").country,
        latitude: getTzInfo("will@peerlinkmedical.com").baseLat + (30 % 5) * 0.01,
        longitude: getTzInfo("will@peerlinkmedical.com").baseLng + (30 % 5) * 0.01,
        timezone: getTzInfo("will@peerlinkmedical.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "NYL", "Standard"],
      caseType: "Psych",
      dailyCaseLimit: (30 % 7) + 2, // (30 % 7 = 2) + 2 = 4
      caseLengthPreference: caseLengthOptions[30 % 5], // index 0 -> "≤200"
      currentWorkload: 30 % 9, // 3
      availability: (30 % 9) < ((30 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 85,
      accuracyScore: 50.0,
      overallQualityScore: 64.2,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (30 % 25), // (30 % 25 = 5) + 12 = 17
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 31,
      mra_id: 31,
      name: "Yllana Saavedra",
      email: "iyannsaavedra@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_31.jpg",
      location: {
        country: getTzInfo("iyannsaavedra@gmail.com").country,
        latitude: getTzInfo("iyannsaavedra@gmail.com").baseLat + (31 % 5) * 0.01,
        longitude: getTzInfo("iyannsaavedra@gmail.com").baseLng + (31 % 5) * 0.01,
        timezone: getTzInfo("iyannsaavedra@gmail.com").timezone
      },
      clients: ["PFR"],
      caseType: "Non-Psych",
      dailyCaseLimit: (31 % 7) + 2, // (31 % 7 = 3) + 2 = 5
      caseLengthPreference: caseLengthOptions[31 % 5], // index 1 -> "200-500"
      currentWorkload: 31 % 9, // 4
      availability: (31 % 9) < ((31 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 92,
      accuracyScore: 93.65,
      overallQualityScore: 91.74,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (31 % 25), // (31 % 25 = 6) + 12 = 18
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 32,
      mra_id: 32,
      name: "Temilola Edun",
      email: "temilolaedun@outlook.com",
      headshotUrl: "https://example.com/headshots/mra_32.jpg",
      location: {
        country: getTzInfo("temilolaedun@outlook.com").country,
        latitude: getTzInfo("temilolaedun@outlook.com").baseLat + (32 % 5) * 0.01,
        longitude: getTzInfo("temilolaedun@outlook.com").baseLng + (32 % 5) * 0.01,
        timezone: getTzInfo("temilolaedun@outlook.com").timezone
      },
      clients: ["PFR"],
      caseType: "Non-Psych",
      dailyCaseLimit: (32 % 7) + 2, // (32 % 7 = 4) + 2 = 6
      caseLengthPreference: caseLengthOptions[32 % 5], // index 2 -> "500-1000"
      currentWorkload: 32 % 9, // 5
      availability: (32 % 9) < ((32 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 96,
      accuracyScore: 94.59,
      overallQualityScore: 93.66,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (32 % 25), // (32 % 25 = 7) + 12 = 19
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 33,
      mra_id: 33,
      name: "Toluwani Merari",
      email: "nt.merari@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_33.jpg",
      location: {
        country: getTzInfo("nt.merari@gmail.com").country,
        latitude: getTzInfo("nt.merari@gmail.com").baseLat + (33 % 5) * 0.01,
        longitude: getTzInfo("nt.merari@gmail.com").baseLng + (33 % 5) * 0.01,
        timezone: getTzInfo("nt.merari@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln"],
      caseType: "Non-Psych",
      dailyCaseLimit: (33 % 7) + 2, // (33 % 7 = 5) + 2 = 7
      caseLengthPreference: caseLengthOptions[33 % 5], // index 3 -> "1000+"
      currentWorkload: 33 % 9, // 6
      availability: (33 % 9) < ((33 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 97,
      accuracyScore: 88.57,
      overallQualityScore: 90.24,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (33 % 25), // (33 % 25 = 8) + 12 = 20
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 34,
      mra_id: 34,
      name: "Oluwapelumi Gabriel",
      email: "pelumio.gabriel@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_34.jpg",
      location: {
        country: getTzInfo("pelumio.gabriel@gmail.com").country,
        latitude: getTzInfo("pelumio.gabriel@gmail.com").baseLat + (34 % 5) * 0.01,
        longitude: getTzInfo("pelumio.gabriel@gmail.com").baseLng + (34 % 5) * 0.01,
        timezone: getTzInfo("pelumio.gabriel@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln"],
      caseType: "Non-Psych",
      dailyCaseLimit: (34 % 7) + 2, // (34 % 7 = 6) + 2 = 8
      caseLengthPreference: caseLengthOptions[34 % 5], // index 4 -> "Any"
      currentWorkload: 34 % 9, // 7
      availability: (34 % 9) < ((34 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 97,
      accuracyScore: 94.2,
      overallQualityScore: 93.17,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (34 % 25), // (34 % 25 = 9) + 12 = 21
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 35,
      mra_id: 35,
      name: "Tolulope Ajayi",
      email: "to.ajayimd@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_35.jpg",
      location: {
        country: getTzInfo("to.ajayimd@gmail.com").country,
        latitude: getTzInfo("to.ajayimd@gmail.com").baseLat + (35 % 5) * 0.01,
        longitude: getTzInfo("to.ajayimd@gmail.com").baseLng + (35 % 5) * 0.01,
        timezone: getTzInfo("to.ajayimd@gmail.com").timezone
      },
      clients: ["PFR", "Lincoln"],
      caseType: "Non-Psych",
      dailyCaseLimit: (35 % 7) + 2, // (35 % 7 = 0) + 2 = 2
      caseLengthPreference: caseLengthOptions[35 % 5], // index 0 -> "≤200"
      currentWorkload: 35 % 9, // 8
      availability: (35 % 9) < ((35 % 7) + 2) ? "Available" : "Full", // 8 >= 2 → "Full"
      onTimePercentage: 98,
      accuracyScore: 87.5,
      overallQualityScore: 90.24,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (35 % 25), // (35 % 25 = 10) + 12 = 22
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 36,
      mra_id: 36,
      name: "Addison Marimberga",
      email: "addison@peerlinkmedical.com",
      headshotUrl: "https://example.com/headshots/mra_36.jpg",
      location: {
        country: getTzInfo("addison@peerlinkmedical.com").country,
        latitude: getTzInfo("addison@peerlinkmedical.com").baseLat + (36 % 5) * 0.01,
        longitude: getTzInfo("addison@peerlinkmedical.com").baseLng + (36 % 5) * 0.01,
        timezone: getTzInfo("addison@peerlinkmedical.com").timezone
      },
      clients: ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "NYL", "Standard"],
      caseType: "Psych",
      dailyCaseLimit: (36 % 7) + 2, // (36 % 7 = 1) + 2 = 3
      caseLengthPreference: caseLengthOptions[36 % 5], // index 1 -> "200-500"
      currentWorkload: 36 % 9, // 0
      availability: (36 % 9) < ((36 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 95,
      accuracyScore: 84.31,
      overallQualityScore: 88.69,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (36 % 25), // (36 % 25 = 11) + 12 = 23
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 37,
      mra_id: 37,
      name: "Goodluck Odii",
      email: "goodluckmodii@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_37.jpg",
      location: {
        country: getTzInfo("goodluckmodii@gmail.com").country,
        latitude: getTzInfo("goodluckmodii@gmail.com").baseLat + (37 % 5) * 0.01,
        longitude: getTzInfo("goodluckmodii@gmail.com").baseLng + (37 % 5) * 0.01,
        timezone: getTzInfo("goodluckmodii@gmail.com").timezone
      },
      clients: ["Lincoln"],
      caseType: "Non-Psych",
      dailyCaseLimit: (37 % 7) + 2, // (37 % 7 = 2) + 2 = 4
      caseLengthPreference: caseLengthOptions[37 % 5], // index 2 -> "500-1000"
      currentWorkload: 37 % 9, // 1
      availability: (37 % 9) < ((37 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 96,
      accuracyScore: 89.74,
      overallQualityScore: 90.95,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (37 % 25), // (37 % 25 = 12) + 12 = 24
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 38,
      mra_id: 38,
      name: "Fiyinfoluwa Yemi-Lebi",
      email: "fiyinmlebi@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_38.jpg",
      location: {
        country: getTzInfo("fiyinmlebi@gmail.com").country,
        latitude: getTzInfo("fiyinmlebi@gmail.com").baseLat + (38 % 5) * 0.01,
        longitude: getTzInfo("fiyinmlebi@gmail.com").baseLng + (38 % 5) * 0.01,
        timezone: getTzInfo("fiyinmlebi@gmail.com").timezone
      },
      clients: ["Lincoln", "Hartford"],
      caseType: "Non-Psych",
      dailyCaseLimit: (38 % 7) + 2, // (38 % 7 = 3) + 2 = 5
      caseLengthPreference: caseLengthOptions[38 % 5], // index 3 -> "1000+"
      currentWorkload: 38 % 9, // 2
      availability: (38 % 9) < ((38 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 98,
      accuracyScore: 94.81,
      overallQualityScore: 94.33,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (38 % 25), // (38 % 25 = 13) + 12 = 25
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 39,
      mra_id: 39,
      name: "Elizabeth Adeyanju",
      email: "elizabethmadeyanju@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_39.jpg",
      location: {
        country: getTzInfo("elizabethmadeyanju@gmail.com").country,
        latitude: getTzInfo("elizabethmadeyanju@gmail.com").baseLat + (39 % 5) * 0.01,
        longitude: getTzInfo("elizabethmadeyanju@gmail.com").baseLng + (39 % 5) * 0.01,
        timezone: getTzInfo("elizabethmadeyanju@gmail.com").timezone
      },
      clients: ["Lincoln", "Standard"],
      caseType: "Non-Psych",
      dailyCaseLimit: (39 % 7) + 2, // (39 % 7 = 4) + 2 = 6
      caseLengthPreference: caseLengthOptions[39 % 5], // index 4 -> "Any"
      currentWorkload: 39 % 9, // 3
      availability: (39 % 9) < ((39 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 96,
      accuracyScore: 91.84,
      overallQualityScore: 90.75,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (39 % 25), // (39 % 25 = 14) + 12 = 26
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 40,
      mra_id: 40,
      name: "Opemipo Ade-Akingboye",
      email: "opemipomade@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_40.jpg",
      location: {
        country: getTzInfo("opemipomade@gmail.com").country,
        latitude: getTzInfo("opemipomade@gmail.com").baseLat + (40 % 5) * 0.01,
        longitude: getTzInfo("opemipomade@gmail.com").baseLng + (40 % 5) * 0.01,
        timezone: getTzInfo("opemipomade@gmail.com").timezone
      },
      clients: ["Lincoln"],
      caseType: "Non-Psych",
      dailyCaseLimit: (40 % 7) + 2, // (40 % 7 = 5) + 2 = 7
      caseLengthPreference: caseLengthOptions[40 % 5], // index 0 -> "≤200"
      currentWorkload: 40 % 9, // 4
      availability: (40 % 9) < ((40 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 97,
      accuracyScore: 94.03,
      overallQualityScore: 93.17,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (40 % 25), // (40 % 25 = 15) + 12 = 27
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 41,
      mra_id: 41,
      name: "Lebari Damgbor",
      email: "lebarimdamgbor@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_41.jpg",
      location: {
        country: getTzInfo("lebarimdamgbor@gmail.com").country,
        latitude: getTzInfo("lebarimdamgbor@gmail.com").baseLat + (41 % 5) * 0.01,
        longitude: getTzInfo("lebarimdamgbor@gmail.com").baseLng + (41 % 5) * 0.01,
        timezone: getTzInfo("lebarimdamgbor@gmail.com").timezone
      },
      clients: ["Lincoln", "Hartford"],
      caseType: "Non-Psych",
      dailyCaseLimit: (41 % 7) + 2, // (41 % 7 = 6) + 2 = 8
      caseLengthPreference: caseLengthOptions[41 % 5], // index 1 -> "200-500"
      currentWorkload: 41 % 9, // 5
      availability: (41 % 9) < ((41 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 96,
      accuracyScore: 92.73,
      overallQualityScore: 91.59,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (41 % 25), // (41 % 25 = 16) + 12 = 28
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 42,
      mra_id: 42,
      name: "Uchechukwu Ejike",
      email: "uchemejike@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_42.jpg",
      location: {
        country: getTzInfo("uchemejike@gmail.com").country,
        latitude: getTzInfo("uchemejike@gmail.com").baseLat + (42 % 5) * 0.01,
        longitude: getTzInfo("uchemejike@gmail.com").baseLng + (42 % 5) * 0.01,
        timezone: getTzInfo("uchemejike@gmail.com").timezone
      },
      clients: ["Lincoln", "Hartford"],
      caseType: "Non-Psych",
      dailyCaseLimit: (42 % 7) + 2, // (42 % 7 = 0) + 2 = 2
      caseLengthPreference: caseLengthOptions[42 % 5], // index 2 -> "500-1000"
      currentWorkload: 42 % 9, // 6
      availability: (42 % 9) < ((42 % 7) + 2) ? "Available" : "Full", // 6 >= 2 → "Full"
      onTimePercentage: 98,
      accuracyScore: 95.7,
      overallQualityScore: 95.67,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (42 % 25), // (42 % 25 = 17) + 12 = 29
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 43,
      mra_id: 43,
      name: "Oluwaseyi Adare",
      email: "oluwaseyimadare@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_43.jpg",
      location: {
        country: getTzInfo("oluwaseyimadare@gmail.com").country,
        latitude: getTzInfo("oluwaseyimadare@gmail.com").baseLat + (43 % 5) * 0.01,
        longitude: getTzInfo("oluwaseyimadare@gmail.com").baseLng + (43 % 5) * 0.01,
        timezone: getTzInfo("oluwaseyimadare@gmail.com").timezone
      },
      clients: ["Lincoln", "Hartford"],
      caseType: "Non-Psych",
      dailyCaseLimit: (43 % 7) + 2, // (43 % 7 = 1) + 2 = 3
      caseLengthPreference: caseLengthOptions[43 % 5], // index 3 -> "1000+"
      currentWorkload: 43 % 9, // 7
      availability: (43 % 9) < ((43 % 7) + 2) ? "Available" : "Full", // 7 >= 3 → "Full"
      onTimePercentage: 97,
      accuracyScore: 86.75,
      overallQualityScore: 93.17,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (43 % 25), // (43 % 25 = 18) + 12 = 30
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 44,
      mra_id: 44,
      name: "Mariam Akubo",
      email: "mariammakubo@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_44.jpg",
      location: {
        country: getTzInfo("mariammakubo@gmail.com").country,
        latitude: getTzInfo("mariammakubo@gmail.com").baseLat + (44 % 5) * 0.01,
        longitude: getTzInfo("mariammakubo@gmail.com").baseLng + (44 % 5) * 0.01,
        timezone: getTzInfo("mariammakubo@gmail.com").timezone
      },
      clients: ["Lincoln", "Hartford"],
      caseType: "Non-Psych",
      dailyCaseLimit: (44 % 7) + 2, // (44 % 7 = 2) + 2 = 4
      caseLengthPreference: caseLengthOptions[44 % 5], // index 4 -> "Any"
      currentWorkload: 44 % 9, // 8
      availability: (44 % 9) < ((44 % 7) + 2) ? "Available" : "Full", // 8 >= 4 → "Full"
      onTimePercentage: 96,
      accuracyScore: 96.55,
      overallQualityScore: 96.93,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (44 % 25), // (44 % 25 = 19) + 12 = 31
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 45,
      mra_id: 45,
      name: "Jamiu Olurunnisola",
      email: "jamiumolorunnisola@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_45.jpg",
      location: {
        country: getTzInfo("jamiumolorunnisola@gmail.com").country,
        latitude: getTzInfo("jamiumolorunnisola@gmail.com").baseLat + (45 % 5) * 0.01,
        longitude: getTzInfo("jamiumolorunnisola@gmail.com").baseLng + (45 % 5) * 0.01,
        timezone: getTzInfo("jamiumolorunnisola@gmail.com").timezone
      },
      clients: ["Lincoln"],
      caseType: "Non-Psych",
      dailyCaseLimit: (45 % 7) + 2, // (45 % 7 = 3) + 2 = 5
      caseLengthPreference: caseLengthOptions[45 % 5], // index 0 -> "≤200"
      currentWorkload: 45 % 9, // 0
      availability: (45 % 9) < ((45 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 92,
      accuracyScore: 95.12,
      overallQualityScore: 93.57,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (45 % 25), // (45 % 25 = 20) + 12 = 32
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 46,
      mra_id: 46,
      name: "Al Ameen Kalejaiye",
      email: "alameenmkalejaiye@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_46.jpg",
      location: {
        country: getTzInfo("alameenmkalejaiye@gmail.com").country,
        latitude: getTzInfo("alameenmkalejaiye@gmail.com").baseLat + (46 % 5) * 0.01,
        longitude: getTzInfo("alameenmkalejaiye@gmail.com").baseLng + (46 % 5) * 0.01,
        timezone: getTzInfo("alameenmkalejaiye@gmail.com").timezone
      },
      clients: ["Lincoln"],
      caseType: "Non-Psych",
      dailyCaseLimit: (46 % 7) + 2, // (46 % 7 = 4) + 2 = 6
      caseLengthPreference: caseLengthOptions[46 % 5], // index 1 -> "200-500"
      currentWorkload: 46 % 9, // 1
      availability: (46 % 9) < ((46 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 94,
      accuracyScore: 91.87,
      overallQualityScore: 92.27,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (46 % 25), // (46 % 25 = 21) + 12 = 33
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 47,
      mra_id: 47,
      name: "Solomon Bailey",
      email: "solomonmbailey@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_47.jpg",
      location: {
        country: getTzInfo("solomonmbailey@gmail.com").country,
        latitude: getTzInfo("solomonmbailey@gmail.com").baseLat + (47 % 5) * 0.01,
        longitude: getTzInfo("solomonmbailey@gmail.com").baseLng + (47 % 5) * 0.01,
        timezone: getTzInfo("solomonmbailey@gmail.com").timezone
      },
      clients: ["Lincoln", "NYL"],
      caseType: "Non-Psych",
      dailyCaseLimit: (47 % 7) + 2, // (47 % 7 = 5) + 2 = 7
      caseLengthPreference: caseLengthOptions[47 % 5], // index 2 -> "500-1000"
      currentWorkload: 47 % 9, // 2
      availability: (47 % 9) < ((47 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 95,
      accuracyScore: 82.61,
      overallQualityScore: 86.32,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (47 % 25), // (47 % 25 = 22) + 12 = 34
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    },
    {
      id: 48,
      mra_id: 48,
      name: "Oluwafemi Durojaiye",
      email: "oluwafemimdurojaiye@gmail.com",
      headshotUrl: "https://example.com/headshots/mra_48.jpg",
      location: {
        country: getTzInfo("oluwafemimdurojaiye@gmail.com").country,
        latitude: getTzInfo("oluwafemimdurojaiye@gmail.com").baseLat + (48 % 5) * 0.01,
        longitude: getTzInfo("oluwafemimdurojaiye@gmail.com").baseLng + (48 % 5) * 0.01,
        timezone: getTzInfo("oluwafemimdurojaiye@gmail.com").timezone
      },
      clients: ["Lincoln"],
      caseType: "Non-Psych",
      dailyCaseLimit: (48 % 7) + 2, // (48 % 7 = 6) + 2 = 8
      caseLengthPreference: caseLengthOptions[48 % 5], // index 3 -> "1000+"
      currentWorkload: 48 % 9, // 3
      availability: (48 % 9) < ((48 % 7) + 2) ? "Available" : "Full",
      onTimePercentage: 95,
      accuracyScore: 96.15,
      overallQualityScore: 95.89,
      costPerCase: { "PFR": 20, "NYL": 15, "LTC": 30, "Telco": 30, "Lincoln": 20, "Hartford": 20, "Peer Review": 25, "Muckleshoot": 15, "Standard": 20 },
      turnaroundTime: 12 + (48 % 25), // (48 % 25 = 23) + 12 = 35
      revisionAvailability: "Available",
      lastSnapshot: "2025-03-09T12:34:56Z"
    }
  ];
  
  export default AdminFLData;
  