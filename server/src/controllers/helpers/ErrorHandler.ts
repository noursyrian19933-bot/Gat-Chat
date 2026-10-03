// This file contains customized classes that extend the Error class.

export class NotCorrectParamsError {
  message: string;
  code: number;
  errors?: string[];
  constructor(message: string, code: number, errors?: string[]) {
    this.message = message;
    this.code = code;
    this.errors = errors; // This is an array of strings(errors from express-validator)
  }
}

export class InvalidTokenError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}
