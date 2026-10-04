import config from '../config';
import { RequestHandler } from 'express';
import {
  userRepository,
  userRoomRepository,
} from '../infrastructure/dependecy-injection';
import bcrypt from 'bcrypt';
import { NotCorrectParamsError } from './helpers/ErrorHandler';
import { Result, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { TokenPayloadInterface } from '../models/Interfaces';
import admin from 'firebase-admin'; // لاستخدام فايربيس أدمن في السيرفر

export const registerUser: RequestHandler = async (req, res): Promise<any> => {
  const result: Result = validationResult(req);
  const errors = result.array();
  if (errors.length > 0) {
    const error = new NotCorrectParamsError('Incorrect fields provided', 400, errors);
    return res.status(400).json(error);
  }
  try {
    let { userName, password } = req.body;
    const existingUser = await userRepository!.retrieveByName(userName);
    if (existingUser) {
      const error = new NotCorrectParamsError(
        'User already exists🙀, please try another one.',
        400
      );
      return res.status(400).json(error);
    }
    const saltRounds = 10;
    const hashedPw = await bcrypt.hash(password, saltRounds);
    const newUser = await userRepository!.create(userName, hashedPw);

    const tokenPayload: TokenPayloadInterface = {
      userName: newUser.userName,
      userId: newUser.userId,
    };
    const token = jwt.sign(tokenPayload, config.SECRET, {
      expiresIn: '1h',
    });
    return res.json({
      payload: {
        token,
        user: newUser,
        message: `new user -${userName}- created. `,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

export const loginUser: RequestHandler = async (req, res): Promise<any> => {
  const result: Result = validationResult(req);
  const errors = result.array();
  if (errors.length > 0) {
    const error = new NotCorrectParamsError('Incorrect fields provided', 400, errors);
    return res.status(400).json(error);
  }
  try {
    let { userName, password } = req.body;
    const existingUser = await userRepository!.retrieveByName(userName);
    if (!existingUser) {
      const error = new NotCorrectParamsError('User not found😿, please try again.', 400);
      return res.status(400).json(error);
    }
    const connectedUser = await userRoomRepository!.findUserByUserId(existingUser.userId);
    if (connectedUser) {
      const error = new NotCorrectParamsError(
        'Something went wrong😿, please try again.',
        400
      );
      return res.status(400).json(error);
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      const error = new NotCorrectParamsError(
        'Incorrect password😾, please try again.',
        400
      );
      return res.status(400).json(error);
    }
    const tokenPayload: TokenPayloadInterface = {
      userName: existingUser.userName,
      userId: existingUser.userId,
    };
    const token = jwt.sign(tokenPayload, config.SECRET, {
      expiresIn: '1h',
    });
    return res.json({
      payload: {
        token,
        user: {
          userId: existingUser.userId,
          userName: existingUser.userName,
        },
        message: `user -${userName}- logged in. `,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

// وظيفة جديدة لإدارة وتحديث الرتب والإيميل تلقائياً في Firebase Realtime Database
export const updateUserRole: RequestHandler = async (req, res): Promise<any> => {
  try {
    const { targetUid, targetEmail, role } = req.body;

    if (!targetUid) {
      return res.status(400).json({ status: false, error: 'Target UID is required' });
    }

    const dbRef = admin.database().ref(`users/${targetUid}`);

    // في حال طلب سحب الرتبة
    if (role === 'remove' || role === null) {
      await dbRef.update({
        email: targetEmail || null,
        role: null
      });
      return res.json({ status: true, message: 'Role removed successfully' });
    }

    // تعيين أو تحديث الرتبة مع الإيميل تحت الـ UID مباشرة
    await dbRef.update({
      email: targetEmail,
      role: role // (admin, super_admin, premium)
    });

    return res.json({ status: true, message: `Role ${role} assigned successfully` });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ status: false, error: error.message });
    }
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};
