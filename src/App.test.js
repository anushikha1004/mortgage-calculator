import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

describe("Mortgage Calculator", () => {
  test("renders calculator heading and primary action", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /mortgage calculator/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /calculate payment/i })
    ).toBeInTheDocument();
  });

  test("shows validation error for missing fields", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /calculate payment/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/fill in all fields/i);
  });

  test("calculates monthly payment and summary values correctly", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/loan amount/i), {
      target: { value: "250000" },
    });
    fireEvent.change(screen.getByLabelText(/annual interest rate/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/loan term/i), {
      target: { value: "30" },
    });

    fireEvent.click(screen.getByRole("button", { name: /calculate payment/i }));

    expect(screen.getByText("£1,342.05")).toBeInTheDocument();
    expect(screen.getByText("£483,139.46")).toBeInTheDocument();
    expect(screen.getByText("£233,139.46")).toBeInTheDocument();
    expect(screen.getByText("360")).toBeInTheDocument();
  });

  test("prefills fields when a sample scenario is selected", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/sample scenario/i), {
      target: { value: "high-ltv" },
    });

    expect(screen.getByLabelText(/loan amount/i)).toHaveValue(350000);
    expect(screen.getByLabelText(/annual interest rate/i)).toHaveValue(4.5);
    expect(screen.getByLabelText(/loan term/i)).toHaveValue(30);
    expect(screen.getByLabelText(/mortgage type/i)).toHaveValue("Fixed Rate");
    expect(screen.getByLabelText(/property value/i)).toHaveValue(400000);
  });

  test("calculates interest-only mortgages with ltv ratio", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/loan amount/i), {
      target: { value: "250000" },
    });
    fireEvent.change(screen.getByLabelText(/annual interest rate/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/loan term/i), {
      target: { value: "25" },
    });
    fireEvent.change(screen.getByLabelText(/mortgage type/i), {
      target: { value: "Interest-Only" },
    });
    fireEvent.change(screen.getByLabelText(/property value/i), {
      target: { value: "400000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /calculate payment/i }));

    expect(screen.getByText("£833.33")).toBeInTheDocument();
    expect(screen.getByText("62.50%")).toBeInTheDocument();
  });
});
