import React, { useState } from 'react';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import './PaystackPayment.css';

const PaystackPayment = ({ lesson, student, onSuccess, onClose, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState('init');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: student?.email || ''
  });

  // Paystack Configuration
  const PAYSTACK_PUBLIC_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_YOUR_PUBLIC_KEY';
  
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
    const { cardNumber, expiryDate, cvv, name, email } = cardDetails;
    
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
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  // REAL Paystack Payment Integration
  const initializePaystackPayment = async () => {
    if (!window.PaystackPop) {
      setError('Paystack is not loaded. Please try again.');
      return;
    }

    const paystack = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: cardDetails.email,
      amount: lesson.price * 100, // Paystack expects amount in kobo
      currency: 'NGN',
      ref: `PAYSTACK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        course_key: lesson.courseKey,
        student_id: student.id,
        student_name: student.name
      },
      callback: function(response) {
        // Payment successful
        console.log('Paystack payment successful:', response);
        handlePaymentSuccess({
          reference: response.reference,
          transaction: response.transaction,
          status: 'success',
          message: 'Payment successful via Paystack',
          amount: lesson.price,
          gateway: 'paystack'
        });
      },
      onClose: function() {
        // User closed the payment modal
        console.log('Paystack payment modal closed');
        setIsProcessing(false);
        setPaymentStep('init');
        setError('Payment was cancelled by user');
      }
    });

    paystack.openIframe();
  };

  // Handle payment success
  const handlePaymentSuccess = (reference) => {
    setIsProcessing(false);
    setPaymentStep('success');
    
    // Call success callback
    setTimeout(() => {
      onSuccess({
        paymentId: reference.reference,
        gateway: 'paystack',
        method: 'card',
        amount: lesson.price,
        lessonId: lesson.id,
        studentId: student.id,
        timestamp: new Date().toISOString(),
        transactionData: reference
      });
    }, 1500);
  };

  // Handle payment error
  const handlePaymentError = (error) => {
    setIsProcessing(false);
    setPaymentStep('failed');
    setError(error.message || 'Payment failed. Please try again.');
    onError(error);
  };

  // Main payment handler
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
      // Initialize real Paystack payment
      await initializePaystackPayment();
    } catch (err) {
      handlePaymentError(err);
    }
  };

  // Alternative: Load Paystack script dynamically
  const loadPaystackScript = () => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('Paystack script loaded');
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Paystack script'));
      };
      document.head.appendChild(script);
    });
  };

  // Initialize payment with script loading
  const handlePaymentWithScript = async () => {
    if (isProcessing) return;
    
    if (!validateCardDetails()) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentStep('processing');
    setError(null);
    
    try {
      // Load Paystack script if not already loaded
      await loadPaystackScript();
      
      // Initialize Paystack payment
      await initializePaystackPayment();
    } catch (err) {
      console.error('Payment initialization error:', err);
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
    setCardDetails({ cardNumber: '', expiryDate: '', cvv: '', name: '', email: student?.email || '' });
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
        <p>Please wait while we initialize Paystack payment.</p>
        <p className="processing-note">You will be redirected to Paystack secure payment page.</p>
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

  // Initial payment screen
  return (
    <div className="paystack-payment">
      {error && (
        <div className="payment-error alert alert-error">
          <p>{error}</p>
        </div>
      )}
      
      <div className="payment-header">
        <h2>💳 Pay with Paystack</h2>
        <p className="subtitle">Secure payment powered by Paystack</p>
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
        <h4>Enter Your Payment Details</h4>
        <div className="form-group">
          <label>Email Address *</label>
          <input 
            type="email" 
            name="email"
            placeholder="you@example.com" 
            className="form-input"
            value={cardDetails.email}
            onChange={handleCardInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Cardholder Name *</label>
          <input 
            type="text" 
            name="name"
            placeholder="John Doe" 
            className="form-input"
            value={cardDetails.name}
            onChange={handleCardInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Card Number *</label>
          <input 
            type="text" 
            name="cardNumber"
            placeholder="1234 5678 9012 3456" 
            className="form-input"
            value={cardDetails.cardNumber}
            onChange={handleCardInputChange}
            maxLength="19"
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Expiry Date (MM/YY) *</label>
            <input 
              type="text" 
              name="expiryDate"
              placeholder="MM/YY" 
              className="form-input"
              value={cardDetails.expiryDate}
              onChange={handleCardInputChange}
              maxLength="5"
              required
            />
          </div>
          <div className="form-group">
            <label>CVV *</label>
            <input 
              type="text" 
              name="cvv"
              placeholder="123" 
              className="form-input"
              value={cardDetails.cvv}
              onChange={handleCardInputChange}
              maxLength="3"
              required
            />
          </div>
        </div>
      </div>
      
      <Button
        onClick={handlePaymentWithScript}
        disabled={isProcessing}
        className={`payment-btn paystack-btn ${isProcessing ? 'processing' : ''}`}
        fullWidth
      >
        {isProcessing ? (
          <>
            <Loader size="small" />
            Initializing Payment...
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
        You will be redirected to Paystack's secure payment page to complete your transaction.
        Your card details are never stored on our servers.
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