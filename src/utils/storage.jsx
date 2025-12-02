// Local Storage utilities for STEM Platform

// Keys for localStorage
const STUDENT_KEY = 'hausaStem_students';
const CURRENT_USER_KEY = 'hausaStem_currentUser';
const COURSES_KEY = 'hausaStem_courses';
const USERS_KEY = 'hausaStem_users';
const EMAIL_CONFIRMATIONS_KEY = 'hausaStem_email_confirmations';
const SESSION_TRACKING_KEY = 'hausaStem_session_tracking';
const TEACHER_WALLETS_KEY = 'hausaStem_teacher_wallets';
const PAYMENT_TRANSACTIONS_KEY = 'hausaStem_payment_transactions';

// ==================== INITIALIZATION ====================
export const initializeStorage = () => {
  console.log('🔄 Initializing Storage...');

  try {
    const existingStudents = getStudents();
    const existingCourses = getCourses();
    const existingUsers = getUsers();

    console.log('Existing users:', Object.keys(existingUsers).length);
    console.log('Existing students:', existingStudents.length);
    console.log('Existing courses:', Object.keys(existingCourses).length);

    // Ensure admin user exists
    let users = getUsers();
    let needsSave = false;

    // Check and create admin if missing
    if (!users['admin1']) {
      console.log('🛠 Creating admin user...');
      users['admin1'] = {
        id: 'admin1',
        name: "Kabir Alkasim",
        email: "codesmartng1@gmail.com",
        password: "Kb1217@#$%&",
        role: "admin",
        isEmailConfirmed: true,
        joinedDate: new Date().toISOString()
      };
      needsSave = true;
    }

    // Check and create teacher if missing
    if (!users['teacher1']) {
      console.log('🛠 Creating teacher user...');
      users['teacher1'] = {
        id: 'teacher1',
        name: "Kabir Teacher",
        email: "kabir@teacher.com",
        password: "121712",
        role: "teacher",
        specialization: "Computer Science",
        bio: "Experienced teacher in web development and programming",
        joinedDate: new Date().toISOString(),
        courses: ['webDevelopment', 'python', 'mathematics'],
        isApproved: true,
        isEmailConfirmed: true,
        approvedDate: new Date().toISOString(),
        whatsappNumber: '2348012345678'
      };
      needsSave = true;
    }

    // Check and create student if missing
    if (!users['student1']) {
      console.log('🛠 Creating student user...');
      users['student1'] = {
        id: 'student1',
        name: "Ahmad Musa",
        email: "student@example.com",
        password: "password123",
        role: "student",
        level: "Beginner",
        progress: {},
        completedLessons: [],
        purchasedLessons: [], // Initialize empty array
        points: 0,
        badges: [],
        enrolledCourses: [],
        isEmailConfirmed: true,
        joinedDate: new Date().toISOString()
      };
      needsSave = true;
    }

    if (needsSave) {
      console.log('💾 Saving updated users...');
      saveUsers(users);
    }

    // Initialize students array if empty
    if (existingStudents.length === 0) {
      console.log('🛠 Creating default students...');
      const defaultStudents = [
        {
          id: 1,
          userId: 'student1',
          name: "Ahmad Musa",
          email: "student@example.com",
          password: "password123",
          role: "student",
          level: "Beginner",
          progress: {},
          completedLessons: [],
          purchasedLessons: [], // Initialize empty array
          points: 0,
          badges: [],
          enrolledCourses: [],
          isEmailConfirmed: true,
          joinedDate: new Date().toISOString()
        }
      ];
      saveStudents(defaultStudents);
    }

    // Initialize courses if empty
    if (Object.keys(existingCourses).length === 0) {
      console.log('🛠 Creating default courses...');
      const defaultCourses = {
        webDevelopment: {
          title: "Web Development",
          description: "Learn how to build websites using HTML, CSS and JavaScript",
          thumbnail: "🌐",
          teacherId: "teacher1",
          teacherName: "Kabir Teacher",
          isPublished: true,
          approvedDate: new Date().toISOString(),
          lessons: [
            {
              id: 1,
              title: "Introduction to HTML",
              content: "HTML is the first part of a website. It provides the structure of web pages.",
              duration: "30 minutes",
              completed: false,
              isLocked: false,
              isFree: true,
              price: 0,
              multimedia: [
                {
                  id: 1,
                  type: "video",
                  url: "https://www.youtube.com/embed/dD2EISBDjWM",
                  title: "Video: How to use HTML",
                  description: "This video will teach you everything you need to know about HTML"
                }
              ],
              quiz: {
                title: "HTML Questions",
                passingScore: 70,
                questions: [
                  {
                    id: 1,
                    question: "What does HTML stand for?",
                    type: "text",
                    options: [
                      "Hyper Text Markup Language",
                      "High Tech Modern Language",
                      "Hyper Transfer Markup Language",
                      "Home Tool Markup Language"
                    ],
                    correctAnswer: 0
                  }
                ]
              }
            }
          ]
        },
        python: {
          title: "Python Programming",
          description: "Learn how to program software with the Python language",
          thumbnail: "🐍",
          teacherId: "teacher1",
          teacherName: "Kabir Teacher",
          isPublished: true,
          approvedDate: new Date().toISOString(),
          lessons: [
            {
              id: 1,
              title: "Python Basics",
              content: "Start learning about the basic components in Python: variables, data types, and basic operations.",
              duration: "40 minutes",
              completed: false,
              isLocked: false,
              isFree: false,
              price: 1500,
              multimedia: [],
              quiz: {
                title: "Python Questions",
                passingScore: 70,
                questions: [
                  {
                    id: 1,
                    question: "How do you create a variable in Python?",
                    type: "text",
                    options: [
                      "x = 5",
                      "variable x = 5",
                      "let x = 5",
                      "var x = 5"
                    ],
                    correctAnswer: 0
                  }
                ]
              }
            }
          ]
        },
        mathematics: {
          title: "Mathematics",
          description: "Learn mathematics from basics to advanced levels",
          thumbnail: "📊",
          teacherId: "teacher1",
          teacherName: "Kabir Teacher",
          isPublished: true,
          approvedDate: new Date().toISOString(),
          lessons: [
            {
              id: 1,
              title: "Algebra Basics",
              content: "Start learning about algebra and how to use it to solve problems.",
              duration: "35 minutes",
              completed: false,
              isLocked: false,
              isFree: true,
              price: 0,
              multimedia: [],
              quiz: {
                title: "Algebra Questions",
                passingScore: 70,
                questions: [
                  {
                    id: 1,
                    question: "What is x in the equation 2x + 5 = 15?",
                    type: "text",
                    options: ["5", "10", "15", "20"],
                    correctAnswer: 0
                  }
                ]
              }
            }
          ]
        }
      };
      saveCourses(defaultCourses);
    }

    // Initialize teacher wallets
    initializeTeacherWallets();

    console.log('✅ Storage initialization complete');
    return true;
  } catch (error) {
    console.error('❌ Storage initialization failed:', error);
    return false;
  }
};

// ==================== TEACHER WALLET FUNCTIONS ====================
export const initializeTeacherWallets = () => {
  try {
    const wallets = getTeacherWallets();
    const teachers = getAllTeachers();

    teachers.forEach(teacher => {
      if (!wallets[teacher.id]) {
        wallets[teacher.id] = {
          teacherId: teacher.id,
          teacherName: teacher.name,
          balance: 0,
          totalEarnings: 0,
          pendingWithdrawals: 0,
          transactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    });

    saveTeacherWallets(wallets);
    return true;
  } catch (error) {
    console.error('Error initializing teacher wallets:', error);
    return false;
  }
};

export const getTeacherWallets = () => {
  try {
    const wallets = localStorage.getItem(TEACHER_WALLETS_KEY);
    return wallets ? JSON.parse(wallets) : {};
  } catch (error) {
    console.error('Error loading teacher wallets:', error);
    return {};
  }
};

export const saveTeacherWallets = (wallets) => {
  try {
    localStorage.setItem(TEACHER_WALLETS_KEY, JSON.stringify(wallets));
  } catch (error) {
    console.error('Error saving teacher wallets:', error);
  }
};

export const getTeacherWallet = (teacherId) => {
  const wallets = getTeacherWallets();
  return wallets[teacherId] || {
    teacherId: teacherId,
    teacherName: '',
    balance: 0,
    totalEarnings: 0,
    pendingWithdrawals: 0,
    transactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const updateTeacherWallet = (teacherId, walletData) => {
  const wallets = getTeacherWallets();
  const currentWallet = getTeacherWallet(teacherId);

  wallets[teacherId] = {
    ...currentWallet,
    ...walletData,
    updatedAt: new Date().toISOString()
  };

  saveTeacherWallets(wallets);
  return wallets[teacherId];
};

export const addTeacherEarnings = (teacherId, amount, description, lessonDetails = {}) => {
  const wallet = getTeacherWallet(teacherId);

  const transaction = {
    id: `txn_${Date.now()}`,
    type: 'credit',
    amount: amount,
    description: description,
    lessonDetails: lessonDetails,
    date: new Date().toISOString(),
    status: 'completed'
  };

  const updatedWallet = {
    ...wallet,
    balance: wallet.balance + amount,
    totalEarnings: wallet.totalEarnings + amount,
    transactions: [transaction, ...wallet.transactions]
  };

  return updateTeacherWallet(teacherId, updatedWallet);
};

// ==================== PAYMENT TRANSACTION FUNCTIONS ====================
export const getPaymentTransactions = () => {
  try {
    const transactions = localStorage.getItem(PAYMENT_TRANSACTIONS_KEY);
    return transactions ? JSON.parse(transactions) : {};
  } catch (error) {
    console.error('Error loading payment transactions:', error);
    return {};
  }
};

export const savePaymentTransactions = (transactions) => {
  try {
    localStorage.setItem(PAYMENT_TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving payment transactions:', error);
  }
};

// ==================== LESSON PURCHASE FUNCTION ====================
export const purchaseLesson = async (studentId, courseKey, lessonId, paymentData = {}) => {
  try {
    console.log('🛒 Purchase attempt:', { studentId, courseKey, lessonId, paymentData });

    // Get student from users
    const users = getUsers();
    let user = Object.values(users).find(u => u.id === studentId);

    if (!user) {
      // Try to find by userId in students array
      const students = getStudents();
      const student = students.find(s => s.userId === studentId);
      if (student) {
        user = users[student.userId];
      }
    }

    if (!user) {
      console.error('User not found:', studentId);
      throw new Error('User not found');
    }

    // Get course to verify lesson exists
    const courses = getCourses();
    const course = courses[courseKey];
    if (!course) {
      throw new Error('Course not found');
    }

    const lesson = course.lessons?.find(l => l.id === lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Initialize purchased lessons array if it doesn't exist
    if (!user.purchasedLessons) {
      user.purchasedLessons = [];
    }

    const purchaseKey = `${courseKey}-${lessonId}`;

    // Check if already purchased
    if (user.purchasedLessons.includes(purchaseKey)) {
      console.log('✅ Lesson already purchased:', purchaseKey);
      return true;
    }

    // Add to purchased lessons
    user.purchasedLessons.push(purchaseKey);

    // Initialize purchase history if it doesn't exist
    if (!user.purchaseHistory) {
      user.purchaseHistory = [];
    }

    // Create purchase record
    const purchaseRecord = {
      id: `purchase_${Date.now()}`,
      courseKey: courseKey,
      lessonId: lessonId,
      amount: paymentData.amount || lesson.price || 500,
      date: paymentData.date || new Date().toISOString(),
      reference: paymentData.reference || `ref_${Date.now()}`,
      status: paymentData.status || 'completed',
      paymentMethod: paymentData.paymentMethod || 'paystack'
    };

    user.purchaseHistory.push(purchaseRecord);

    // Update user
    users[user.id] = user;
    saveUsers(users);

    // Also update student in students array for backward compatibility
    const students = getStudents();
    const studentIndex = students.findIndex(s => s.userId === user.id);
    if (studentIndex !== -1) {
      if (!students[studentIndex].purchasedLessons) {
        students[studentIndex].purchasedLessons = [];
      }
      if (!students[studentIndex].purchasedLessons.includes(purchaseKey)) {
        students[studentIndex].purchasedLessons.push(purchaseKey);
      }
      saveStudents(students);
    }

    // Process teacher payment (90% to teacher, 10% platform fee)
    if (course.teacherId && paymentData.amount) {
      try {
        const teacherEarnings = paymentData.amount * 0.9;
        addTeacherEarnings(
          course.teacherId,
          teacherEarnings,
          `Payment for lesson: ${lesson.title || 'Lesson'} in ${course.title || 'Course'}`,
          {
            courseKey: courseKey,
            lessonId: lessonId,
            studentId: studentId,
            studentName: user.name,
            amount: paymentData.amount,
            teacherEarnings: teacherEarnings,
            platformFee: paymentData.amount * 0.1,
            reference: paymentData.reference
          }
        );
        console.log('💰 Teacher payment processed');
      } catch (teacherError) {
        console.error('Teacher payment error (non-fatal):', teacherError);
      }
    }

    // Record payment transaction
    if (paymentData.amount) {
      const transaction = {
        id: `txn_${Date.now()}`,
        studentId: studentId,
        teacherId: course.teacherId || 'unknown',
        courseKey: courseKey,
        lessonId: lessonId,
        amount: paymentData.amount,
        status: 'completed',
        date: new Date().toISOString(),
        type: 'lesson_purchase',
        reference: paymentData.reference
      };

      const transactions = getPaymentTransactions();
      transactions[transaction.id] = transaction;
      savePaymentTransactions(transactions);
    }

    console.log(`✅ Purchase successful: Student ${studentId} purchased lesson ${lessonId}`);
    return true;
  } catch (error) {
    console.error('❌ Error purchasing lesson:', error);
    throw error;
  }
};

// ==================== LESSON ACCESS CONTROL ====================
export const hasStudentPurchasedLesson = (studentId, courseKey, lessonId) => {
  try {
    // Check in users first
    const users = getUsers();
    const user = Object.values(users).find(u => u.id === studentId);

    if (user && user.purchasedLessons) {
      const purchaseKey = `${courseKey}-${lessonId}`;
      return user.purchasedLessons.includes(purchaseKey);
    }

    // Check in students array for backward compatibility
    const students = getStudents();
    const student = students.find(s => s.id === studentId || s.userId === studentId);

    if (student && student.purchasedLessons) {
      const purchaseKey = `${courseKey}-${lessonId}`;
      return student.purchasedLessons.includes(purchaseKey);
    }

    return false;
  } catch (error) {
    console.error('Error checking lesson purchase:', error);
    return false;
  }
};

export const canAccessLesson = (studentId, courseKey, lessonId) => {
  try {
    const lesson = getLessonById(courseKey, lessonId);
    if (!lesson) return false;

    // If lesson is free, it's accessible
    if (lesson.isFree === true) {
      return true;
    }

    // If lesson is paid, check if student purchased it
    return hasStudentPurchasedLesson(studentId, courseKey, lessonId);
  } catch (error) {
    console.error('Error checking lesson access:', error);
    return false;
  }
};

// ==================== TEACHER WHATSAPP FUNCTIONS ====================
export const getTeacherWhatsAppUrl = (teacherId) => {
  const users = getUsers();
  const teacher = users[teacherId];

  if (!teacher || !teacher.whatsappNumber) {
    return null;
  }

  const whatsappNumber = teacher.whatsappNumber.replace(/\D/g, '');
  const message = `Hello ${teacher.name}! I found you on the STEM Learning Platform and would like to learn more about your courses.`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const updateTeacherProfileWithWhatsApp = (teacherId, profileData) => {
  const users = getUsers();

  if (!users[teacherId] || users[teacherId].role !== 'teacher') {
    throw new Error('Teacher not found');
  }

  users[teacherId] = {
    ...users[teacherId],
    ...profileData,
    updatedAt: new Date().toISOString()
  };

  saveUsers(users);
  return users[teacherId];
};

// ==================== PAYMENT PROCESSING ====================
export const processLessonPayment = (studentId, teacherId, courseKey, lessonId, amount) => {
  try {
    return purchaseLesson(studentId, courseKey, lessonId, {
      amount: amount,
      paymentMethod: 'direct',
      status: 'completed'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

export const getTeacherPaymentStats = (teacherId) => {
  const wallet = getTeacherWallet(teacherId);
  const transactions = getPaymentTransactions();

  const teacherTransactions = Object.values(transactions).filter(
    transaction => transaction.teacherId === teacherId && transaction.status === 'completed'
  );

  const monthlyEarnings = teacherTransactions
    .filter(txn => {
      const txnDate = new Date(txn.date);
      const currentMonth = new Date();
      return txnDate.getMonth() === currentMonth.getMonth() &&
        txnDate.getFullYear() === currentMonth.getFullYear();
    })
    .reduce((total, txn) => total + txn.amount * 0.9, 0);

  const totalSales = teacherTransactions.length;

  return {
    totalEarnings: wallet.totalEarnings,
    availableBalance: wallet.balance,
    pendingWithdrawals: wallet.pendingWithdrawals,
    monthlyEarnings: monthlyEarnings,
    totalSales: totalSales,
    transactionHistory: wallet.transactions.slice(0, 10)
  };
};

// ==================== SESSION TRACKING ====================
export const getSessionTracking = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_TRACKING_KEY);
    return sessionData ? JSON.parse(sessionData) : {
      lastActivity: null,
      sessionStart: null,
      autoLogoutEnabled: true,
      logoutTimeout: 60 * 60 * 1000,
      warningTimeout: 55 * 60 * 1000
    };
  } catch (error) {
    console.error('Error loading session tracking:', error);
    return {
      lastActivity: null,
      sessionStart: null,
      autoLogoutEnabled: true,
      logoutTimeout: 60 * 60 * 1000,
      warningTimeout: 55 * 60 * 1000
    };
  }
};

export const saveSessionTracking = (sessionData) => {
  try {
    localStorage.setItem(SESSION_TRACKING_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Error saving session tracking:', error);
  }
};

export const updateLastActivity = () => {
  const sessionData = getSessionTracking();
  sessionData.lastActivity = new Date().toISOString();

  if (!sessionData.sessionStart) {
    sessionData.sessionStart = new Date().toISOString();
  }

  saveSessionTracking(sessionData);
  return sessionData;
};

// ==================== EMAIL CONFIRMATION ====================
export const getEmailConfirmations = () => {
  try {
    const confirmations = localStorage.getItem(EMAIL_CONFIRMATIONS_KEY);
    return confirmations ? JSON.parse(confirmations) : {};
  } catch (error) {
    console.error('Error loading email confirmations:', error);
    return {};
  }
};

export const saveEmailConfirmations = (confirmations) => {
  try {
    localStorage.setItem(EMAIL_CONFIRMATIONS_KEY, JSON.stringify(confirmations));
  } catch (error) {
    console.error('Error saving email confirmations:', error);
  }
};

export const generateEmailConfirmationToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const createEmailConfirmation = (userId, email) => {
  const confirmations = getEmailConfirmations();
  const token = generateEmailConfirmationToken();

  const confirmation = {
    userId,
    email,
    token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isUsed: false
  };

  confirmations[token] = confirmation;
  saveEmailConfirmations(confirmations);

  console.log(`📧 Email confirmation created for user ${userId}`);
  return token;
};

export const verifyEmailConfirmation = (token) => {
  const confirmations = getEmailConfirmations();
  const confirmation = confirmations[token];

  if (!confirmation) {
    throw new Error('Invalid confirmation token');
  }

  if (confirmation.isUsed) {
    throw new Error('Confirmation token already used');
  }

  if (new Date(confirmation.expiresAt) < new Date()) {
    throw new Error('Confirmation token has expired');
  }

  confirmation.isUsed = true;
  confirmation.confirmedAt = new Date().toISOString();
  confirmations[token] = confirmation;
  saveEmailConfirmations(confirmations);

  return confirmation;
};

export const sendEmailConfirmation = (email, token) => {
  const confirmationLink = `${window.location.origin}/confirm-email?token=${token}`;

  console.log('📧 Email Confirmation Details:');
  console.log('To:', email);
  console.log('Confirmation Link:', confirmationLink);
  console.log('Token (for testing):', token);

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ Confirmation email sent successfully');
      resolve(true);
    }, 1000);
  });
};

// ==================== USER MANAGEMENT ====================
export const getUsers = () => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  } catch (error) {
    console.error('Error loading users:', error);
    return {};
  }
};

export const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

export const authenticateUser = (email, password) => {
  const users = getUsers();

  console.log('🔐 Authentication Attempt:', { email });

  const user = Object.values(users).find(
    user => user.email === email && user.password === password
  );

  console.log('Found User:', user);

  if (user) {
    if (user.role !== 'admin' && !user.isEmailConfirmed) {
      console.log('❌ Login blocked: Email not confirmed');
      throw new Error('Please confirm your email address before logging in.');
    }

    if (user.role === 'teacher' && !user.isApproved) {
      console.log('❌ Teacher login blocked: Account not approved');
      throw new Error('Your teacher account is pending admin approval.');
    }

    setCurrentUser(user);
    updateLastActivity();

    console.log('✅ Login Successful:', user.role);
    return user;
  }

  console.log('❌ Login Failed: No matching user found');
  return null;
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error loading current user:', error);
    return null;
  }
};

export const setCurrentUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      updateLastActivity();
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(SESSION_TRACKING_KEY);
};

// ==================== USER REGISTRATION ====================
export const registerUser = (userData) => {
  const users = getUsers();

  const existingUser = Object.values(users).find(
    user => user.email === userData.email
  );

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const userId = `${userData.role}_${Date.now()}`;

  const newUser = {
    id: userId,
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role,
    isEmailConfirmed: false,
    joinedDate: new Date().toISOString()
  };

  if (userData.role === 'teacher') {
    newUser.specialization = userData.specialization || 'General';
    newUser.bio = userData.bio || '';
    newUser.courses = [];
    newUser.isApproved = false;
    newUser.profileImage = userData.profileImage || '';
    newUser.whatsappNumber = userData.whatsappNumber || '';
  } else if (userData.role === 'student') {
    newUser.level = userData.level || 'Beginner';
    newUser.progress = {};
    newUser.completedLessons = [];
    newUser.purchasedLessons = []; // Initialize purchased lessons
    newUser.points = 0;
    newUser.badges = [];
    newUser.enrolledCourses = [];

    // Also add to students array
    const students = getStudents();
    const newStudentId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const newStudent = {
      id: newStudentId,
      userId: userId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'student',
      level: userData.level || 'Beginner',
      progress: {},
      completedLessons: [],
      purchasedLessons: [], // Initialize purchased lessons
      points: 0,
      badges: [],
      enrolledCourses: [],
      isEmailConfirmed: false,
      joinedDate: new Date().toISOString()
    };
    saveStudents([...students, newStudent]);
  }

  users[userId] = newUser;
  saveUsers(users);

  const confirmationToken = createEmailConfirmation(userId, userData.email);
  sendEmailConfirmation(userData.email, confirmationToken);

  console.log('✅ New user registered:', userId);
  return { user: newUser, confirmationToken };
};

export const confirmUserEmail = (token) => {
  try {
    const confirmation = verifyEmailConfirmation(token);
    const users = getUsers();

    if (!users[confirmation.userId]) {
      throw new Error('User not found');
    }

    users[confirmation.userId].isEmailConfirmed = true;
    users[confirmation.userId].emailConfirmedAt = new Date().toISOString();

    if (users[confirmation.userId].role === 'student') {
      const students = getStudents();
      const studentIndex = students.findIndex(s => s.userId === confirmation.userId || s.email === confirmation.email);
      if (studentIndex !== -1) {
        students[studentIndex].isEmailConfirmed = true;
        students[studentIndex].emailConfirmedAt = new Date().toISOString();
        saveStudents(students);
      }
    }

    saveUsers(users);

    console.log('✅ Email confirmed for user:', confirmation.userId);
    return users[confirmation.userId];
  } catch (error) {
    console.error('Error confirming email:', error);
    throw error;
  }
};

export const resendEmailConfirmation = (email) => {
  const users = getUsers();
  const user = Object.values(users).find(u => u.email === email);

  if (!user) {
    throw new Error('User not found with this email');
  }

  if (user.isEmailConfirmed) {
    throw new Error('Email is already confirmed');
  }

  const confirmationToken = createEmailConfirmation(user.id, email);
  sendEmailConfirmation(email, confirmationToken);

  console.log('✅ Confirmation email resent to:', email);
  return { success: true, message: 'Confirmation email sent successfully' };
};

// ==================== STUDENT MANAGEMENT ====================
export const getStudents = () => {
  try {
    const students = localStorage.getItem(STUDENT_KEY);
    return students ? JSON.parse(students) : [];
  } catch (error) {
    console.error('Error loading students:', error);
    return [];
  }
};

export const saveStudents = (students) => {
  try {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(students));
  } catch (error) {
    console.error('Error saving students:', error);
  }
};

export const getStudentById = (id) => {
  const students = getStudents();
  return students.find(student => student.id === id || student.userId === id);
};

export const updateStudent = (updatedStudent) => {
  const students = getStudents();
  const updatedStudents = students.map(student =>
    student.id === updatedStudent.id ? { ...student, ...updatedStudent } : student
  );
  saveStudents(updatedStudents);
  return updatedStudent;
};

// ==================== COURSES MANAGEMENT ====================
export const getCourses = () => {
  try {
    const courses = localStorage.getItem(COURSES_KEY);
    return courses ? JSON.parse(courses) : {};
  } catch (error) {
    console.error('Error loading courses:', error);
    return {};
  }
};

export const saveCourses = (courses) => {
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (error) {
    console.error('Error saving courses:', error);
  }
};

export const getCourseByKey = (courseKey) => {
  const courses = getCourses();
  return courses[courseKey] || null;
};

export const getLessonById = (courseKey, lessonId) => {
  const course = getCourseByKey(courseKey);
  if (!course) return null;

  return course.lessons.find(lesson => lesson.id === lessonId) || null;
};

// ==================== SIMPLIFIED FUNCTIONS ====================
export const getAllTeachers = () => {
  const users = getUsers();
  return Object.values(users).filter(user => user.role === 'teacher');
};

export const getAllUsers = () => {
  const users = getUsers();
  return Object.values(users);
};

// ==================== DEBUG FUNCTION ====================
export const debugStorage = () => {
  console.log('=== STORAGE DEBUG INFO ===');

  const users = getUsers();
  const currentUser = getCurrentUser();
  const students = getStudents();
  const courses = getCourses();
  const teacherWallets = getTeacherWallets();
  const paymentTransactions = getPaymentTransactions();

  console.log('All Users:', users);
  console.log('Current User:', currentUser);
  console.log('Students:', students);
  console.log('Courses:', courses);
  console.log('Teacher Wallets:', teacherWallets);
  console.log('Payment Transactions:', paymentTransactions);

  console.log('=== END DEBUG INFO ===');
};

// ==================== EXPORT ALL FUNCTIONS ====================
export default {
  initializeStorage,
  // Teacher wallet functions
  getTeacherWallets,
  saveTeacherWallets,
  getTeacherWallet,
  updateTeacherWallet,
  addTeacherEarnings,
  // Payment functions
  purchaseLesson,
  hasStudentPurchasedLesson,
  canAccessLesson,
  getTeacherWhatsAppUrl,
  processLessonPayment,
  getTeacherPaymentStats,
  getPaymentTransactions,
  savePaymentTransactions,
  // Session tracking
  getSessionTracking,
  saveSessionTracking,
  updateLastActivity,
  logoutUser,
  // Email confirmation
  getEmailConfirmations,
  saveEmailConfirmations,
  createEmailConfirmation,
  verifyEmailConfirmation,
  sendEmailConfirmation,
  confirmUserEmail,
  resendEmailConfirmation,
  // User management
  getUsers,
  saveUsers,
  registerUser,
  authenticateUser,
  getCurrentUser,
  setCurrentUser,
  // Student management
  getStudents,
  saveStudents,
  getStudentById,
  updateStudent,
  // Course management
  getCourses,
  saveCourses,
  getCourseByKey,
  getLessonById,
  // Teacher functions
  getAllTeachers,
  updateTeacherProfileWithWhatsApp,
  // General functions
  getAllUsers,
  debugStorage
};