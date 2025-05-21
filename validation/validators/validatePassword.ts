import {ValidationResult} from '../types';

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {isValid: false, message: 'Password is required'};
  }

  if (password.length <= 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  const containsUppercase = /[A-Z]/.test(password);
  if (!containsUppercase) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  const containsLowercase = /[a-z]/.test(password);
  if (!containsLowercase) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  const containsNumber = /[0-9]/.test(password);
  if (!containsNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  const containsSpecialCharacter =
    /[ `~<>?,./!@#$%^&*()\-_=+"|{}[\];:\\\\]/.test(password);
  if (!containsSpecialCharacter) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return {isValid: true};
};
