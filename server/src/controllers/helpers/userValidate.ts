import { check } from 'express-validator';
import { ERRMSGS } from './validatorMessages';

export const userValidate = [
  check('userName', ERRMSGS.USERREQUIRED).not().isEmpty(),
  check('userName', ERRMSGS.USERNAMETOOSHORT).isLength({ min: 2 }),
  check('userName', ERRMSGS.USERNAMETOOLONG).isLength({ max: 20 }),
  check('password', ERRMSGS.PASSWORDREQUIRED).not().isEmpty(),
  check('password', ERRMSGS.PASSWORDTOOSHORT).isLength({ min: 5 }),
];
