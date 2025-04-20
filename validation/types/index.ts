export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export type UseFormReturn<T> = {
  formState: FormState<T>;
  handleChange: (name: keyof T, value: string) => void;
  validateForm: () => boolean;
};

export type FormState<T> = {
  values: T;
  errors: {[K in keyof T]?: string};
};
