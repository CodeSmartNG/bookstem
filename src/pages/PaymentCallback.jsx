import React, { useEffect, useState } from 'react';
import { paymentService } from '../utils/paymentService';
import { getCurrentUser, purchaseLesson } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

const PaymentCallback = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from URL
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference') || 
                         localStorage.getItem('paystack_reference');
        
        if (!reference) {
          throw new Error('No payment reference found');
        }

        // Verify payment with Paystack
        const verification = await paymentService.verifyPaystackPayment(reference);

        if (verification.status) {
          // Payment successful
          const lessonId = localStorage.getItem('paystack_lesson_id');
          const courseKey = localStorage.getItem('paystack_course_key');
          const currentUser = getCurrentUser();

          if (lessonId && courseKey && currentUser) {
            // Record purchase
            await purchaseLesson(
              currentUser.id, 
              courseKey, 
              lessonId,
              verification.data.amount
            );

            setStatus('success');
            setMessage('Payment successful! Lesson unlocked.');
            
            // Clear stored data
            localStorage.removeItem('paystack_reference');
            localStorage.removeItem('paystack_lesson_id');
            localStorage.removeItem('paystack_course_key');

            // Redirect to lesson after 3 seconds
            setTimeout(() => {
              navigate('/courses');
            }, 3000);
          }
        } else {
          setStatus('failed');
          setMessage(verification.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage(error.message || 'Payment processing failed');
      }
    };

    verifyPayment();
  }, [navigate]);

  return (
    <div className="payment-callback">
      {status === 'verifying' && (
        <div className="verifying">
          <div className="spinner"></div>
          <h2>Verifying Payment...</h2>
          <p>Please wait while we confirm your payment.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="success">
          <div className="success-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p>{message}</p>
          <p>Redirecting to your course...</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="failed">
          <div className="failed-icon">❌</div>
          <h2>Payment Failed</h2>
          <p>{message}</p>
          <button onClick={() => navigate('/courses')}>
            Back to Courses
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;