/**
 * Validation utilities pentru forms
 * Centralizează logica de validare
 */

// Email validation with comprehensive regex
export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'Email is required' };

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true, message: '' };
};

// Password strength validation
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'Password is required' };

  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  return { isValid: true, message: '' };
};

// Name validation
export const validateName = (name) => {
  if (!name) return { isValid: false, message: 'Name is required' };

  if (name.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }

  if (name.length > 50) {
    return { isValid: false, message: 'Name must be less than 50 characters' };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true, message: '' };
};

// Numeric field validation for calculator
export const validateNumericField = (value, fieldName, min, max, unit = '') => {
  if (!value || value.toString().trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }

  if (numValue < min || numValue > max) {
    return {
      isValid: false,
      message: `${fieldName} must be between ${min} and ${max}${unit ? ' ' + unit : ''}`
    };
  }

  return { isValid: true, message: '' };
};

// Blood type validation
export const validateBloodType = (bloodType) => {
  if (!bloodType || bloodType.toString().trim() === '') {
    return { isValid: false, message: 'Blood type is required' };
  }

  const validTypes = ['1', '2', '3', '4'];
  if (!validTypes.includes(bloodType.toString())) {
    return { isValid: false, message: 'Blood type must be 1, 2, 3, or 4' };
  }

  return { isValid: true, message: '' };
};

// Comprehensive form validation
export const validateCalculatorForm = (formData) => {
  const errors = {};

  const heightValidation = validateNumericField(formData.height, 'Height', 100, 250, 'cm');
  if (!heightValidation.isValid) errors.height = heightValidation.message;

  const ageValidation = validateNumericField(formData.age, 'Age', 18, 100, 'years');
  if (!ageValidation.isValid) errors.age = ageValidation.message;

  const currentWeightValidation = validateNumericField(formData.currentWeight, 'Current weight', 30, 300, 'kg');
  if (!currentWeightValidation.isValid) errors.currentWeight = currentWeightValidation.message;

  const desiredWeightValidation = validateNumericField(formData.desiredWeight, 'Desired weight', 30, 300, 'kg');
  if (!desiredWeightValidation.isValid) errors.desiredWeight = desiredWeightValidation.message;

  const bloodTypeValidation = validateBloodType(formData.bloodType);
  if (!bloodTypeValidation.isValid) errors.bloodType = bloodTypeValidation.message;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// XSS Protection - sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};
