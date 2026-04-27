# Mortgage Calculator (Final Version)

Production-ready React mortgage calculator with:
- Responsive and accessible UI.
- Support for fixed rate, adjustable rate, and interest-only scenarios.
- Built-in sample scenarios from your spreadsheet.
- Validation, automated tests, and production build checks.

## Features

- Input fields for loan amount, annual rate, term, mortgage type, and optional property value.
- Sample scenario selector that auto-fills values.
- Calculated outputs:
  - Monthly payment
  - Total repayment
  - Total interest
  - Number of payments
  - LTV ratio (when property value is provided)
- Accessible labels, keyboard focus styles, and ARIA live feedback for errors/results.
- Mobile-friendly layout with table overflow handling.

## Tech Stack

- React (Create React App)
- Jest + Testing Library

## Run Locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Test and Build

```bash
npm test -- --watchAll=false
npm run build
```

## Azure Deployment (Recommended: Static Web Apps)

This app is a static React SPA and is best hosted on Azure Static Web Apps.

1. Push this repo to GitHub.
2. In Azure Portal, create a **Static Web App**.
3. Link your GitHub repository/branch.
4. Use these build settings:
   - App location: `/`
   - Output location: `build`
5. Azure will create a GitHub Actions workflow and deploy automatically.

### Optional: Deploy with Azure CLI (if installed)

```bash
az login
az group create --name rg-mortgage-calculator --location uksouth
az staticwebapp create \
  --name mortgage-calculator-app \
  --resource-group rg-mortgage-calculator \
  --source https://github.com/<your-org>/<your-repo> \
  --location "West Europe" \
  --branch main \
  --app-location "/" \
  --output-location "build" \
  --login-with-github
```

## Notes on Mortgage Logic

- Fixed Rate / Adjustable Rate estimate uses the standard amortization formula.
- Adjustable rate is estimated using the entered rate for the full term.
- Interest-only estimate:
  - Monthly payment = principal * monthly interest rate
  - Total repayment = total interest paid + principal due at term end

## Project Structure

- `src/App.js`: UI + calculator logic + sample scenario data.
- `src/App.css`: responsive and accessible styling.
- `src/App.test.js`: functional and calculation tests.
- `public/staticwebapp.config.json`: SPA routing config for Azure Static Web Apps.
