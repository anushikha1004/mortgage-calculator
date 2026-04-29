import React, { useMemo, useState } from "react";
import "./App.css";

const RATE_MIN = 0;
const RATE_MAX = 20;
const RATE_STEP = 0.01;
const MAX_LOAN_AMOUNT = 2000000;

const cleanNumericInput = (value) => value.replace(/[^\d.]/g, "");

const formatPoundsInput = (value) => {
  if (!value) {
    return "";
  }

  const [wholePartRaw, decimalPart] = value.split(".");
  const wholePart = wholePartRaw.replace(/^0+(?=\d)/, "") || "0";
  const withCommas = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart !== undefined ? `${withCommas}.${decimalPart.slice(0, 2)}` : withCommas;
};

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

    const principal = Number(cleanNumericInput(amount));
    const annualRate = Number(rate);
    const termYears = Number(years);
    const homeValue = propertyValue === "" ? null : Number(cleanNumericInput(propertyValue));

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
    if (principal > MAX_LOAN_AMOUNT) {
      setResult(null);
      setError(`Loan amount cannot exceed ${currencyFormatter.format(MAX_LOAN_AMOUNT)}.`);
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

  const handleRateInputChange = (value) => {
    if (value === "") {
      setRate("");
      return;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }

    const clampedValue = Math.min(Math.max(parsed, RATE_MIN), RATE_MAX);
    setRate(String(clampedValue));
  };

  const handleAmountChange = (value) => {
    const cleaned = cleanNumericInput(value);
    setAmount(formatPoundsInput(cleaned));
    setResult(null);
    setError("");
  };

  const handlePropertyValueChange = (value) => {
    const cleaned = cleanNumericInput(value);
    setPropertyValue(formatPoundsInput(cleaned));
    setResult(null);
    setError("");
  };

  const hasBasicDetails = amount !== "" && rate !== "" && years !== "";

  return (
    <main className="page">
      <section className="container" aria-labelledby="mortgage-title">
        <h1 id="mortgage-title">Mortgage Calculator</h1>
        <p className="intro">
          Fill in the details below to get a quick mortgage estimate.
        </p>
        <form onSubmit={calculate} noValidate>
            <div className="field">
              <label htmlFor="amount">Loan Amount (GBP)</label>
              <input
                id="amount"
                name="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="e.g. 250,000"
                aria-describedby="amount-hint"
                required
              />
              <p id="amount-hint" className="hint">
                Total amount you plan to borrow. Max {currencyFormatter.format(MAX_LOAN_AMOUNT)}.
              </p>
            </div>

            <div className="field">
              <label htmlFor="rate">Annual Interest Rate (%)</label>
              <div className="rate-row">
                <input
                  id="rateSlider"
                  className="rate-slider"
                  type="range"
                  min={RATE_MIN}
                  max={RATE_MAX}
                  step={RATE_STEP}
                  value={rate === "" ? RATE_MIN : Number(rate)}
                  onChange={(e) => setRate(e.target.value)}
                  aria-label="Interest rate slider"
                />
                <span className="rate-chip">{rate === "" ? "0.00" : Number(rate).toFixed(2)}%</span>
              </div>
              <input
                id="rate"
                name="rate"
                type="number"
                min={RATE_MIN}
                max={RATE_MAX}
                step={RATE_STEP}
                inputMode="decimal"
                value={rate}
                onChange={(e) => handleRateInputChange(e.target.value)}
                placeholder="e.g. 4.75"
                aria-describedby="rate-hint"
                required
              />
              <p id="rate-hint" className="hint">
                Use the nominal yearly rate from your lender (0% to 20%).
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
                Repayment period in years (for example, 20 to 35 years).
              </p>
            </div>

            {hasBasicDetails && (
              <>
                <div className="field">
                  <label htmlFor="mortgageType">
                    Mortgage Type
                    <span className="tooltip" tabIndex="0" aria-label="Type help">
                      ?
                      <span className="tooltip-text">
                        Fixed Rate: payment rate stays constant. Tracker Rate: can move up or down with a benchmark rate.
                      </span>
                    </span>
                  </label>
                  <select
                    id="mortgageType"
                    name="mortgageType"
                    value={mortgageType}
                    onChange={(e) => setMortgageType(e.target.value)}
                  >
                    <option value="Fixed Rate">Fixed Rate</option>
                    <option value="Tracker Rate">Tracker Rate</option>
                    <option value="Interest-Only">Interest-Only</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="propertyValue">Property Value (GBP, optional)</label>
                  <input
                    id="propertyValue"
                    name="propertyValue"
                    type="text"
                    inputMode="decimal"
                    value={propertyValue}
                    onChange={(e) => handlePropertyValueChange(e.target.value)}
                    placeholder="e.g. 300,000"
                    aria-describedby="property-hint"
                  />
                  <p id="property-hint" className="hint">
                    Optional, but helpful for loan-to-value (LTV) checks.
                  </p>
                </div>
              </>
            )}

            {error && (
              <p className="error" role="alert" aria-live="assertive">
                {error}
              </p>
            )}

            <div className="actions">
              <button type="submit">Calculate My Estimate</button>
              <button type="button" className="secondary" onClick={resetForm}>
                Reset Form
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
            {result.mortgageType === "Tracker Rate" && (
              <p className="result-note">
                Estimate uses the current rate as a fixed value over the full term.
              </p>
            )}
            {result.mortgageType === "Interest-Only" && (
              <p className="result-note">
                Interest-only estimate assumes principal is repaid as a lump sum at term end.
              </p>
            )}
            {Number(rate) === 0 && (
              <p className="result-note">
                0% interest scenario: payment reflects principal repayment only.
              </p>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
