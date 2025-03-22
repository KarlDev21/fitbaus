import {ValidationResult} from '../types';

export const validateNumber = (number: string): ValidationResult => {
  const numberRegex = /^[0-9]+$/;
  if (!number) {
    return {isValid: false, message: 'Number is required'};
  }
  if (!numberRegex.test(number)) {
    return {isValid: false, message: 'Invalid number format'};
  }
  //TODO: Check the length of the number
  return {isValid: true};
};
