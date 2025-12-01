import React, { useState } from 'react';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import './PaystackPayment.css';

const PaystackPayment = ({ lesson, student, onSuccess, onClose, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState('init'); // init, processing, success, failed
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

  // Handle card input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardDetails(prev => ({ ...prev, [name]: formatted.slice(0, 19) }));
    } else if (name === 'expiryDate') {
      let formatted = value.replace(/\D/g, '');
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
      }
      setCardDetails(prev => ({ ...prev, [name]: formatted.slice(0, 5) }));
    } else if (name === 'cvv') {
      setCardDetails(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 3) }));
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  // Validate card details
  const validateCardDetails = () => {
    const { cardNumber, expiryDate, cvv, name } = cardDetails;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!expiryDate || !expiryDate.includes('/') || expiryDate.length !== 5) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (!cvv || cvv.length !== 3) {
      setError('Please enter a valid 3-digit CVV');
      return false;
    }
    
    if (!name || name.trim().length < 2) {
      setError('Please enter the cardholder name');
      return false;
    }
    
    return true;
  };

  // Simulate Paystack payment
  const simulatePaystackPayment = () => {
    return new Promise((resolve, reject) => {
      // Simulate API call to Paystack
      setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% success rate for demo
        if (isSuccess) {
          resolve({
            reference: `PSK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            transaction: `TXN_${Date.now()}`,
            status: 'success',
            message: 'Payment successful',
            amount: lesson.price
          });
        } else {
          reject(new Error('Payment failed. Please check your card details and try again.'));
        }
      }, 3000);
    });
  };

  const handlePaymentSuccess = (reference) => {
    setIsProcessing(false);
    setPaymentStep('success');
    
    // Simulate successful payment processing
    setTimeout(() => {
      onSuccess({
        paymentId: reference.reference,
        gateway: 'paystack',
        amount: lesson.price,
        lessonId: lesson.id,
        studentId: student.id,
        timestamp: new Date().toISOString(),
        transactionData: reference
      });
    }, 1500);
  };

  const handlePaymentError = (error) => {
    setIsProcessing(false);
    setPaymentStep('failed');
    setError(error.message || 'Payment failed. Please try again.');
    onError(error);
  };

  const handlePaymentClick = async () => {
    if (isProcessing) return;
    
    // Validate card details
    if (!validateCardDetails()) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentStep('processing');
    setError(null);
    
    try {
      const paymentResult = await simulatePaystackPayment();
      handlePaymentSuccess(paymentResult);
    } catch (err) {
      handlePaymentError(err);
    }
  };

  const handleRetryPayment = () => {
    setPaymentStep('init');
    setError(null);
  };

  const handleCancelPayment = () => {
    setIsProcessing(false);
    setPaymentStep('init');
    setError(null);
    setCardDetails({ cardNumber: '', expiryDate: '', cvv: '', name: '' });
    onClose();
  };

  // Payment success screen
  if (paymentStep === 'success') {
    return (
      <div className="payment-success-screen">
        <div className="success-icon">🎉</div>
        <h3>Payment Successful!</h3>
        <p>Your payment of <strong>₦{lesson.price.toLocaleString()}</strong> has been processed successfully.</p>
        <p>You now have access to <strong>{lesson.title}</strong></p>
        <div className="success-actions">
          <Button 
            onClick={() => onClose()}
            className="btn-primary"
          >
            Continue to Lesson
          </Button>
        </div>
      </div>
    );
  }

  // Payment processing screen
  if (paymentStep === 'processing') {
    return (
      <div className="payment-processing">
        <Loader size="large" />
        <h3>Processing Payment...</h3>
        <p>Please wait while we process your payment.</p>
        <p className="processing-note">Do not close this window.</p>
      </div>
    );
  }

  // Payment failed screen
  if (paymentStep === 'failed') {
    return (
      <div className="payment-failed-screen">
        <div className="failed-icon">❌</div>
        <h3>Payment Failed</h3>
        <p>{error}</p>
        <div className="failed-actions">
          <Button 
            onClick={handleRetryPayment}
            className="btn-primary"
          >
            Try Again
          </Button>
          <Button 
            onClick={handleCancelPayment}
            className="btn-outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Initial payment screen - ONLY PAYSTACK
  return (
    <div className="paystack-payment">
      {error && (
        <div className="payment-error alert alert-error">
          <p>{error}</p>
        </div>
      )}
      
      <div className="payment-header">
        <h2>💳 Pay with Paystack</h2>
        <p className="subtitle">Secure card payment powered by Paystack</p>
      </div>

      <div className="payment-summary">
        <h3>Order Summary</h3>
        <div className="summary-item">
          <span>Lesson:</span>
          <span>{lesson.title}</span>
        </div>
        <div className="summary-item">
          <span>Course:</span>
          <span>{lesson.courseTitle}</span>
        </div>
        <div className="summary-item total">
          <span>Total Amount:</span>
          <span className="price">₦{lesson.price.toLocaleString()}</span>
        </div>
      </div>

      <div className="card-details">
        <h4>Enter Your Card Details</h4>
        <div className="form-group">
          <label>Cardholder Name</label>
          <input 
            type="text" 
            name="name"
            placeholder="John Doe" 
            className="form-input"
            value={cardDetails.name}
            onChange={handleCardInputChange}
          />
        </div>
        <div className="form-group">
          <label>Card Number</label>
          <input 
            type="text" 
            name="cardNumber"
            placeholder="1234 5678 9012 3456" 
            className="form-input"
            value={cardDetails.cardNumber}
            onChange={handleCardInputChange}
            maxLength="19"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Expiry Date</label>
            <input 
              type="text" 
              name="expiryDate"
              placeholder="MM/YY" 
              className="form-input"
              value={cardDetails.expiryDate}
              onChange={handleCardInputChange}
              maxLength="5"
            />
          </div>
          <div className="form-group">
            <label>CVV</label>
            <input 
              type="text" 
              name="cvv"
              placeholder="123" 
              className="form-input"
              value={cardDetails.cvv}
              onChange={handleCardInputChange}
              maxLength="3"
            />
          </div>
        </div>
      </div>
      
      <Button
        onClick={handlePaymentClick}
        disabled={isProcessing}
        className={`payment-btn paystack-btn ${isProcessing ? 'processing' : ''}`}
        fullWidth
      >
        {isProcessing ? (
          <>
            <Loader size="small" />
            Processing...
          </>
        ) : (
          `Pay ₦${lesson.price.toLocaleString()} with Paystack`
        )}
      </Button>
      
      <div className="paystack-security">
        <div className="security-badge">
          <span>🔐 Powered by Paystack</span>
        </div>
        <div className="security-features">
          <span>✅ PCI DSS Compliant</span>
          <span>✅ 3D Secure</span>
          <span>✅ SSL Encrypted</span>
        </div>
      </div>
      
      <p className="payment-note">
        Your payment is secure and encrypted. We never store your card details.
      </p>

      <div className="payment-footer">
        <Button 
          onClick={handleCancelPayment}
          className="btn-link"
          fullWidth
        >
          Cancel Payment
        </Button>
      </div>
    </div>
  );
};

export default PaystackPayment;