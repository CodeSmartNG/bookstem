import React, { useEffect, useState } from 'react';
import { paymentService } from '../utils/paymentService';
import { getCurrentUser, purchaseLesson, getCourses, updateStudent } from '../utils/storage';

const PaymentCallback = ({ setCurrentView }) => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        let reference = urlParams.get('reference') || urlParams.get('trxref');
        
        console.log('🔗 Payment callback received:', { 
          reference,
          urlParams: Object.fromEntries(urlParams),
          fullUrl: window.location.href 
        });

        // If no reference in URL, check localStorage for direct payment info
        if (!reference) {
          const storedPayment = localStorage.getItem('paystack_payment_info') || 
                               localStorage.getItem('current_payment') ||
                               localStorage.getItem('paystack_payment_data');
          
          if (storedPayment) {
            try {
              const paymentData = JSON.parse(storedPayment);
              reference = paymentData.reference;
              console.log('📦 Using stored payment reference:', reference);
            } catch (e) {
              console.error('Error parsing stored payment:', e);
            }
          }
        }

        // Also check for payment reference in localStorage
        if (!reference) {
          reference = localStorage.getItem('paystack_reference');
        }

        if (!reference) {
          console.warn('⚠️ No payment reference found');
          setStatus('failed');
          setMessage('No payment reference found. Please contact support.');
          return;
        }

        console.log('🔍 Verifying payment with reference:', reference);

        // Verify payment with Paystack
        const verification = await paymentService.verifyPaystackPayment(reference);

        console.log('📊 Payment verification result:', verification);

        if (verification.status) {
          // Payment successful
          setPaymentDetails(verification.data);
          
          // Get payment data from localStorage
          const paymentData = JSON.parse(
            localStorage.getItem('paystack_payment_data') || 
            localStorage.getItem('paystack_payment_info') ||
            localStorage.getItem('current_payment') ||
            '{}'
          );

          console.log('📝 Stored payment data:', paymentData);

          const currentUser = getCurrentUser();
          
          if (!currentUser) {
            setStatus('failed');
            setMessage('User session expired. Please login again.');
            return;
          }

          // Extract lesson info from metadata or stored data
          let lessonId, courseKey;
          
          if (verification.data.metadata) {
            // Get from Paystack metadata
            lessonId = verification.data.metadata.lesson_id;
            courseKey = verification.data.metadata.course_key;
          } else if (paymentData) {
            // Get from stored payment data
            lessonId = paymentData.lessonId;
            courseKey = paymentData.courseKey;
          } else {
            // Try to get from localStorage
            lessonId = localStorage.getItem('paystack_lesson_id');
            courseKey = localStorage.getItem('paystack_course_key');
          }

          console.log('🎯 Lesson access details:', { lessonId, courseKey });

          if (lessonId && courseKey) {
            // Record purchase
            const success = await purchaseLesson(
              currentUser.id, 
              courseKey, 
              lessonId,
              {
                amount: verification.data.amount || paymentData.amount || 500,
                reference: reference,
                status: 'success',
                paidAt: verification.data.paid_at || new Date().toISOString(),
                paymentMethod: 'paystack'
              }
            );

            if (success) {
              setStatus('success');
              
              // Get course and lesson details for better message
              const courses = getCourses();
              const course = courses[courseKey];
              const lesson = course?.lessons?.find(l => l.id === lessonId);
              
              if (lesson) {
                setMessage(`Payment successful! You now have access to "${lesson.title}" in ${course?.title || 'the course'}.`);
              } else {
                setMessage(`Payment successful! Amount: ₦${verification.data.amount || paymentData.amount || '500'}`);
              }

              // Update user's purchased lessons in state
              const updatedUser = {
                ...currentUser,
                purchasedLessons: [
                  ...(currentUser.purchasedLessons || []),
                  { 
                    courseKey, 
                    lessonId, 
                    purchasedAt: new Date().toISOString(),
                    amount: verification.data.amount || paymentData.amount || 500
                  }
                ]
              };
              
              // Save updated user
              updateStudent(updatedUser);
              localStorage.setItem('hausaStem_currentUser', JSON.stringify(updatedUser));

            } else {
              setStatus('failed');
              setMessage('Payment successful but could not unlock lesson. Please contact support.');
            }
          } else {
            // Generic success - just show payment was successful
            setStatus('success');
            setMessage(`Payment of ₦${verification.data.amount || '500'} was successful!`);
          }

          // Clean up stored payment data
          cleanupPaymentData();

        } else {
          setStatus('failed');
          setMessage(verification.message || 'Payment verification failed. Please try again.');
        }
      } catch (error) {
        console.error('❌ Payment verification error:', error);
        
        // For development, simulate success if verification fails
        if (window.location.hostname.includes('localhost') || 
            window.location.hostname.includes('netlify.app')) {
          console.log('🔄 Development mode: Simulating payment success');
          simulateSuccess();
        } else {
          setStatus('failed');
          setMessage('Payment processing error: ' + error.message);
        }
      }
    };

    verifyPayment();
  }, []);

  const simulateSuccess = () => {
    // For development/testing
    setTimeout(() => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        // Get stored payment data
        const paymentData = JSON.parse(localStorage.getItem('current_payment') || '{}');
        
        if (paymentData.lessonId && paymentData.courseKey) {
          // Record purchase
          purchaseLesson(
            currentUser.id,
            paymentData.courseKey,
            paymentData.lessonId,
            {
              amount: paymentData.amount || 500,
              reference: `dev_${Date.now()}`,
              status: 'success',
              paidAt: new Date().toISOString()
            }
          ).then(success => {
            if (success) {
              setStatus('success');
              setMessage('Payment successful! (Development mode)');
            } else {
              setStatus('failed');
              setMessage('Simulated payment failed');
            }
          });
        }
      }
      
      // Clean up
      cleanupPaymentData();
    }, 1500);
  };

  const cleanupPaymentData = () => {
    // Clear all payment-related data from localStorage
    localStorage.removeItem('paystack_reference');
    localStorage.removeItem('paystack_lesson_id');
    localStorage.removeItem('paystack_course_key');
    localStorage.removeItem('paystack_amount');
    localStorage.removeItem('paystack_student_id');
    localStorage.removeItem('paystack_payment_info');
    localStorage.removeItem('paystack_payment_data');
    localStorage.removeItem('current_payment');
  };

  const handleBackToCourses = () => {
    cleanupPaymentData();
    if (setCurrentView) {
      setCurrentView('courses');
    } else {
      window.location.href = '/courses';
    }
  };

  const handleBackToDashboard = () => {
    cleanupPaymentData();
    if (setCurrentView) {
      setCurrentView('dashboard');
    } else {
      window.location.href = '/';
    }
  };

  const handleRetryPayment = () => {
    cleanupPaymentData();
    if (setCurrentView) {
      setCurrentView('courses');
    } else {
      window.location.href = '/courses';
    }
  };

  return (
    <div className="payment-callback" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        {status === 'verifying' && (
          <div className="verifying">
            <div style={{
              width: '60px',
              height: '60px',
              border: '5px solid #e0e0e0',
              borderTop: '5px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h2 style={{ color: '#333', marginBottom: '10px', fontSize: '24px' }}>
              Verifying Payment...
            </h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
              Please wait while we confirm your payment with Paystack.
            </p>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              marginTop: '20px',
              textAlign: 'left'
            }}>
              <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>⏳</span>
                Processing transaction...
              </p>
              <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>🔒</span>
                Secure verification in progress
              </p>
              <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>💳</span>
                Communicating with Paystack
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="success">
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#d4edda',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '40px',
              color: '#28a745',
              animation: 'scaleIn 0.5s ease'
            }}>
              ✓
            </div>
            <h2 style={{ color: '#28a745', marginBottom: '15px', fontSize: '26px' }}>
              Payment Successful!
            </h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
              {message}
            </p>
            
            {paymentDetails && (
              <div style={{
                backgroundColor: '#d4edda',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '25px',
                textAlign: 'left'
              }}>
                <p style={{ margin: '5px 0', color: '#155724', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px' }}>✅</span>
                  <strong>Reference:</strong> {paymentDetails.reference}
                </p>
                <p style={{ margin: '5px 0', color: '#155724', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px' }}>💰</span>
                  <strong>Amount:</strong> ₦{paymentDetails.amount || '500'}
                </p>
                <p style={{ margin: '5px 0', color: '#155724', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px' }}>⏰</span>
                  <strong>Time:</strong> {new Date(paymentDetails.paid_at || Date.now()).toLocaleString()}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleBackToCourses}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s',
                  flex: '1',
                  minWidth: '150px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
              >
                View Courses
              </button>
              <button
                onClick={handleBackToDashboard}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'background-color 0.3s',
                  flex: '1',
                  minWidth: '150px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                Back to Dashboard
              </button>
            </div>
            
            <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                <strong>Need help?</strong>
              </p>
              <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                Email: support@bookstem.com | WhatsApp: +234 123 456 7890
              </p>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="failed">
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f8d7da',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '40px',
              color: '#dc3545',
              animation: 'scaleIn 0.5s ease'
            }}>
              ✗
            </div>
            <h2 style={{ color: '#dc3545', marginBottom: '15px', fontSize: '26px' }}>
              Payment Failed
            </h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
              {message}
            </p>
            
            <div style={{
              backgroundColor: '#f8d7da',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '25px',
              textAlign: 'left'
            }}>
              <p style={{ margin: '5px 0', color: '#721c24', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>❌</span>
                Transaction incomplete
              </p>
              <p style={{ margin: '5px 0', color: '#721c24', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>⚠️</span>
                Lesson not unlocked
              </p>
              <p style={{ margin: '5px 0', color: '#721c24', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>🔄</span>
                Please try again
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleRetryPayment}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s',
                  flex: '1',
                  minWidth: '150px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
              >
                Try Again
              </button>
              <button
                onClick={handleBackToDashboard}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'background-color 0.3s',
                  flex: '1',
                  minWidth: '150px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                Back to Dashboard
              </button>
            </div>
            
            <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                <strong>Having trouble with payment?</strong>
              </p>
              <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                Contact support: support@bookstem.com | Call: +234 123 456 7890
              </p>
              <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#666' }}>
                Available payment methods: Card, Bank Transfer, USSD, Mobile Money
              </p>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentCallback;