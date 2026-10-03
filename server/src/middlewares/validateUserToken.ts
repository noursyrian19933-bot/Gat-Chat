import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
import { InvalidTokenError } from '../controllers/helpers/ErrorHandler';
import config from '../config'; //sanitized env variables

export const validateUserToken: RequestHandler = async (req, res, next) => {
  if (!req.body.token) {
    const error = new InvalidTokenError(
      'Authentication failed due to invalid or non existing token',
      403
    );
    return res.json(error);
  }
  try {
    /*Authorization: 'Bearer TOKEN' so, the token is part of the authorization string that comes with the header.*/
    const decodedToken = jwt.verify(req.body.token, config.SECRET);
    // This will also check token expiry
    if (!decodedToken) {
      const error = new InvalidTokenError(
        'Authentication failed due to invalid or non existing token',
        403
      );
      console.log('token is not valid')
      return res.json(error);
    }
    console.log('token verified');
    return res.status(200).json({ message: 'Token is valid' });
  } catch (err) {}
};
