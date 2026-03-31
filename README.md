# AltScore AI // The Ultimate Credit Scoring Dashboard

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28.svg)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%203%20Flash-4285F4.svg)](https://ai.google.dev/)

**AltScore AI** is a high-fidelity, production-ready credit scoring platform designed to bridge the gap for the "credit invisible." By leveraging **alternative data**—specifically M-Pesa transaction patterns and financial SMS records—the platform generates a sophisticated **Creditworthiness Index** that empowers individuals and small businesses to access formal capital.

---

## 🏛️ The Philosophy

In emerging markets, traditional credit bureaus often ignore the vast majority of economic activity. **AltScore AI** operates on the principle that *financial discipline is visible in daily patterns*, not just formal bank statements. We transform raw mobile money data into a professional financial asset.

---

## 🎨 Visual Identity: "Paper & Ink"

The dashboard features our **Magnum Opus** design theme—a deliberate pairing of high-density technical grids and refined editorial typography.

*   **Typography:** A sophisticated blend of **Cormorant Garamond** (Serif) for authority, **Inter** (Sans) for utility, and **JetBrains Mono** for technical precision.
*   **Aesthetic:** Inspired by mid-century scientific journals and modern financial reports. High-contrast borders, thick shadows, and a "Paper & Ink" color palette.
*   **Motion:** Fluid transitions powered by `motion/react` that guide the user through the analysis lifecycle.

---

## 🌟 Core Capabilities

### 1. **AI-Powered Pattern Analysis**
*   **M-Pesa Parser:** A robust engine that extracts transaction frequency, savings behavior, and business activity from raw text or CSV statements.
*   **Gemini 3 Flash Integration:** Performs deep reasoning on financial behavior to identify hidden strengths (e.g., "Shock Resilience") and risks traditional models miss.

### 2. **The 5 Pillars of Credit**
Visualized via a high-contrast radar chart, we score users across five critical dimensions:
*   **Consistency:** Regularity of inflows and deposits.
*   **Savings:** Percentage of income retained over time.
*   **Liquidity:** Immediate access to cash for emergencies.
*   **Resilience:** Ability to maintain stability during financial shocks.
*   **Business Activity:** Detection of entrepreneurial patterns in transaction data.

### 3. **"What-If" Credit Simulator**
An interactive modeling tool that allows users to proactively manage their financial future. Adjust sliders for consistency or savings rate to see the real-time impact on your simulated credit score.

### 4. **Editorial Credit Reports**
Generates a formal, printable credit report designed like a high-end financial document. Each report includes an **Executive Summary**, **Risk Assessment**, and **Strategic Guidance**, complete with a unique **Verification ID**.

### 5. **Loan Marketplace**
A dynamic matching engine that connects users with personalized loan products from partner micro-lenders based on their real-time AI score.

### 6. **Swahili Localization**
Full support for **English** and **Swahili**, ensuring the tool is accessible to the local community it serves.

---

## 🛠️ Technical Architecture

*   **Frontend:** React 18 (Functional Components, Hooks)
*   **State Management:** React `useState` & `useMemo` for real-time score simulation.
*   **Data Visualization:** `recharts` for high-fidelity radar and bar charts.
*   **Backend:** 
    *   **Firebase Auth:** Secure Google Sign-In.
    *   **Cloud Firestore:** Real-time persistence for analysis history.
    *   **Security Rules:** Strict "Owner-Only" access controls for PII protection.
*   **AI Engine:** `@google/genai` SDK for structured JSON analysis.

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Configuration
Create a `firebase-applet-config.json` in the root directory:
```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "YOUR_DATABASE_ID"
}
```

### 4. Development
```bash
npm run dev
```

---

## 🔒 Security & Privacy

*   **PII Protection:** All transaction data is processed with strict privacy protocols.
*   **Git Security:** Sensitive files (`.env`, `*.key`, `firebase-applet-config.json`) are automatically excluded.
*   **Validation:** Every Firestore write is validated against a strict schema in `firestore.rules`.

---

## 📄 License

&copy; 2026 AltScore AI Systems. All rights reserved.
