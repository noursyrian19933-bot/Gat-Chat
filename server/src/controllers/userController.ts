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
import admin from 'firebase-admin';

// دالة لتحويل الإيميل إلى مفتاح صالح للاستخدام في Firebase Realtime Database
const getEmailKey = (email: string): string => {
  return email.trim().toLowerCase().replace(/\./g, '_');
};

export const registerUser: RequestHandler = async (req, res): Promise<any> => {
  const result: Result = validationResult(req);
  const errors = result.array();
  if (errors.length > 0) {
    const error = new NotCorrectParamsError('Incorrect fields provided', 400, errors);
    return res.status(400).json(error);
  }
  try {
    let { userName, password, email } = req.body; // التأكد من استقبال الإيميل
    
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

    // [الحفظ عن طريق الإيميل] تهيئة بيانات المستخدم في فايربيس بناءً على الإيميل حصراً
    if (email) {
      try {
        const emailKey = getEmailKey(email);
        const userRef = admin.database().ref(`users/${emailKey}`);
        await userRef.set({
          userName: newUser.userName,
          email: email,
          role: 'user', // الرتبة الافتراضية
          createdAt: new Date().toISOString()
        });
      } catch (firebaseErr) {
        console.error('Error initializing user by email in Firebase:', firebaseErr);
      }
    }

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

// [إدارة وتحديث الرتب والحفظ بالكامل عبر الإيميل] حتى لو تغير الاسم يبقى كل شيء مرتبطاً بالإيميل
export const updateUserRole: RequestHandler = async (req, res): Promise<any> => {
  try {
    const { targetEmail, role } = req.body;

    if (!targetEmail) {
      return res.status(400).json({ status: false, error: 'Target Email is required' });
    }

    // تحويل الإيميل إلى مفتاح آمن لقاعدة البيانات
    const emailKey = getEmailKey(targetEmail);
    const dbRef = admin.database().ref(`users/${emailKey}`);

    // في حال طلب سحب الرتبة أو إرجاعها للعادي
    if (role === 'remove' || role === null || role === 'user') {
      await dbRef.update({
        email: targetEmail,
        role: role === 'remove' ? 'user' : role
      });
      return res.json({ status: true, message: 'Role updated successfully based on email' });
    }

    // حفظ وتحديث الرتبة والصلاحيات مرتبطة حصراً بالإيميل
    await dbRef.update({
      email: targetEmail,
      role: role 
    });

    return res.json({ status: true, message: `Role ${role} assigned successfully to email` });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ status: false, error: error.message });
    }
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};
