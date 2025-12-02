import React, { useEffect, useState } from 'react';
import { getCurrentUser, purchaseLesson, getCourses } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

const PaymentCallback = ({ setCurrentView }) => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from URL
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference') || urlParams.get('trxref');
        
        console.log('Payment callback received:', { reference, urlParams: Object.fromEntries(urlParams) });

        // For demo purposes - simulate payment verification
        setTimeout(async () => {
          try {
            if (reference || Math.random() > 0.2) { // 80% success rate for demo
              // Simulate successful payment
              const currentUser = getCurrentUser();
              
              // Get lesson from localStorage
              const lessonId = localStorage.getItem('paystack_lesson_id');
              const courseKey = localStorage.getItem('paystack_course_key');
              const amount = localStorage.getItem('paystack_amount');
              
              console.log('Payment data:', { lessonId, courseKey, amount, currentUser });

              if (lessonId && courseKey && currentUser) {
                // Record purchase
                const success = await purchaseLesson(
                  currentUser.id, 
                  courseKey, 
                  lessonId,
                  {
                    amount: amount || 500,
                    reference: reference || `demo_${Date.now()}`,
                    status: 'success'
                  }
                );

                if (success) {
                  setStatus('success');
                  setMessage(`Payment successful! You have unlocked the lesson. Amount: ₦${amount || '500'}`);
                  
                  // Get course details for better message
                  const courses = getCourses();
                  const course = courses[courseKey];
                  const lesson = course?.lessons?.find(l => l.id === lessonId);
                  
                  if (lesson) {
                    setMessage(`Payment successful! You now have access to "${lesson.title}"`);
                  }

                  // Clear stored data
                  localStorage.removeItem('paystack_reference');
                  localStorage.removeItem('paystack_lesson_id');
                  localStorage.removeItem('paystack_course_key');
                  localStorage.removeItem('paystack_amount');
                  localStorage.removeItem('paystack_student_id');
                } else {
                  setStatus('failed');
                  setMessage('Payment successful but could not unlock lesson. Please contact support.');
                }
              } else {
                setStatus('failed');
                setMessage('Payment information missing. Please contact support.');
              }
            } else {
              setStatus('failed');
              setMessage('Payment verification failed. Please try again or contact support.');
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            setStatus('failed');
            setMessage('Error processing payment: ' + error.message);
          }
        }, 1500); // Simulate network delay

      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage('Payment processing failed: ' + error.message);
      }
    };

    verifyPayment();
  }, []);

  const handleBackToCourses = () => {
    if (setCurrentView) {
      setCurrentView('courses');
    } else {
      window.location.href = '/courses';
    }
  };

  const handleBackToDashboard = () => {
    if (setCurrentView) {
      setCurrentView('dashboard');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="payment-callback" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
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
            <h2 style={{ color: '#333', marginBottom: '10px' }}>Verifying Payment...</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Please wait while we confirm your payment.
            </p>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              marginTop: '20px'
            }}>
              <p style={{ margin: '5px 0' }}>⏳ Processing your transaction...</p>
              <p style={{ margin: '5px 0' }}>🔒 Secure payment verification</p>
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
              color: '#28a745'
            }}>
              ✓
            </div>
            <h2 style={{ color: '#28a745', marginBottom: '15px' }}>Payment Successful!</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
              {message}
            </p>
            <div style={{
              backgroundColor: '#d4edda',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '25px'
            }}>
              <p style={{ margin: '5px 0', color: '#155724' }}>✅ Transaction completed</p>
              <p style={{ margin: '5px 0', color: '#155724' }}>✅ Lesson unlocked</p>
              <p style={{ margin: '5px 0', color: '#155724' }}>✅ Access granted</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
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
                  fontWeight: '500'
                }}
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
                  fontSize: '16px'
                }}
              >
                Back to Dashboard
              </button>
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
              color: '#dc3545'
            }}>
              ✗
            </div>
            <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>Payment Failed</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
              {message}
            </p>
            <div style={{
              backgroundColor: '#f8d7da',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '25px'
            }}>
              <p style={{ margin: '5px 0', color: '#721c24' }}>❌ Transaction incomplete</p>
              <p style={{ margin: '5px 0', color: '#721c24' }}>❌ Lesson not unlocked</p>
              <p style={{ margin: '5px 0', color: '#721c24' }}>⚠️ Please try again</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleBackToCourses}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
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
                  fontSize: '16px'
                }}
              >
                Back to Dashboard
              </button>
            </div>
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              <p>Need help? Contact support@bookstem.com</p>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentCallback;