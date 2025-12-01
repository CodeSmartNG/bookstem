import React, { useState } from 'react';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import './PaystackPayment.css';

const PaystackPayment = ({ lesson, student, onSuccess, onClose, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState('init'); // init, processing, success, failed
  const [selectedMethod, setSelectedMethod] = useState('card'); // card, transfer, ussd
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Handle card input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardDetails(prev => ({ ...prev, [name]: formatted.slice(0, 19) }));
    } 
    // Format expiry date
    else if (name === 'expiryDate') {
      let formatted = value.replace(/\D/g, '');
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
      }
      setCardDetails(prev => ({ ...prev, [name]: formatted.slice(0, 5) }));
    }
    // Format CVV
    else if (name === 'cvv') {
      setCardDetails(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 3) }));
    }
  };

  // Validate card details
  const validateCardDetails = () => {
    if (selectedMethod !== 'card') return true;
    
    const { cardNumber, expiryDate, cvv } = cardDetails;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!expiryDate || !expiryDate.includes('/')) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (!cvv || cvv.length !== 3) {
      setError('Please enter a valid 3-digit CVV');
      return false;
    }
    
    return true;
  };

  // Simulate different payment methods
  const simulatePayment = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let successRate = 0.8; // 80% success rate for cards
        
        if (selectedMethod === 'transfer') {
          successRate = 0.9; // 90% for bank transfer
        } else if (selectedMethod === 'ussd') {
          successRate = 0.95; // 95% for USSD
        }
        
        const isSuccess = Math.random() > (1 - successRate);
        
        if (isSuccess) {
          resolve({
            reference: `${selectedMethod.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            transaction: `TXN_${Date.now()}`,
            status: 'success',
            message: `Payment via ${selectedMethod.toUpperCase()} successful`,
            method: selectedMethod
          });
        } else {
          let errorMessage = 'Payment failed. Please try again.';
          if (selectedMethod === 'card') {
            errorMessage = 'Card payment declined. Please check your card details.';
          } else if (selectedMethod === 'transfer') {
            errorMessage = 'Bank transfer failed. Please try again.';
          } else if (selectedMethod === 'ussd') {
            errorMessage = 'USSD transaction failed. Please try again.';
          }
          reject(new Error(errorMessage));
        }
      }, 3000);
    });
  };

  const handlePaymentSuccess = (reference) => {
    setIsProcessing(false);
    setPaymentStep('success');
    console.log('Payment successful via:', reference.method);
    
    setTimeout(() => {
      onSuccess({
        paymentId: reference.reference,
        gateway: 'paystack',
        method: reference.method,
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
    console.error('Payment error:', error);
    setError(error.message || 'Payment failed. Please try again.');
    onError(error);
  };

  const handlePaymentClick = async () => {
    if (isProcessing) return;
    
    // Validate card details if card payment selected
    if (selectedMethod === 'card' && !validateCardDetails()) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentStep('processing');
    setError(null);
    
    try {
      const paymentResult = await simulatePayment();
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
    setCardDetails({ cardNumber: '', expiryDate: '', cvv: '' });
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
    const methodText = selectedMethod === 'card' ? 'Card' : 
                      selectedMethod === 'transfer' ? 'Bank Transfer' : 'USSD';
    
    return (
      <div className="payment-processing">
        <Loader size="large" />
        <h3>Processing {methodText} Payment...</h3>
        <p>Please wait while we process your payment.</p>
        <p className="processing-note">
          {selectedMethod === 'ussd' ? 'Check your phone for USSD prompt' : 'Do not close this window'}
        </p>
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
          <span>Total:</span>
          <span>₦{lesson.price.toLocaleString()}</span>
        </div>
      </div>

      <div className="payment-methods">
        <h4>Select Payment Method</h4>
        <div className={`payment-option ${selectedMethod === 'card' ? 'selected' : ''}`}>
          <input 
            type="radio" 
            id="card" 
            name="payment" 
            checked={selectedMethod === 'card'}
            onChange={() => setSelectedMethod('card')}
          />
          <label htmlFor="card">💳 Debit/Credit Card</label>
        </div>
        <div className={`payment-option ${selectedMethod === 'transfer' ? 'selected' : ''}`}>
          <input 
            type="radio" 
            id="transfer" 
            name="payment" 
            checked={selectedMethod === 'transfer'}
            onChange={() => setSelectedMethod('transfer')}
          />
          <label htmlFor="transfer">🏦 Bank Transfer</label>
        </div>
        <div className={`payment-option ${selectedMethod === 'ussd' ? 'selected' : ''}`}>
          <input 
            type="radio" 
            id="ussd" 
            name="payment" 
            checked={selectedMethod === 'ussd'}
            onChange={() => setSelectedMethod('ussd')}
          />
          <label htmlFor="ussd">📱 USSD</label>
        </div>
      </div>

      {selectedMethod === 'card' && (
        <div className="card-details">
          <h4>Card Details</h4>
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
      )}

      {selectedMethod === 'transfer' && (
        <div className="bank-transfer-details">
          <h4>Bank Transfer Details</h4>
          <div className="transfer-info">
            <p>Account Name: <strong>BOOKSTEM LEARNING</strong></p>
            <p>Account Number: <strong>0123456789</strong></p>
            <p>Bank: <strong>ACCESS BANK</strong></p>
            <p className="note">Note: Use your Student ID <strong>({student.id})</strong> as reference</p>
          </div>
        </div>
      )}

      {selectedMethod === 'ussd' && (
        <div className="ussd-payment-details">
          <h4>USSD Payment</h4>
          <div className="ussd-steps">
            <ol>
              <li>Dial <strong>*966*000*{lesson.price}#</strong> on your phone</li>
              <li>Follow the prompts to complete payment</li>
              <li>Return to this page after successful payment</li>
            </ol>
          </div>
        </div>
      )}
      
      <Button
        onClick={handlePaymentClick}
        disabled={isProcessing}
        className={`payment-btn ${selectedMethod}-btn ${isProcessing ? 'processing' : ''}`}
        fullWidth
      >
        {isProcessing ? (
          <>
            <Loader size="small" />
            Processing...
          </>
        ) : selectedMethod === 'ussd' ? (
          'Confirm USSD Payment'
        ) : selectedMethod === 'transfer' ? (
          'I Have Made Transfer'
        ) : (
          `Pay ₦${lesson.price.toLocaleString()}`
        )}
      </Button>
      
      <p className="payment-note">
        🔒 Secure payment encrypted with SSL technology
      </p>
      
      <div className="payment-security">
        <div className="security-features">
          <span>✅ PCI DSS Compliant</span>
          <span>✅ 3D Secure</span>
          <span>✅ SSL Encrypted</span>
        </div>
      </div>

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
