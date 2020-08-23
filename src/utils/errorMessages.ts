import { YupError } from "src/shared/models/yupError.model";

export const invalidLogin: YupError[] = [
  {
    path: "email",
    message: "invalid login"
  }
];

export const emailTaken: YupError[] = [
  {
    path: "email",
    message: "already taken"
  }
];

export const emailNotConfirmed: YupError[] = [
  {
    path: "email",
    message: "not confirmed"
  }
];
