# AltScore AI: The "Magnum Opus" Credit Scoring Dashboard

**AltScore AI** is a high-end, production-ready technical dashboard designed to revolutionize credit scoring using alternative data. It leverages AI to analyze M-Pesa transaction patterns, providing a sophisticated "Creditworthiness Index" for individuals and small businesses who lack traditional credit history.

---

## 🌟 Key Features

### 1. **AI-Powered M-Pesa Parser**
*   **Pattern Recognition:** Extracts transaction frequency, savings behavior, and business activity from uploaded `.csv` or `.txt` statements.
*   **Alternative Data:** Uses non-traditional metrics like consistency of deposits and resilience to financial shocks.

### 2. **Technical Dashboard & Radar Chart**
*   **5 Pillars of Credit:** Visualizes Consistency, Savings, Liquidity, Resilience, and Business Activity using high-contrast radar charts.
*   **Grade Badge:** Assigns a clear credit grade (A+, B, etc.) based on a weighted AI scoring model.

### 3. **"What-If" Credit Simulator**
*   **Interactive Modeling:** Users can adjust their financial behavior (e.g., "What if I save 10% more?") to see the real-time impact on their credit score.
*   **Predictive Insights:** Provides actionable advice on how to improve creditworthiness.

### 4. **Editorial Credit Report**
*   **Professional Output:** Generates a formal, printable credit report designed like a high-end financial document.
*   **Verification ID:** Each report includes a unique ID for authenticity and verification by lenders.

### 5. **Loan Marketplace**
*   **Dynamic Matching:** Matches users with personalized loan products based on their current AI-generated score.
*   **Transparent Terms:** Displays interest rates and repayment periods tailored to the user's risk profile.

### 6. **Multilingual Support**
*   **Localization:** Full support for **English** and **Swahili**, ensuring accessibility for a broader user base in East Africa.

---

## 🛠️ Tech Stack

*   **Frontend:** React 18+ with Vite
*   **Styling:** Tailwind CSS (Mobile-First, Technical Dashboard Aesthetic)
*   **Animations:** `motion/react` (Framer Motion)
*   **Charts:** Recharts (Radar, Bar, and Line charts)
*   **Icons:** Lucide-React
*   **Backend:** Firebase (Authentication & Firestore)
*   **Typography:** Cormorant Garamond (Serif), Inter (Sans), JetBrains Mono (Technical)

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Firebase Configuration
Ensure you have a `firebase-applet-config.json` in the root directory with your project credentials:
```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "YOUR_DATABASE_ID"
}
```

### 4. Running the App
```bash
npm run dev
```

---

## 🔒 Security & Privacy

*   **Data Protection:** All transaction data is processed locally or stored securely in Firestore with strict security rules.
*   **Authentication:** Google Login is required to save and track credit history.
*   **Git Security:** Sensitive files like `.env`, `*.key`, and `firebase-applet-config.json` are automatically excluded via `.gitignore`.

---

## 📄 License

This project is part of the **AltScore AI** initiative. All rights reserved.
