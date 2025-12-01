import React, { useState } from 'react';
import './PaymentSelection.css'; // Save the CSS above as this file

const PaymentSelection = ({ lesson, onProceed, onCancel }) => {
  const [selectedGateway, setSelectedGateway] = useState(null);

  const paymentGateways = [
    {
      id: 'paystack',
      name: 'Paystack',
      logo: '💳',
      description: 'Pay with card, bank, or USSD',
      options: ['Card', 'Bank Transfer', 'USSD', 'QR', 'Mobile Money']
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      logo: '💸',
      description: 'Multiple payment options',
      options: ['Card', 'Bank Transfer', 'USSD', 'Mobile Money']
    },
    {
      id: 'bank-transfer',
      name: 'Direct Bank Transfer',
      logo: '🏦',
      description: 'Transfer to our account',
      options: ['OPay', 'PalmPay', 'GTB', 'Zenith', 'Access', 'First Bank']
    }
  ];

  const ussdCodes = [
    { bank: 'OPay', code: '*955#' },
    { bank: 'PalmPay', code: '*111#' },
    { bank: 'GTB', code: '*737#' },
    { bank: 'Zenith', code: '*966#' },
    { bank: 'Access', code: '*901#' }
  ];

  const handleProceed = () => {
    if (selectedGateway) {
      onProceed(selectedGateway);
    }
  };

  return (
    <div className="payment-selection-page">
      <div className="payment-header">
        <h1>Unlock Premium Lesson</h1>
        <p>Complete your payment to access this exclusive content</p>
      </div>

      <div className="lesson-info-card">
        <h2>{lesson.title}</h2>
        <div className="lesson-details">
          <div className="detail-item">
            <span>Course:</span>
            <span>{lesson.courseTitle}</span>
          </div>
          <div className="detail-item">
            <span>Duration:</span>
            <span>{lesson.duration}</span>
          </div>
          <div className="detail-item">
            <span>Instructor:</span>
            <span>{lesson.instructor}</span>
          </div>
        </div>
        <div className="price-highlight">₦{lesson.price.toLocaleString()}</div>
      </div>

      <div className="payment-gateways">
        <h2>Select Payment Method</h2>
        <div className="gateway-grid">
          {paymentGateways.map(gateway => (
            <div
              key={gateway.id}
              className={`gateway-card ${selectedGateway === gateway.id ? 'selected' : ''}`}
              onClick={() => setSelectedGateway(gateway.id)}
            >
              <div className="selection-indicator"></div>
              <div className="gateway-header">
                <div className={`gateway-logo ${gateway.id}-logo`}>
                  {gateway.logo}
                </div>
                <div>
                  <h3>{gateway.name}</h3>
                  <p>{gateway.description}</p>
                </div>
              </div>
              <div className="payment-options">
                {gateway.options.map(option => (
                  <span key={option} className="payment-option-tag">
                    {option}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ussd-section">
        <h3>📱 USSD Payment</h3>
        <p>Dial code on your phone:</p>
        <div className="bank-codes-grid">
          {ussdCodes.map(bank => (
            <div key={bank.bank} className="bank-code">
              <div className="bank-name">{bank.bank}</div>
              <div className="ussd-code">{bank.code}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mobile-money-section">
        <h3>📲 Mobile Money</h3>
        <p>Available mobile money options:</p>
        <div className="mobile-money-grid">
          <div className="mobile-money-option">
            <div className="mobile-money-icon">📱</div>
            <div className="mobile-money-info">
              <h4>OPay Wallet</h4>
              <p>Send to: 0812 345 6789</p>
            </div>
          </div>
          <div className="mobile-money-option">
            <div className="mobile-money-icon">💚</div>
            <div className="mobile-money-info">
              <h4>PalmPay</h4>
              <p>Send to: 0901 234 5678</p>
            </div>
          </div>
        </div>
      </div>

      <div className="payment-actions">
        <button
          className="proceed-btn"
          onClick={handleProceed}
          disabled={!selectedGateway}
        >
          {selectedGateway ? `Pay ₦${lesson.price.toLocaleString()}` : 'Select Payment Method'}
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          Cancel Payment
        </button>
      </div>

      <div className="payment-security-footer">
        <p>🔒 100% Secure Payment • SSL Encrypted</p>
        <div className="security-icons">
          <span className="security-icon">✅ PCI DSS Compliant</span>
          <span className="security-icon">✅ 3D Secure</span>
          <span className="security-icon">✅ Money Back Guarantee</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;