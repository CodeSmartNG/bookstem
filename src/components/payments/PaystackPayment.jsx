import React, { useState } from 'react';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import './PaystackPayment.css';

const PaystackPayment = ({ lesson, student, onSuccess, onClose, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState('selection'); // selection, processing, success, failed
  const [selectedMethod, setSelectedMethod] = useState('card'); // card, transfer, ussd
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
    if (selectedMethod !== 'card') return true;
    
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
  const simulatePayment = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let successRate = 0.8; // 80% success rate
        
        if (selectedMethod === 'transfer') {
          successRate = 0.9; // 90% for bank transfer
        } else if (selectedMethod === 'ussd') {
          successRate = 0.95; // 95% for USSD
        }
        
        const isSuccess = Math.random() > (1 - successRate);
        
        if (isSuccess) {
          resolve({
            reference: `PAYSTACK_${selectedMethod.toUpperCase()}_${Date.now()}`,
            transaction: `TXN_${Date.now()}`,
            status: 'success',
            message: `Payment via ${selectedMethod} successful`,
            method: selectedMethod,
            amount: lesson.price
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
    setPaymentStep('selection');
    setError(null);
  };

  const handleCancelPayment = () => {
    setIsProcessing(false);
    setPaymentStep('selection');
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

  // Payment selection screen (initial screen)
  return (
    <div className="paystack-payment">
      {error && (
        <div className="payment-error alert alert-error">
          <p>{error}</p>
        </div>
      )}
      
      <div className="payment-header">
        <h2>Pay with Paystack</h2>
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

      <div className="payment-methods">
        <h3>Select Payment Method</h3>
        <div className="methods-container">
          <div 
            className={`payment-option ${selectedMethod === 'card' ? 'selected' : ''}`}
            onClick={() => setSelectedMethod('card')}
            data-method="card"
          >
            <div className="option-icon">💳</div>
            <div className="option-content">
              <h4>Card Payment</h4>
              <p>Pay with debit/credit card</p>
            </div>
            <div className="option-check">
              {selectedMethod === 'card' && '✓'}
            </div>
          </div>
          
          <div 
            className={`payment-option ${selectedMethod === 'transfer' ? 'selected' : ''}`}
            onClick={() => setSelectedMethod('transfer')}
            data-method="transfer"
          >
            <div className="option-icon">🏦</div>
            <div className="option-content">
              <h4>Bank Transfer</h4>
              <p>Transfer to our bank account</p>
            </div>
            <div className="option-check">
              {selectedMethod === 'transfer' && '✓'}
            </div>
          </div>
          
          <div 
            className={`payment-option ${selectedMethod === 'ussd' ? 'selected' : ''}`}
            onClick={() => setSelectedMethod('ussd')}
            data-method="ussd"
          >
            <div className="option-icon">📱</div>
            <div className="option-content">
              <h4>USSD Payment</h4>
              <p>Pay via USSD on your phone</p>
            </div>
            <div className="option-check">
              {selectedMethod === 'ussd' && '✓'}
            </div>
          </div>
        </div>
      </div>

      {/* Card Payment Details */}
      {selectedMethod === 'card' && (
        <div className="payment-details card-details">
          <h4>Enter Card Details</h4>
          <div className="card-form">
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
        </div>
      )}

      {/* Bank Transfer Details */}
      {selectedMethod === 'transfer' && (
        <div className="payment-details transfer-details">
          <h4>Bank Transfer Details</h4>
          <div className="transfer-info">
            <div className="account-card">
              <div className="account-item">
                <span className="label">Account Name:</span>
                <span className="value">BOOKSTEM LEARNING</span>
              </div>
              <div className="account-item">
                <span className="label">Account Number:</span>
                <span className="value">0123456789</span>
              </div>
              <div className="account-item">
                <span className="label">Bank Name:</span>
                <span className="value">ACCESS BANK</span>
              </div>
            </div>
            <div className="transfer-instructions">
              <h5>Instructions:</h5>
              <ol>
                <li>Transfer <strong>₦{lesson.price.toLocaleString()}</strong> to the account above</li>
                <li>Use your Student ID <strong>({student.id})</strong> as payment reference</li>
                <li>Click the button below after completing the transfer</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* USSD Payment Details */}
      {selectedMethod === 'ussd' && (
        <div className="payment-details ussd-details">
          <h4>USSD Payment Instructions</h4>
          <div className="ussd-instructions">
            <div className="ussd-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <p>Dial <code>*966*000*{lesson.price}#</code> on your phone</p>
              </div>
            </div>
            <div className="ussd-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <p>Select your bank and follow the prompts</p>
              </div>
            </div>
            <div className="ussd-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <p>Enter your PIN to complete payment</p>
              </div>
            </div>
            <div className="ussd-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <p>Return to this page after successful payment</p>
              </div>
            </div>
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
      
      <div className="paystack-badge">
        <span>🔐 Powered by Paystack</span>
      </div>
      
      <p className="payment-note">
        🔒 100% Secure Payment • SSL Encrypted • PCI DSS Compliant
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