import React, { useMemo, useState } from "react";
import "./App.css";

function App() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [mortgageType, setMortgageType] = useState("Fixed Rate");
  const [propertyValue, setPropertyValue] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        maximumFractionDigits: 2,
      }),
    []
  );

  const calculate = (event) => {
    event.preventDefault();
    setError("");

    if (amount === "" || rate === "" || years === "") {
      setResult(null);
      setError("Please fill in all fields.");
      return;
    }

    const principal = Number(amount);
    const annualRate = Number(rate);
    const termYears = Number(years);
    const homeValue = propertyValue === "" ? null : Number(propertyValue);

    if (
      Number.isNaN(principal) ||
      Number.isNaN(annualRate) ||
      Number.isNaN(termYears) ||
      (homeValue !== null && Number.isNaN(homeValue)) ||
      principal <= 0 ||
      annualRate < 0 ||
      termYears <= 0 ||
      (homeValue !== null && homeValue <= 0)
    ) {
      setResult(null);
      setError(
        "Enter valid values: loan amount, property value (if used), and term must be greater than 0; interest rate must be 0 or more."
      );
      return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const payments = termYears * 12;
    let monthlyPayment;
    let totalRepayment;
    let totalInterest;

    if (mortgageType === "Interest-Only") {
      monthlyPayment = principal * monthlyRate;
      totalInterest = monthlyPayment * payments;
      totalRepayment = totalInterest + principal;
    } else {
      monthlyPayment =
        monthlyRate === 0
          ? principal / payments
          : (principal * monthlyRate) /
            (1 - Math.pow(1 + monthlyRate, -payments));
      totalRepayment = monthlyPayment * payments;
      totalInterest = totalRepayment - principal;
    }

    const ltvRatio = homeValue ? (principal / homeValue) * 100 : null;

    setResult({
      monthlyPayment,
      totalRepayment,
      totalInterest,
      payments,
      mortgageType,
      ltvRatio,
    });
  };

  const resetForm = () => {
    setAmount("");
    setRate("");
    setYears("");
    setMortgageType("Fixed Rate");
    setPropertyValue("");
    setResult(null);
    setError("");
  };

  return (
    <main className="page">
      <section className="container" aria-labelledby="mortgage-title">
        <h1 id="mortgage-title">Mortgage Calculator</h1>
        <p className="intro">
          Enter your loan details to estimate your monthly mortgage payment.
        </p>

        <form onSubmit={calculate} noValidate>
          <div className="field">
            <label htmlFor="amount">Loan Amount (GBP)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 250000"
              aria-describedby="amount-hint"
              required
            />
            <p id="amount-hint" className="hint">
              Total amount you want to borrow.
            </p>
          </div>

          <div className="field">
            <label htmlFor="rate">Annual Interest Rate (%)</label>
            <input
              id="rate"
              name="rate"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 4.75"
              aria-describedby="rate-hint"
              required
            />
            <p id="rate-hint" className="hint">
              Use the nominal yearly rate from your lender.
            </p>
          </div>

          <div className="field">
            <label htmlFor="years">Loan Term (Years)</label>
            <input
              id="years"
              name="years"
              type="number"
              min="0.25"
              step="0.25"
              inputMode="decimal"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="e.g. 30"
              aria-describedby="years-hint"
              required
            />
            <p id="years-hint" className="hint">
              Number of years over which you will repay the loan.
            </p>
          </div>

          <div className="field">
            <label htmlFor="mortgageType">Mortgage Type</label>
            <select
              id="mortgageType"
              name="mortgageType"
              value={mortgageType}
              onChange={(e) => setMortgageType(e.target.value)}
            >
              <option value="Fixed Rate">Fixed Rate</option>
              <option value="Adjustable Rate">Adjustable Rate</option>
              <option value="Interest-Only">Interest-Only</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="propertyValue">Property Value (GBP, optional)</label>
            <input
              id="propertyValue"
              name="propertyValue"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              placeholder="e.g. 300000"
              aria-describedby="property-hint"
            />
            <p id="property-hint" className="hint">
              Enter to calculate loan-to-value (LTV).
            </p>
          </div>

          {error && (
            <p className="error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}

          <div className="actions">
            <button type="submit">Calculate Payment</button>
            <button type="button" className="secondary" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {result && (
          <section className="result" aria-live="polite">
            <h2>Estimated Mortgage Summary</h2>
            <dl className="result-grid">
              <div>
                <dt>Monthly Payment</dt>
                <dd>{currencyFormatter.format(result.monthlyPayment)}</dd>
              </div>
              <div>
                <dt>Total Repayment</dt>
                <dd>{currencyFormatter.format(result.totalRepayment)}</dd>
              </div>
              <div>
                <dt>Total Interest</dt>
                <dd>{currencyFormatter.format(result.totalInterest)}</dd>
              </div>
              <div>
                <dt>Number of Payments</dt>
                <dd>{Math.round(result.payments)}</dd>
              </div>
              <div>
                <dt>Mortgage Type</dt>
                <dd>{result.mortgageType}</dd>
              </div>
              {result.ltvRatio !== null && (
                <div>
                  <dt>LTV Ratio</dt>
                  <dd>{result.ltvRatio.toFixed(2)}%</dd>
                </div>
              )}
            </dl>
            {result.mortgageType === "Adjustable Rate" && (
              <p className="result-note">
                Estimate uses the current rate as a fixed value over the full term.
              </p>
            )}
            {result.mortgageType === "Interest-Only" && (
              <p className="result-note">
                Interest-only estimate assumes principal is repaid as a lump sum at term end.
              </p>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
