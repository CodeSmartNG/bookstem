import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import './styles/payments.css';

// Import components
import StudentProfile from './components/StudentProfile';
import CourseCatalog from './components/CourseCatalog';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TeacherRegisterForm from './components/TeacherRegisterForm';
import EmailConfirmation from './components/EmailConfirmation';
import DiscussionForum from './components/DiscussionForum';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminCourseManagement from './components/AdminCourseManagement';
import About from './components/About';
import FAQs from './components/FAQs';
import Contact from './components/Contact';
import Blog from './components/Blog';
import Resources from './components/Resources';
import Careers from './components/Careers';
import Support from './components/Support';
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCallback from "./pages/PaymentCallback";

// Import storage utilities
import { 
  initializeStorage, 
  getStudents, 
  getCurrentUser, 
  setCurrentUser, 
  updateStudent, 
  addStudent,
  authenticateUser,
  logoutUser,
  registerTeacher,
  getUsers,
  registerUser,
  confirmUserEmail,
  resendEmailConfirmation,
  canAccessLesson,
  purchaseLesson,
  getTeacherWhatsAppUrl,
  getCourses,
  getLessons
} from './utils/storage';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUserState] = useState(null);
  const [students, setStudentsState] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [message, setMessage] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [confirmationToken, setConfirmationToken] = useState('');
  const [showConfirmationInfo, setShowConfirmationInfo] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  // Refs for timer management
  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  // Auto-logout handler
  const handleAutoLogout = useCallback(() => {
    setMessage('You have been automatically logged out due to inactivity.');
    handleLogout();
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Only set timers if user is logged in
    if (currentUser) {
      // Show warning after 55 minutes (5 minutes before logout)
      warningTimerRef.current = setTimeout(() => {
        setShowInactivityWarning(true);
      }, 55 * 60 * 1000); // 55 minutes

      // Auto logout after 60 minutes
      logoutTimerRef.current = setTimeout(() => {
        handleAutoLogout();
      }, 60 * 60 * 1000); // 60 minutes
    }
  }, [currentUser, handleAutoLogout]);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    if (currentUser) {
      resetInactivityTimer();
      if (showInactivityWarning) {
        setShowInactivityWarning(false);
      }
    }
  }, [currentUser, resetInactivityTimer, showInactivityWarning]);

  // Initialize storage and load data
  useEffect(() => {
    const initApp = () => {
      try {
        console.log('🔄 Initializing storage...');
        initializeStorage();

        // Load all data from localStorage
        const loadedStudents = getStudents();
        const loadedCurrentUser = getCurrentUser();

        console.log('Loaded students:', loadedStudents);
        console.log('Loaded current user:', loadedCurrentUser);

        setStudentsState(loadedStudents);

        if (loadedCurrentUser) {
          setCurrentUserState(loadedCurrentUser);
          // Redirect based on user role
          if (loadedCurrentUser.role === 'admin') {
            setCurrentView('admin');
          } else if (loadedCurrentUser.role === 'teacher') {
            setCurrentView('teacher');
          } else {
            setCurrentView('dashboard');
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsInitialized(true);
      }
    };

    initApp();
  }, []);

  // Set up activity listeners when user is logged in
  useEffect(() => {
    if (currentUser) {
      // Add event listeners for user activity
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity);
      });

      // Start the inactivity timer
      resetInactivityTimer();

      // Cleanup function
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity);
        });
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
        }
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current);
        }
      };
    }
  }, [currentUser, handleUserActivity, resetInactivityTimer]);

  // Check for confirmation token in URL (for email confirmation links)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      handleEmailConfirmation(token);
    }

    // Check for Paystack callback
    const reference = urlParams.get('reference');
    const trxref = urlParams.get('trxref');
    if (reference || trxref) {
      console.log('🔗 Paystack callback detected:', { reference, trxref });
      setCurrentView('payment-callback');
    }
  }, []);

  const handleLogin = (email, password) => {
    try {
      const user = authenticateUser(email, password);
      if (user) {
        // Remove password from user object for security
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUserState(userWithoutPassword);
        setCurrentUser(userWithoutPassword); // This should be the imported function

        // Reset inactivity timer on login
        resetInactivityTimer();

        // Redirect based on role
        if (user.role === 'admin') {
          setCurrentView('admin');
        } else if (user.role === 'teacher') {
          setCurrentView('teacher');
        } else {
          setCurrentView('dashboard');
        }
        setMessage('');
        return true;
      }
      setMessage('Invalid email or password');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.message);
      return false;
    }
  };

  const handleStudentRegister = async (name, email, password) => {
    try {
      // Check if email already exists in students
      const users = getUsers();
      const existingUser = Object.values(users).find(user => user.email === email);

      if (existingUser || students.find(s => s.email === email)) {
        setMessage('Email already exists. Please use a different email or login.');
        return false;
      }

      // Register user with email confirmation
      const result = await registerUser({
        name,
        email,
        password,
        role: 'student',
        level: 'Beginner',
        // Initialize student-specific fields
        completedLessons: [],
        progress: {},
        purchasedLessons: []
      });

      // Store pending user data and token
      setPendingUser(result.user);
      setConfirmationToken(result.confirmationToken);
      setShowConfirmationInfo(true);
      setCurrentView('email-confirmation');
      setMessage(`Confirmation email sent to ${email}. Please check your inbox.`);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  const handleTeacherRegister = async (teacherData) => {
    try {
      // Check if email already exists
      const users = getUsers();
      const existingUser = Object.values(users).find(user => user.email === teacherData.email);

      if (existingUser) {
        setMessage('Email already exists. Please use a different email or login.');
        return false;
      }

      // Register teacher with email confirmation
      const result = await registerUser({
        ...teacherData,
        role: 'teacher',
        // Initialize teacher-specific fields
        isApproved: false,
        earnings: 0,
        courses: [],
        whatsappNumber: teacherData.whatsappNumber || ''
      });

      // Store pending user data and token
      setPendingUser(result.user);
      setConfirmationToken(result.confirmationToken);
      setShowConfirmationInfo(true);
      setCurrentView('email-confirmation');
      setMessage(`Confirmation email sent to ${teacherData.email}. Please check your inbox.`);
      return true;
    } catch (error) {
      console.error('Teacher registration error:', error);
      setMessage(error.message || 'Teacher registration failed. Please try again.');
      return false;
    }
  };

  const handleEmailConfirmation = async (token) => {
    try {
      const user = await confirmUserEmail(token);

      setMessage('Email confirmed successfully! You can now log in.');
      setCurrentView('login');
      setPendingUser(null);
      setConfirmationToken('');
      setShowConfirmationInfo(false);

      // Clear token from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      return true;
    } catch (error) {
      console.error('Email confirmation error:', error);
      setMessage(error.message || 'Email confirmation failed. Please try again.');
      return false;
    }
  };

  const handleResendConfirmation = async () => {
    if (pendingUser) {
      try {
        await resendEmailConfirmation(pendingUser.email);
        setMessage('Confirmation email resent successfully! Please check your inbox.');
      } catch (error) {
        console.error('Resend confirmation error:', error);
        setMessage(error.message || 'Failed to resend confirmation email. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    // Clear all timers
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    logoutUser();
    setCurrentUserState(null);
    setCurrentUser(null); // This should be the imported function
    setCurrentView('login');
    setMessage('');
    setShowConfirmationInfo(false);
    setShowInactivityWarning(false);
  };

  // Enhanced student update
  const updateStudentData = (updatedStudent) => {
    try {
      // Update in localStorage
      updateStudent(updatedStudent);

      // Update in state
      const { password, ...studentWithoutPassword } = updatedStudent;
      setCurrentUserState(studentWithoutPassword);
      setCurrentUser(studentWithoutPassword); // This should be the imported function

      // Update in students list
      setStudentsState(prev => 
        prev.map(s => s.id === updatedStudent.id ? updatedStudent : s)
      );
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  // Enhanced user update
  const updateCurrentUser = (updatedUser) => {
    try {
      // Update user in the users collection
      const users = getUsers();
      if (users[updatedUser.id]) {
        users[updatedUser.id] = { ...users[updatedUser.id], ...updatedUser };
        localStorage.setItem('hausaStem_users', JSON.stringify(users));
      }

      // Update current user state
      const { password: _, ...userWithoutPassword } = updatedUser;
      setCurrentUserState(userWithoutPassword);
      setCurrentUser(userWithoutPassword); // This should be the imported function
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Handle lesson purchase from CourseCatalog
  const handleLessonPurchase = async (courseKey, lessonId) => {
    try {
      if (!currentUser) {
        setMessage('Please log in to purchase lessons');
        return false;
      }

      // Get lesson details
      const courses = getCourses();
      const course = courses[courseKey];
      const lesson = course?.lessons?.find(l => l.id === lessonId);
      
      if (!lesson) {
        setMessage('Lesson not found');
        return false;
      }

      // For demo, use simulated purchase
      const success = await purchaseLesson(currentUser.id, courseKey, lessonId);
      if (success) {
        // Refresh user data to reflect the purchase
        const updatedUser = getCurrentUser();
        if (updatedUser) {
          setCurrentUserState(updatedUser);
          setCurrentUser(updatedUser); // This should be the imported function
        }
        setMessage('✅ Lesson purchased successfully!');
        
        // Redirect to payment success page
        setCurrentView('payment-success');
        return true;
      } else {
        setMessage('❌ Failed to purchase lesson. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error purchasing lesson:', error);
      setMessage('❌ Error processing payment: ' + error.message);
      return false;
    }
  };

  // Handle Paystack payment
  const handlePaystackPayment = async (courseKey, lessonId, email, name) => {
    try {
      if (!currentUser) {
        setMessage('Please log in to make a payment');
        return false;
      }

      // Get lesson details
      const courses = getCourses();
      const course = courses[courseKey];
      const lesson = course?.lessons?.find(l => l.id === lessonId);
      
      if (!lesson) {
        setMessage('Lesson not found');
        return false;
      }

      // Store payment info for callback
      localStorage.setItem('paystack_lesson_id', lessonId);
      localStorage.setItem('paystack_course_key', courseKey);
      localStorage.setItem('paystack_amount', lesson.price);
      localStorage.setItem('paystack_student_id', currentUser.id);

      // In a real implementation, this would call Paystack API
      // For now, simulate payment and redirect to callback
      const reference = `paystack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('paystack_reference', reference);

      // Simulate redirect to Paystack (in real app, this would be Paystack URL)
      setTimeout(() => {
        // Simulate successful payment
        const success = Math.random() > 0.3; // 70% success rate
        
        if (success) {
          // Update URL with reference (simulating Paystack callback)
          window.history.pushState({}, '', `/?view=payment-callback&reference=${reference}&trxref=${reference}`);
          setCurrentView('payment-callback');
        } else {
          setMessage('❌ Payment failed. Please try again.');
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('Paystack payment error:', error);
      setMessage('❌ Error processing payment: ' + error.message);
      return false;
    }
  };

  // Check if user can access lesson
  const checkLessonAccess = (courseKey, lessonId) => {
    if (!currentUser) return false;
    return canAccessLesson(currentUser.id, courseKey, lessonId);
  };

  // Get teacher WhatsApp URL
  const getTeacherContactUrl = (teacherId) => {
    return getTeacherWhatsAppUrl(teacherId);
  };

  // Inactivity Warning Modal Component
  const InactivityWarning = () => {
    if (!showInactivityWarning) return null;

    return (
      <div className="inactivity-warning-overlay">
        <div className="inactivity-warning-modal">
          <div className="warning-header">
            <h3>Session Timeout Warning</h3>
          </div>
          <div className="warning-body">
            <p>Your session will expire in 5 minutes due to inactivity.</p>
            <p>Would you like to continue your session?</p>
          </div>
          <div className="warning-actions">
            <button 
              className="continue-btn"
              onClick={() => {
                resetInactivityTimer();
                setShowInactivityWarning(false);
              }}
            >
              Continue Session
            </button>
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              Log Out Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Demo confirmation info display
  const ConfirmationInfoDisplay = () => showConfirmationInfo && confirmationToken ? (
    <div className="confirmation-demo-display">
      <h3>📧 Demo Email Confirmation</h3>
      <p>Since this is a demo, here's your confirmation token:</p>
      <div className="confirmation-token">{confirmationToken}</div>
      <p>You can:</p>
      <ul>
        <li>Click the confirmation button below to simulate email confirmation</li>
        <li>Or manually navigate to: {window.location.origin}/confirm-email?token={confirmationToken}</li>
      </ul>
      <div className="demo-buttons">
        <button 
          onClick={() => handleEmailConfirmation(confirmationToken)}
          className="confirm-email-btn"
        >
          Confirm Email Now
        </button>
        <button 
          onClick={() => setShowConfirmationInfo(false)}
          className="close-info-btn"
        >
          Close
        </button>
      </div>
    </div>
  ) : null;

  // Message Display Component
  const MessageDisplay = () => {
    if (!message) return null;
    
    let messageType = 'info';
    if (message.includes('success') || message.includes('Success')) messageType = 'success';
    if (message.includes('error') || message.includes('Error') || message.includes('invalid') || message.includes('Invalid')) messageType = 'error';
    if (message.includes('email') || message.includes('Email')) messageType = 'info';

    return (
      <div className={`message ${messageType}`}>
        {message}
      </div>
    );
  };

  // Render view based on current view and user role
  const renderView = () => {
    console.log('🎯 renderView called with currentView:', currentView);
    console.log('🎯 currentUser:', currentUser);

    if (!currentUser) {
      console.log('👤 No current user, showing login/register views');
      switch(currentView) {
        case 'register':
          return (
            <>
              <MessageDisplay />
              <ConfirmationInfoDisplay />
              <RegisterForm 
                onRegister={handleStudentRegister} 
                onSwitchToLogin={() => {
                  setMessage('');
                  setCurrentView('login');
                }} 
              />
            </>
          );
        case 'teacher-register':
          return (
            <>
              <MessageDisplay />
              <ConfirmationInfoDisplay />
              <TeacherRegisterForm 
                onRegister={handleTeacherRegister} 
                onSwitchToLogin={() => {
                  setMessage('');
                  setCurrentView('login');
                }}
                onSwitchToStudentRegister={() => {
                  setMessage('');
                  setCurrentView('register');
                }}
              />
            </>
          );
        case 'email-confirmation':
          return (
            <>
              <MessageDisplay />
              <ConfirmationInfoDisplay />
              <EmailConfirmation 
                email={pendingUser?.email}
                onConfirm={handleEmailConfirmation}
                onResend={handleResendConfirmation}
                onCancel={() => {
                  setMessage('');
                  setPendingUser(null);
                  setConfirmationToken('');
                  setShowConfirmationInfo(false);
                  setCurrentView('login');
                }}
              />
            </>
          );
        case 'payment-success':
          return <PaymentSuccess setCurrentView={setCurrentView} />;
        case 'payment-callback':
          return <PaymentCallback setCurrentView={setCurrentView} />;
        case 'login':
        default:
          return (
            <div className="login-container">
              <MessageDisplay />
              <ConfirmationInfoDisplay />
              <LoginForm 
                onLogin={handleLogin} 
                onSwitchToRegister={() => {
                  setMessage('');
                  setCurrentView('register');
                }} 
                onSwitchToTeacherRegister={() => {
                  setMessage('');
                  setCurrentView('teacher-register');
                }}
              />
            </div>
          );
      }
    }

    // User is logged in
    const isAdmin = currentUser?.role === 'admin';
    const isTeacher = currentUser?.role === 'teacher';
    const isStudent = currentUser?.role === 'student';

    // Handle general navigation views (accessible to all logged-in users)
    switch(currentView) {
      case 'about':
        return <About />;
      case 'faqs':
        return <FAQs />;
      case 'contact':
        return <Contact />;
      case 'blog':
        return <Blog />;
      case 'resources':
        return <Resources />;
      case 'careers':
        return (
          <Careers 
            setCurrentView={setCurrentView} 
            setMessage={setMessage}
            onTeacherRegister={handleTeacherRegister}
            currentUser={currentUser}
          />
        );
      case 'support':
        return <Support />;
      case 'payment-success':
        return <PaymentSuccess setCurrentView={setCurrentView} />;
      case 'payment-callback':
        return <PaymentCallback setCurrentView={setCurrentView} />;
      case 'admin-courses':
        if (isAdmin) {
          return <AdminCourseManagement currentUser={currentUser} />;
        } else {
          return (
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>You don't have permission to access course management.</p>
              <button 
                className="back-button"
                onClick={() => setCurrentView(isAdmin ? 'admin' : isTeacher ? 'teacher' : 'dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          );
        }
      default:
        break;
    }

    // Handle admin dashboard
    if (currentView === 'admin') {
      if (isAdmin) {
        return <AdminDashboard currentUser={currentUser} setCurrentView={setCurrentView} />;
      } else {
        return (
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You don't have permission to access the admin dashboard.</p>
            <button 
              className="back-button"
              onClick={() => setCurrentView(isTeacher ? 'teacher' : 'dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        );
      }
    }

    // Handle teacher dashboard
    if (currentView === 'teacher') {
      if (isTeacher) {
        return <TeacherDashboard currentUser={currentUser} setCurrentUser={updateCurrentUser} />;
      } else {
        return (
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You don't have permission to access the teacher dashboard.</p>
            <button 
              className="back-button"
              onClick={() => setCurrentView(isAdmin ? 'admin' : 'dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        );
      }
    }

    // Student-specific views
    if (isStudent) {
      switch(currentView) {
        case 'profile':
          return <StudentProfile student={currentUser} setStudent={updateStudentData} />;
        case 'courses':
          return (
            <CourseCatalog 
              student={currentUser} 
              setStudent={updateStudentData}
              onLessonPurchase={handleLessonPurchase}
              onCheckLessonAccess={checkLessonAccess}
              onGetTeacherContact={getTeacherContactUrl}
              onPaystackPayment={handlePaystackPayment}
            />
          );
        case 'discussion':
          return <DiscussionForum currentUser={currentUser} />;
        case 'payment-success':
          return <PaymentSuccess setCurrentView={setCurrentView} />;
        case 'payment-callback':
          return <PaymentCallback setCurrentView={setCurrentView} />;
        case 'dashboard':
        default:
          return (
            <>
              <MessageDisplay />
              <Dashboard student={currentUser} setStudent={updateStudentData} />
            </>
          );
      }
    }

    // Teacher-specific views
    if (isTeacher) {
      switch(currentView) {
        case 'profile':
          return (
            <div className="teacher-profile">
              <h2>Teacher Profile</h2>
              <p>Name: {currentUser.name}</p>
              <p>Email: {currentUser.email}</p>
              <p>Specialization: {currentUser.specialization}</p>
              <p>WhatsApp: {currentUser.whatsappNumber || 'Not provided'}</p>
              <p>Status: {currentUser.isApproved ? 'Approved' : 'Pending Approval'}</p>
              <p>Earnings: ₦{currentUser.earnings || 0}</p>
              <button 
                className="back-button"
                onClick={() => setCurrentView('teacher')}
              >
                Back to Teacher Dashboard
              </button>
            </div>
          );
        case 'payment-success':
          return <PaymentSuccess setCurrentView={setCurrentView} />;
        case 'payment-callback':
          return <PaymentCallback setCurrentView={setCurrentView} />;
        case 'dashboard':
        default:
          return <TeacherDashboard currentUser={currentUser} setCurrentUser={updateCurrentUser} />;
      }
    }

    // Admin-specific views
    if (isAdmin) {
      switch(currentView) {
        case 'payment-success':
          return <PaymentSuccess setCurrentView={setCurrentView} />;
        case 'payment-callback':
          return <PaymentCallback setCurrentView={setCurrentView} />;
        case 'dashboard':
        default:
          return <AdminDashboard currentUser={currentUser} setCurrentView={setCurrentView} />;
      }
    }

    // Default fallback for any unexpected state
    console.error('❌ No matching view found for:', currentView, 'with user:', currentUser);
    return (
      <div className="error-view">
        <h2>Something went wrong</h2>
        <p>Unable to determine the appropriate view for your account.</p>
        <button 
          className="back-button"
          onClick={handleLogout}
        >
          Return to Login
        </button>
      </div>
    );
  };

  if (!isInitialized) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading STEM Platform...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Inactivity Warning Modal */}
      <InactivityWarning />

      {currentUser && (
        <Navigation 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          currentUser={currentUser}
          onLogout={handleLogout}
          isAdmin={currentUser.role === 'admin'}
          isTeacher={currentUser.role === 'teacher'}
          isStudent={currentUser.role === 'student'}
        />
      )}
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;