import React, { useState } from "react";
import Button from "../ui/Button";
import Loader from "../ui/Loader";
import "./PaystackPayment.css";

const PaystackPayment = ({ lesson, student, onSuccess, onClose, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState("selection"); // selection, processing, success, failed
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("paystack"); // paystack, mobile

  // -------------------------------
  // SIMPLIFIED PAYMENT SIMULATION
  // -------------------------------
  const simulatePayment = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% success

        if (isSuccess) {
          resolve({
            reference: `PAY_${Date.now()}`,
            method: selectedMethod,
            status: "success",
            amount: lesson.price
          });
        } else {
          reject(new Error("Payment failed. Please try again."));
        }
      }, 2500);
    });
  };

  // Success handler
  const handlePaymentSuccess = (data) => {
    setIsProcessing(false);
    setPaymentStep("success");

    setTimeout(() => {
      onSuccess({
        paymentId: data.reference,
        gateway: "paystack",
        method: data.method,
        amount: lesson.price,
        lessonId: lesson.id,
        studentId: student.id,
        timestamp: new Date().toISOString(),
        transactionData: data,
      });
    }, 1200);
  };

  // Error handler
  const handlePaymentError = (err) => {
    setIsProcessing(false);
    setPaymentStep("failed");
    setError(err.message);
    onError(err);
  };

  // Handle click
  const handlePaymentClick = async () => {
    setIsProcessing(true);
    setPaymentStep("processing");
    setError(null);

    try {
      const result = await simulatePayment();
      handlePaymentSuccess(result);
    } catch (err) {
      handlePaymentError(err);
    }
  };

  // Retry
  const handleRetryPayment = () => {
    setPaymentStep("selection");
    setError(null);
  };

  // Cancel
  const handleCancelPayment = () => {
    setIsProcessing(false);
    setPaymentStep("selection");
    setError(null);
    onClose();
  };

  // -------------------------------
  // SUCCESS SCREEN
  // -------------------------------
  if (paymentStep === "success") {
    return (
      <div className="payment-success-screen">
        <div className="success-icon">🎉</div>
        <h3>Payment Successful!</h3>
        <p>
          You now have access to{" "}
          <strong>{lesson.title}</strong>
        </p>

        <Button onClick={onClose} className="btn-primary">
          Continue to Lesson
        </Button>
      </div>
    );
  }

  // -------------------------------
  // PROCESSING SCREEN
  // -------------------------------
  if (paymentStep === "processing") {
    return (
      <div className="payment-processing">
        <Loader size="large" />
        <h3>Processing payment...</h3>
        <p>Please wait. Do not close this tab.</p>
      </div>
    );
  }

  // -------------------------------
  // FAILED SCREEN
  // -------------------------------
  if (paymentStep === "failed") {
    return (
      <div className="payment-failed-screen">
        <div className="failed-icon">❌</div>
        <h3>Payment Failed</h3>
        <p>{error}</p>

        <Button onClick={handleRetryPayment} className="btn-primary">
          Try Again
        </Button>

        <Button onClick={handleCancelPayment} className="btn-outline">
          Cancel
        </Button>
      </div>
    );
  }

  // -------------------------------
  // MAIN PAYMENT SCREEN
  // -------------------------------
  return (
    <div className="paystack-payment">
      <div className="payment-header">
        <h2>Choose Payment Method</h2>
        <p className="subtitle">Secure payment powered by Paystack</p>
      </div>

      <div className="payment-summary">
        <h3>Order Summary</h3>

        <div className="summary-item">
          <span>Lesson:</span>
          <span>{lesson.title}</span>
        </div>

        <div className="summary-item total">
          <span>Total Amount:</span>
          <span className="price">
            ₦{lesson.price.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="payment-methods">
        <h3>Select Payment Method</h3>

        <div className="methods-container">

          {/* Paystack */}
          <div
            className={`payment-option ${
              selectedMethod === "paystack" ? "selected" : ""
            }`}
            onClick={() => setSelectedMethod("paystack")}
          >
            <div className="option-icon">💳</div>
            <div className="option-content">
              <h4>Paystack</h4>
              <p>Pay with card, bank or USSD</p>
            </div>
            <div className="option-check">
              {selectedMethod === "paystack" && "✓"}
            </div>
          </div>

          {/* Mobile Money */}
          <div
            className={`payment-option ${
              selectedMethod === "mobile" ? "selected" : ""
            }`}
            onClick={() => setSelectedMethod("mobile")}
          >
            <div className="option-icon">📱</div>
            <div className="option-content">
              <h4>Mobile Money</h4>
              <p>Pay using Mobile Money</p>
            </div>
            <div className="option-check">
              {selectedMethod === "mobile" && "✓"}
            </div>
          </div>

        </div>
      </div>

      <Button
        onClick={handlePaymentClick}
        disabled={isProcessing}
        fullWidth
        className="payment-btn"
      >
        {isProcessing
          ? "Processing..."
          : `Pay ₦${lesson.price.toLocaleString()}`}
      </Button>

      <div className="paystack-badge">
        🔐 Powered by Paystack
      </div>

      <Button className="btn-link" onClick={handleCancelPayment} fullWidth>
        Cancel Payment
      </Button>
    </div>
  );
};

export default PaystackPayment;