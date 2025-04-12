import {ValidationResult} from '../types';
import {validateEmail} from './validateEmail';
import {validateName} from './validateName';
import {validateNumber} from './validateNumber';
import {validatePassword} from './validatePassword';

export const validateInput = (
  type: string,
  value: string,
): ValidationResult => {
  switch (type) {
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'name':
      return validateName(value);
    case 'phone':
      return validateNumber(value);
    default:
      return {isValid: true};
  }
};
