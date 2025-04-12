import {ValidationResult} from '../types';

export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return {isValid: false, message: 'Name is required'};
  }

  if (name.length <= 2) {
    return {isValid: false, message: 'Name must be at least 2 characters long'};
  }

  return {isValid: true};
};
