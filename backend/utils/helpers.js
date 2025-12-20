const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

// Generate JWT token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Generate QR code as base64
exports.generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data));
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Check if time slot overlaps with existing bookings
exports.checkTimeOverlap = (startTime1, endTime1, startTime2, endTime2) => {
  const start1 = parseTime(startTime1);
  const end1 = parseTime(endTime1);
  const start2 = parseTime(startTime2);
  const end2 = parseTime(endTime2);
  
  return (start1 < end2 && end1 > start2);
};

// Parse time string (HH:MM) to minutes
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Calculate duration in hours
exports.calculateDuration = (startTime, endTime) => {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return (end - start) / 60;
};

// Format date to readable string
exports.formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Check if date is in the past
exports.isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

// Generate unique receipt ID
exports.generateReceiptId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `RCP-${timestamp}-${random}`;
};

// Calculate booking price
exports.calculatePrice = (pricePerHour, duration) => {
  return pricePerHour * duration;
};

// Validate email format
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize user input
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Generate random password
exports.generateRandomPassword = (length = 10) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Paginate results
exports.paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

// Calculate streak
exports.calculateStreak = (lastPlayedDate) => {
  if (!lastPlayedDate) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastPlayed = new Date(lastPlayedDate);
  lastPlayed.setHours(0, 0, 0, 0);
  
  const diffTime = today - lastPlayed;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If last played was yesterday or today, streak continues
  return diffDays <= 1 ? 1 : 0;
};