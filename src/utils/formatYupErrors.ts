import { ValidationError } from "yup";

import { YupError } from "src/shared/models/yupError.model";

export const formatYupError = (error: ValidationError) => {
  const errors: YupError[] = [];
  error.inner.forEach(e =>
    errors.push({
      path: e.path,
      message: e.message
    })
  );
  return errors;
};
