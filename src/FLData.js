// src/FLData.js
/* no REFACTORING needed, just static mock data that mimics eventual JSON structure from live API */

const FLData = [
  {
    "id": 1,
    "mra_id": 1,
    "name": "Alyssa Teves",
    "clients": "PFR, Lincoln, Hartford, Muckleshoot",
    "email": "alyssakristins@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 429,
        "casesPast30Days": 91,
        "casesPast60Days": 171,
        "clientRevisionsWeek": 8,
        "clientRevisionsMonth": 32,
        "clientRevisionsPast60": 58,
        "lateCasePercentage": 8,
        "avgCasesPerDay": 4.55,
        "revisionRate": 35.16483551612903,
        "timelinessScore": 92,
        "efficiencyScore": 92.75,
        "accuracyScore": 64.84,
        "qualityScore": 75.85
      }
    ]
  },
  {
    "id": 2,
    "mra_id": 2,
    "name": "Beatrice Solon",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, LTC",
    "email": "beatricesolon@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Both",
    "snapshots": [
      {
        "snapshotDate": "2025-01-02T12:34:56Z",
        "totalCases": 543,
        "casesPast30Days": 81,
        "casesPast60Days": 162,
        "clientRevisionsWeek": 6,
        "clientRevisionsMonth": 24,
        "clientRevisionsPast60": 50,
        "lateCasePercentage": 25,
        "avgCasesPerDay": 4.05,
        "revisionRate": 29.63,
        "timelinessScore": 75,
        "efficiencyScore": 90.25,
        "accuracyScore": 70.37,
        "qualityScore": 75.27
      }
    ]
  },
  {
    "id": 3,
    "mra_id": 3,
    "name": "Becca Kennedy",
    "clients": "PFR, Lincoln",
    "email": "becca@peerlinkmedical.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Psych",
    "snapshots": [
      {
        "snapshotDate": "2024-06-11T12:34:56Z",
        "totalCases": 815,
        "casesPast30Days": 96,
        "casesPast60Days": 146,
        "clientRevisionsWeek": 12,
        "clientRevisionsMonth": 48,
        "clientRevisionsPast60": 90,
        "lateCasePercentage": 12,
        "avgCasesPerDay": 4.8,
        "revisionRate": 50.0,
        "timelinessScore": 88,
        "efficiencyScore": 94.0,
        "accuracyScore": 50.0,
        "qualityScore": 66.4
      }
    ]
  },
  {
    "id": 4,
    "mra_id": 4,
    "name": "Chukwudi Akubueze",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, Standard",
    "email": "kudiakubueze@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2024-02-16T12:34:56Z",
        "totalCases": 604,
        "casesPast30Days": 75,
        "casesPast60Days": 151,
        "clientRevisionsWeek": 4,
        "clientRevisionsMonth": 16,
        "clientRevisionsPast60": 32,
        "lateCasePercentage": 20,
        "avgCasesPerDay": 3.75,
        "revisionRate": 21.33,
        "timelinessScore": 80,
        "efficiencyScore": 88.75,
        "accuracyScore": 78.67,
        "qualityScore": 80.95
      }
    ]
  },
  {
    "id": 5,
    "mra_id": 5,
    "name": "Chris Ekundare",
    "clients": "PFR, Lincoln, Hartford",
    "email": "chrisekundare@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-02-22T12:34:56Z",
        "totalCases": 420,
        "casesPast30Days": 115,
        "casesPast60Days": 187,
        "clientRevisionsWeek": 3,
        "clientRevisionsMonth": 12,
        "clientRevisionsPast60": 28,
        "lateCasePercentage": 2,
        "avgCasesPerDay": 5.75,
        "revisionRate": 10.43,
        "timelinessScore": 98,
        "efficiencyScore": 98.75,
        "accuracyScore": 89.57,
        "qualityScore": 93.09
      }
    ]
  },
  {
    "id": 6,
    "mra_id": 6,
    "name": "Dilay Ackan",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard, LTC",
    "email": "dilay.akcan@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-02-09T12:34:56Z",
        "totalCases": 2640,
        "casesPast30Days": 107,
        "casesPast60Days": 170,
        "clientRevisionsWeek": 10,
        "clientRevisionsMonth": 40,
        "clientRevisionsPast60": 74,
        "lateCasePercentage": 10,
        "avgCasesPerDay": 5.35,
        "revisionRate": 37.38,
        "timelinessScore": 90,
        "efficiencyScore": 96.75,
        "accuracyScore": 62.62,
        "qualityScore": 74.92
      }
    ]
  },
  {
    "id": 7,
    "mra_id": 7,
    "name": "Ebenezer Arisa",
    "clients": "PFR, Lincoln, Hartford",
    "email": "ebenezerarisa17@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 1388,
        "casesPast30Days": 95,
        "casesPast60Days": 162,
        "clientRevisionsWeek": 8,
        "clientRevisionsMonth": 32,
        "clientRevisionsPast60": 60,
        "lateCasePercentage": 8,
        "avgCasesPerDay": 4.75,
        "revisionRate": 33.68,
        "timelinessScore": 92,
        "efficiencyScore": 93.75,
        "accuracyScore": 66.32,
        "qualityScore": 76.94
      }
    ]
  },
  {
    "id": 8,
    "mra_id": 8,
    "name": "Emmanuel Uduigwome",
    "clients": "PFR, Lincoln, Hartford, NYL",
    "email": "eo.uduigwome@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 429,
        "casesPast30Days": 109,
        "casesPast60Days": 192,
        "clientRevisionsWeek": 5,
        "clientRevisionsMonth": 20,
        "clientRevisionsPast60": 38,
        "lateCasePercentage": 6,
        "avgCasesPerDay": 5.45,
        "revisionRate": 18.35,
        "timelinessScore": 94,
        "efficiencyScore": 97.25,
        "accuracyScore": 81.65,
        "qualityScore": 87.24
      }
    ]
  },
  {
    "id": 9,
    "mra_id": 9,
    "name": "Eliza Gomez",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, NYL",
    "email": "elizagomeztoro4545@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Both",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 591,
        "casesPast30Days": 62,
        "casesPast60Days": 114,
        "clientRevisionsWeek": 5,
        "clientRevisionsMonth": 20,
        "clientRevisionsPast60": 40,
        "lateCasePercentage": 15,
        "avgCasesPerDay": 3.1,
        "revisionRate": 32.26,
        "timelinessScore": 85,
        "efficiencyScore": 85.5,
        "accuracyScore": 67.74,
        "qualityScore": 74.75
      }
    ]
  },
  {
    "id": 10,
    "mra_id": 10,
    "name": "Erika Sucgang",
    "clients": "PFR, Lincoln, Hartford",
    "email": "theerikajee@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 1512,
        "casesPast30Days": 84,
        "casesPast60Days": 167,
        "clientRevisionsWeek": 8,
        "clientRevisionsMonth": 32,
        "clientRevisionsPast60": 64,
        "lateCasePercentage": 6,
        "avgCasesPerDay": 4.2,
        "revisionRate": 38.1,
        "timelinessScore": 94,
        "efficiencyScore": 91.0,
        "accuracyScore": 61.9,
        "qualityScore": 74.14
      }
    ]
  },
  {
    "id": 11,
    "mra_id": 11,
    "name": "Geni Payales",
    "clients": "PFR",
    "email": "grpayales@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 443,
        "casesPast30Days": 81,
        "casesPast60Days": 157,
        "clientRevisionsWeek": 2,
        "clientRevisionsMonth": 8,
        "clientRevisionsPast60": 14,
        "lateCasePercentage": 7,
        "avgCasesPerDay": 4.05,
        "revisionRate": 9.88,
        "timelinessScore": 93,
        "efficiencyScore": 90.25,
        "accuracyScore": 90.12,
        "qualityScore": 90.72
      }
    ]
  },
  {
    "id": 12,
    "mra_id": 12,
    "name": "Ieva Puidoke",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco",
    "email": "Ieva.puidoke@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 729,
        "casesPast30Days": 64,
        "casesPast60Days": 120,
        "clientRevisionsWeek": 6,
        "clientRevisionsMonth": 24,
        "clientRevisionsPast60": 48,
        "lateCasePercentage": 8,
        "avgCasesPerDay": 3.2,
        "revisionRate": 37.5,
        "timelinessScore": 92,
        "efficiencyScore": 86.0,
        "accuracyScore": 62.5,
        "qualityScore": 73.1
      }
    ]
  },
  {
    "id": 13,
    "mra_id": 13,
    "name": "Ileri Lawal",
    "clients": "PFR",
    "email": "ilerioluwalawal@outlook.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 360,
        "casesPast30Days": 57,
        "casesPast60Days": 129,
        "clientRevisionsWeek": 5,
        "clientRevisionsMonth": 20,
        "clientRevisionsPast60": 39,
        "lateCasePercentage": 2,
        "avgCasesPerDay": 2.85,
        "revisionRate": 35.09,
        "timelinessScore": 98,
        "efficiencyScore": 84.25,
        "accuracyScore": 64.91,
        "qualityScore": 75.4
      }
    ]
  },
  {
    "id": 14,
    "mra_id": 14,
    "name": "Iyanuoluwa Oni",
    "clients": "PFR, Lincoln, Hartford, Peer Review, LTC",
    "email": "iyanuopemipo@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 522,
        "casesPast30Days": 48,
        "casesPast60Days": 104,
        "clientRevisionsWeek": 4,
        "clientRevisionsMonth": 16,
        "clientRevisionsPast60": 30,
        "lateCasePercentage": 8,
        "avgCasesPerDay": 2.4,
        "revisionRate": 33.33,
        "timelinessScore": 92,
        "efficiencyScore": 82.0,
        "accuracyScore": 66.67,
        "qualityScore": 74.8
      }
    ]
  },
  {
    "id": 15,
    "mra_id": 15,
    "name": "Joshua Arisa",
    "clients": "PFR, Lincoln, LTC",
    "email": "joshuaarisa14@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 530,
        "casesPast30Days": 78,
        "casesPast60Days": 161,
        "clientRevisionsWeek": 8,
        "clientRevisionsMonth": 32,
        "clientRevisionsPast60": 58,
        "lateCasePercentage": 5,
        "avgCasesPerDay": 3.9,
        "revisionRate": 41.03,
        "timelinessScore": 95,
        "efficiencyScore": 89.5,
        "accuracyScore": 58.97,
        "qualityScore": 72.28
      }
    ]
  },
  {
    "id": 16,
    "mra_id": 16,
    "name": "Joan Ajayi",
    "clients": "PFR, Lincoln, Hartford, Muckleshoot",
    "email": "joanoajayi@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 437,
        "casesPast30Days": 63,
        "casesPast60Days": 145,
        "clientRevisionsWeek": 7,
        "clientRevisionsMonth": 28,
        "clientRevisionsPast60": 55,
        "lateCasePercentage": 14,
        "avgCasesPerDay": 3.15,
        "revisionRate": 44.44,
        "timelinessScore": 86,
        "efficiencyScore": 85.75,
        "accuracyScore": 55.56,
        "qualityScore": 67.68
      }
    ]
  },
  {
    "id": 17,
    "mra_id": 17,
    "name": "Khwaish Vasnani",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Muckleshoot, Standard, LTC",
    "email": "khwaishvasnani@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 1749,
        "casesPast30Days": 108,
        "casesPast60Days": 181,
        "clientRevisionsWeek": 5,
        "clientRevisionsMonth": 20,
        "clientRevisionsPast60": 38,
        "lateCasePercentage": 4,
        "avgCasesPerDay": 5.4,
        "revisionRate": 18.52,
        "timelinessScore": 96,
        "efficiencyScore": 97.0,
        "accuracyScore": 81.48,
        "qualityScore": 87.49
      }
    ]
  },
  {
    "id": 18,
    "mra_id": 18,
    "name": "Lina Gutierrez",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard",
    "email": "linis2791@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Both",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 2521,
        "casesPast30Days": 75,
        "casesPast60Days": 160,
        "clientRevisionsWeek": 15,
        "clientRevisionsMonth": 60,
        "clientRevisionsPast60": 110,
        "lateCasePercentage": 10,
        "avgCasesPerDay": 3.75,
        "revisionRate": 80.0,
        "timelinessScore": 90,
        "efficiencyScore": 88.75,
        "accuracyScore": 20.0,
        "qualityScore": 47.75
      }
    ]
  },
  {
    "id": 19,
    "mra_id": 19,
    "name": "Mary Goyenechea",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard",
    "email": "lorensgee1@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Both",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 3179,
        "casesPast30Days": 52,
        "casesPast60Days": 119,
        "clientRevisionsWeek": 6,
        "clientRevisionsMonth": 24,
        "clientRevisionsPast60": 46,
        "lateCasePercentage": 2,
        "avgCasesPerDay": 2.6,
        "revisionRate": 46.15,
        "timelinessScore": 98,
        "efficiencyScore": 83.0,
        "accuracyScore": 53.85,
        "qualityScore": 68.51
      }
    ]
  },
  {
    "id": 20,
    "mra_id": 20,
    "name": "Mary Galos",
    "clients": "PFR, Lincoln, Hartford, NYL",
    "email": "cornillezjoyce@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 1076,
        "casesPast30Days": 94,
        "casesPast60Days": 155,
        "clientRevisionsWeek": 5,
        "clientRevisionsMonth": 20,
        "clientRevisionsPast60": 40,
        "lateCasePercentage": 12,
        "avgCasesPerDay": 4.7,
        "revisionRate": 21.28,
        "timelinessScore": 88,
        "efficiencyScore": 93.5,
        "accuracyScore": 78.72,
        "qualityScore": 83.53
      }
    ]
  },
  {
    "id": 21,
    "mra_id": 21,
    "name": "Maja Loja",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard",
    "email": "lojamaja@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Both",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 3466,
        "casesPast30Days": 99,
        "casesPast60Days": 173,
        "clientRevisionsWeek": 8,
        "clientRevisionsMonth": 32,
        "clientRevisionsPast60": 61,
        "lateCasePercentage": 5,
        "avgCasesPerDay": 4.95,
        "revisionRate": 32.32,
        "timelinessScore": 95,
        "efficiencyScore": 94.75,
        "accuracyScore": 67.68,
        "qualityScore": 78.56
      }
    ]
  },
  {
    "id": 22,
    "mra_id": 22,
    "name": "Next Reviewer",
    "clients": "PFR, Lincoln, Hartford",
    "email": "test@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 575,
        "casesPast30Days": 64,
        "casesPast60Days": 106,
        "clientRevisionsWeek": 2,
        "clientRevisionsMonth": 8,
        "clientRevisionsPast60": 15,
        "lateCasePercentage": 18,
        "avgCasesPerDay": 3.2,
        "revisionRate": 12.5,
        "timelinessScore": 82,
        "efficiencyScore": 86.0,
        "accuracyScore": 87.5,
        "qualityScore": 86.1
      }
    ]
  },
  {
    "id": 23,
    "mra_id": 23,
    "name": "Oluseye Oluremi",
    "clients": "PFR, Lincoln, Hartford, Standard",
    "email": "oluseyekoluremi@su.edu.ph",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 524,
        "casesPast30Days": 104,
        "casesPast60Days": 186,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 8,
        "lateCasePercentage": 5,
        "avgCasesPerDay": 5.2,
        "revisionRate": 3.85,
        "timelinessScore": 95,
        "efficiencyScore": 96.0,
        "accuracyScore": 96.15,
        "qualityScore": 95.89
      }
    ]
  },
  {
    "id": 24,
    "mra_id": 24,
    "name": "Oluwadamilola Ogunsemowo",
    "clients": "PFR, Lincoln, Hartford, Standard",
    "email": "damilolamogunsemowo@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 481,
        "casesPast30Days": 60,
        "casesPast60Days": 132,
        "clientRevisionsWeek": 3,
        "clientRevisionsMonth": 12,
        "clientRevisionsPast60": 24,
        "lateCasePercentage": 17,
        "avgCasesPerDay": 3.0,
        "revisionRate": 20.0,
        "timelinessScore": 83,
        "efficiencyScore": 85.0,
        "accuracyScore": 80.0,
        "qualityScore": 81.6
      }
    ]
  },
  {
    "id": 25,
    "mra_id": 25,
    "name": "Thomas Oyinlola",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Standard",
    "email": "thomasoyinlola@yahoo.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 375,
        "casesPast30Days": 115,
        "casesPast60Days": 191,
        "clientRevisionsWeek": 5,
        "clientRevisionsMonth": 20,
        "clientRevisionsPast60": 38,
        "lateCasePercentage": 15,
        "avgCasesPerDay": 5.75,
        "revisionRate": 17.39,
        "timelinessScore": 85,
        "efficiencyScore": 98.75,
        "accuracyScore": 82.61,
        "qualityScore": 86.32
      }
    ]
  },
  {
    "id": 26,
    "mra_id": 26,
    "name": "Ravit Haleva",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard, LTC, Muckleshoot",
    "email": "ravithaleva@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 2021,
        "casesPast30Days": 96,
        "casesPast60Days": 173,
        "clientRevisionsWeek": 4,
        "clientRevisionsMonth": 16,
        "clientRevisionsPast60": 31,
        "lateCasePercentage": 5,
        "avgCasesPerDay": 4.8,
        "revisionRate": 16.67,
        "timelinessScore": 95,
        "efficiencyScore": 94.0,
        "accuracyScore": 83.33,
        "qualityScore": 87.8
      }
    ]
  },
  {
    "id": 27,
    "mra_id": 27,
    "name": "Sarah Watkins",
    "clients": "Standard",
    "email": "sarahw445@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 1029,
        "casesPast30Days": 63,
        "casesPast60Days": 114,
        "clientRevisionsWeek": 14,
        "clientRevisionsMonth": 32,
        "clientRevisionsPast60": 57,
        "lateCasePercentage": 24,
        "avgCasesPerDay": 3.15,
        "revisionRate": 50.79,
        "timelinessScore": 76,
        "efficiencyScore": 85.75,
        "accuracyScore": 49.21,
        "qualityScore": 61.87
      }
    ]
  },
  {
    "id": 28,
    "mra_id": 28,
    "name": "Shaila Maramara",
    "clients": "PFR, Lincoln, Hartford, Standard",
    "email": "shailamaramara@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 1123,
        "casesPast30Days": 56,
        "casesPast60Days": 108,
        "clientRevisionsWeek": 5,
        "clientRevisionsMonth": 20,
        "clientRevisionsPast60": 38,
        "lateCasePercentage": 6,
        "avgCasesPerDay": 2.8,
        "revisionRate": 35.71,
        "timelinessScore": 94,
        "efficiencyScore": 84.0,
        "accuracyScore": 64.29,
        "qualityScore": 74.17
      }
    ]
  },
  {
    "id": 29,
    "mra_id": 29,
    "name": "Vincent Medicielo",
    "clients": "PFR, NYL",
    "email": "medicielo.prosvincent@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 553,
        "casesPast30Days": 95,
        "casesPast60Days": 183,
        "clientRevisionsWeek": 4,
        "clientRevisionsMonth": 16,
        "clientRevisionsPast60": 32,
        "lateCasePercentage": 1,
        "avgCasesPerDay": 4.75,
        "revisionRate": 16.84,
        "timelinessScore": 99,
        "efficiencyScore": 93.75,
        "accuracyScore": 83.16,
        "qualityScore": 88.44
      }
    ]
  },
  {
    "id": 30,
    "mra_id": 30,
    "name": "Will Smith",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard",
    "email": "will@peerlinkmedical.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 1315,
        "casesPast30Days": 64,
        "casesPast60Days": 129,
        "clientRevisionsWeek": 8,
        "clientRevisionsMonth": 32,
        "clientRevisionsPast60": 64,
        "lateCasePercentage": 15,
        "avgCasesPerDay": 3.2,
        "revisionRate": 50.0,
        "timelinessScore": 85,
        "efficiencyScore": 86.0,
        "accuracyScore": 50.0,
        "qualityScore": 64.2
      }
    ]
  },
  {
    "id": 31,
    "mra_id": 31,
    "name": "Yllana Saavedra",
    "clients": "PFR",
    "email": "iyannsaavedra@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 593,
        "casesPast30Days": 63,
        "casesPast60Days": 137,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 7,
        "lateCasePercentage": 8,
        "avgCasesPerDay": 3.15,
        "revisionRate": 6.35,
        "timelinessScore": 92,
        "efficiencyScore": 85.75,
        "accuracyScore": 93.65,
        "qualityScore": 91.74
      }
    ]
  },
  {
    "id": 32,
    "mra_id": 32,
    "name": "Temilola Edun",
    "clients": "PFR",
    "email": "temilolaedun@outlook.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 369,
        "casesPast30Days": 74,
        "casesPast60Days": 161,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 8,
        "lateCasePercentage": 4,
        "avgCasesPerDay": 3.7,
        "revisionRate": 5.41,
        "timelinessScore": 96,
        "efficiencyScore": 88.5,
        "accuracyScore": 94.59,
        "qualityScore": 93.66
      }
    ]
  },
  {
    "id": 33,
    "mra_id": 33,
    "name": "Toluwani Merari",
    "clients": "PFR, Lincoln",
    "email": "nt.merari@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 216,
        "casesPast30Days": 72,
        "casesPast60Days": 147,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 8,
        "lateCasePercentage": 3,
        "avgCasesPerDay": 3.6,
        "revisionRate": 5.56,
        "timelinessScore": 97,
        "efficiencyScore": 88.0,
        "accuracyScore": 94.44,
        "qualityScore": 93.67
      }
    ]
  },
  {
    "id": 34,
    "mra_id": 34,
    "name": "Oluwapelumi Gabriel",
    "clients": "PFR, Lincoln",
    "email": "pelumio.gabriel@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 202,
        "casesPast30Days": 69,
        "casesPast60Days": 131,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 7,
        "lateCasePercentage": 3,
        "avgCasesPerDay": 3.45,
        "revisionRate": 5.8,
        "timelinessScore": 97,
        "efficiencyScore": 87.25,
        "accuracyScore": 94.2,
        "qualityScore": 93.37
      }
    ]
  },
  {
    "id": 35,
    "mra_id": 35,
    "name": "Tolulope Ajayi",
    "clients": "PFR, Lincoln",
    "email": "to.ajayimd@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 228,
        "casesPast30Days": 70,
        "casesPast60Days": 143,
        "clientRevisionsWeek": 2,
        "clientRevisionsMonth": 8,
        "clientRevisionsPast60": 15,
        "lateCasePercentage": 2,
        "avgCasesPerDay": 3.5,
        "revisionRate": 11.43,
        "timelinessScore": 98,
        "efficiencyScore": 87.5,
        "accuracyScore": 88.57,
        "qualityScore": 90.24
      }
    ]
  },
  {
    "id": 36,
    "mra_id": 36,
    "name": "Addison Marimberga",
    "clients": "PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard",
    "email": "addison@peerlinkmedical.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 1171,
        "casesPast30Days": 102,
        "casesPast60Days": 171,
        "clientRevisionsWeek": 4,
        "clientRevisionsMonth": 16,
        "clientRevisionsPast60": 28,
        "lateCasePercentage": 5,
        "avgCasesPerDay": 5.1,
        "revisionRate": 15.69,
        "timelinessScore": 95,
        "efficiencyScore": 95.5,
        "accuracyScore": 84.31,
        "qualityScore": 88.69
      }
    ]
  },
  {
    "id": 37,
    "mra_id": 37,
    "name": "Goodluck Odii",
    "clients": "Lincoln",
    "email": "goodluckmodii@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 103,
        "casesPast30Days": 78,
        "casesPast60Days": 135,
        "clientRevisionsWeek": 2,
        "clientRevisionsMonth": 8,
        "clientRevisionsPast60": 13,
        "lateCasePercentage": 4,
        "avgCasesPerDay": 3.9,
        "revisionRate": 10.26,
        "timelinessScore": 96,
        "efficiencyScore": 89.5,
        "accuracyScore": 89.74,
        "qualityScore": 90.95
      }
    ]
  },
  {
    "id": 38,
    "mra_id": 38,
    "name": "Fiyinfoluwa Yemi-Lebi",
    "clients": "Lincoln, Hartford",
    "email": "fiyinmlebi@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 62,
        "casesPast30Days": 77,
        "casesPast60Days": 153,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 8,
        "lateCasePercentage": 2,
        "avgCasesPerDay": 3.85,
        "revisionRate": 5.19,
        "timelinessScore": 98,
        "efficiencyScore": 89.25,
        "accuracyScore": 94.81,
        "qualityScore": 94.33
      }
    ]
  },
  {
    "id": 39,
    "mra_id": 39,
    "name": "Elizabeth Adeyanju",
    "clients": "Lincoln, Standard",
    "email": "elizabethmadeyanju@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 65,
        "casesPast30Days": 49,
        "casesPast60Days": 96,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 7,
        "lateCasePercentage": 4,
        "avgCasesPerDay": 2.45,
        "revisionRate": 8.16,
        "timelinessScore": 96,
        "efficiencyScore": 82.25,
        "accuracyScore": 91.84,
        "qualityScore": 90.75
      }
    ]
  },
  {
    "id": 40,
    "mra_id": 40,
    "name": "Opemipo Ade-Akingboye",
    "clients": "Lincoln",
    "email": "opemipomade@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 59,
        "casesPast30Days": 67,
        "casesPast60Days": 144,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 8,
        "lateCasePercentage": 3,
        "avgCasesPerDay": 3.35,
        "revisionRate": 5.97,
        "timelinessScore": 97,
        "efficiencyScore": 86.75,
        "accuracyScore": 94.03,
        "qualityScore": 93.17
      }
    ]
  },
  {
    "id": 41,
    "mra_id": 41,
    "name": "Lebari Damgbor",
    "clients": "Lincoln, Hartford",
    "email": "lebarimdamgbor@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 55,
        "casesPast30Days": 55,
        "casesPast60Days": 113,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 8,
        "lateCasePercentage": 4,
        "avgCasesPerDay": 2.75,
        "revisionRate": 7.27,
        "timelinessScore": 96,
        "efficiencyScore": 83.75,
        "accuracyScore": 92.73,
        "qualityScore": 91.59
      }
    ]
  },
  {
    "id": 42,
    "mra_id": 42,
    "name": "Uchechukwu Ejike",
    "clients": "Lincoln, Hartford",
    "email": "uchemejike@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 74,
        "casesPast30Days": 93,
        "casesPast60Days": 174,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 8,
        "lateCasePercentage": 2,
        "avgCasesPerDay": 4.65,
        "revisionRate": 4.3,
        "timelinessScore": 98,
        "efficiencyScore": 93.25,
        "accuracyScore": 95.7,
        "qualityScore": 95.67
      }
    ]
  },
  {
    "id": 43,
    "mra_id": 43,
    "name": "Oluwaseyi Adare",
    "clients": "Lincoln, Hartford",
    "email": "oluwaseyimadare@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 74,
        "casesPast30Days": 67,
        "casesPast60Days": 116,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 7,
        "lateCasePercentage": 3,
        "avgCasesPerDay": 3.35,
        "revisionRate": 5.97,
        "timelinessScore": 97,
        "efficiencyScore": 86.75,
        "accuracyScore": 94.03,
        "qualityScore": 93.17
      }
    ]
  },
  {
    "id": 44,
    "mra_id": 44,
    "name": "Mariam Akubo",
    "clients": "Lincoln, Hartford",
    "email": "mariammakubo@gmail.com",
    "notes": "This is a test",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 66,
        "casesPast30Days": 116,
        "casesPast60Days": 189,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 8,
        "lateCasePercentage": 4,
        "avgCasesPerDay": 5.8,
        "revisionRate": 3.45,
        "timelinessScore": 96,
        "efficiencyScore": 99.0,
        "accuracyScore": 96.55,
        "qualityScore": 96.93
      }
    ]
  },
  {
    "id": 45,
    "mra_id": 45,
    "name": "Jamiu Olurunnisola",
    "clients": "Lincoln",
    "email": "jamiumolorunnisola@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 45,
        "casesPast30Days": 82,
        "casesPast60Days": 151,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 7,
        "lateCasePercentage": 8,
        "avgCasesPerDay": 4.1,
        "revisionRate": 4.88,
        "timelinessScore": 92,
        "efficiencyScore": 90.5,
        "accuracyScore": 95.12,
        "qualityScore": 93.57
      }
    ]
  },
  {
    "id": 46,
    "mra_id": 46,
    "name": "Al Ameen Kalejaiye",
    "clients": "Lincoln",
    "email": "alameenmkalejaiye@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 63,
        "casesPast30Days": 86,
        "casesPast60Days": 156,
        "clientRevisionsWeek": 2,
        "clientRevisionsMonth": 8,
        "clientRevisionsPast60": 13,
        "lateCasePercentage": 6,
        "avgCasesPerDay": 4.3,
        "revisionRate": 8.13,
        "timelinessScore": 94,
        "efficiencyScore": 90.5,
        "accuracyScore": 91.87,
        "qualityScore": 92.27
      }
    ]
  },
  {
    "id": 47,
    "mra_id": 47,
    "name": "Solomon Bailey",
    "clients": "Lincoln, NYL",
    "email": "solomonmbailey@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 69,
        "casesPast30Days": 48,
        "casesPast60Days": 96,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 8,
        "lateCasePercentage": 5,
        "avgCasesPerDay": 2.4,
        "revisionRate": 8.33,
        "timelinessScore": 95,
        "efficiencyScore": 82.0,
        "accuracyScore": 91.67,
        "qualityScore": 90.4
      }
    ]
  },
  {
    "id": 48,
    "mra_id": 48,
    "name": "Oluwafemi Durojaiye",
    "clients": "Lincoln",
    "email": "oluwafemimdurojaiye@gmail.com",
    "notes": "",
    "costPerCase": {
      "PFR": 20,
      "NYL": 15,
      "LTC": 30,
      "Telco": 30,
      "Lincoln": 20,
      "Hartford": 20,
      "Peer Review": 25,
      "Muckleshoot": 15,
      "Standard": 20
    },
    "caseType": "Non-Psych",
    "snapshots": [
      {
        "snapshotDate": "2025-03-09T12:34:56Z",
        "totalCases": 56,
        "casesPast30Days": 104,
        "casesPast60Days": 186,
        "clientRevisionsWeek": 1,
        "clientRevisionsMonth": 4,
        "clientRevisionsPast60": 8,
        "lateCasePercentage": 5,
        "avgCasesPerDay": 5.2,
        "revisionRate": 3.85,
        "timelinessScore": 95,
        "efficiencyScore": 96.0,
        "accuracyScore": 96.15,
        "qualityScore": 95.89
      }
    ]
  }
];

export default FLData;
