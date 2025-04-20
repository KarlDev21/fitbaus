import {useState} from 'react';
import {UseFormReturn, FormState, ValidationResult} from './types';
import {validateInput} from './validators';

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
): UseFormReturn<T> => {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
  });

  const handleChange = (name: keyof T, value: string) => {
    setFormState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values,
        [name]: value,
      },
      errors: {
        ...prevState.errors,
        [name]: validateInput(name as string, value).message,
      },
    }));
  };

  const validateForm = (): boolean => {
    const errors: {[K in keyof T]?: string} = {};
    let isValid = true;

    for (const key in formState.values) {
      if (Object.prototype.hasOwnProperty.call(formState.values, key)) {
        const validation: ValidationResult = validateInput(
          key,
          formState.values[key],
        );
        if (!validation.isValid) {
          isValid = false;
          errors[key] = validation.message;
        }
      }
    }

    setFormState(prevState => ({
      ...prevState,
      errors,
    }));

    return isValid;
  };

  return {
    formState,
    handleChange,
    validateForm,
  };
};
