// src/FLStaticData.js
/*
  FLStaticData: Static data for Frontline Reviewers.
  This file contains only the static properties that do not change over time.
  The dynamic snapshot data (such as totalCases, avgCasesDay, etc.) is stored separately.
  
  Schema for each reviewer:
  {
    "mra_id": number,
    "name": string,
    "clients": string,       // comma-separated list of clients
    "email": string,
    "notes": string,
    "costPerCase": {         // cost per case per client
      "PFR": number,
      "NYL": number,
      "LTC": number,
      "Telco": number,
      "Lincoln": number,
      "Hartford": number,
      "Peer Review": number,
      "Muckleshoot": number,
      "Standard": number
    },
    "caseType": string       // "Psych", "Non-Psych", or "Both"
  }
*/

const FLStaticData = [
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Both"
    },
    {
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
      "caseType": "Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Both"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Psych"
    },
    {
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
      "caseType": "Both"
    },
    {
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
      "caseType": "Both"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Both"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    },
    {
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
      "caseType": "Non-Psych"
    }
  ];
  
  export default FLStaticData;
  