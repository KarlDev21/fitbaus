import {ValidationResult} from '../types';

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return {isValid: false, message: 'Email is required'};
  }

  if (!emailRegex.test(email)) {
    return {isValid: false, message: 'Invalid email format'};
  }

  return {isValid: true};
};
