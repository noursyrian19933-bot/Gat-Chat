import express from 'express';
import * as userController from '../controllers/userController';
import { userValidate } from '../controllers/helpers/userValidate';
import { validateUserToken } from '../middlewares/validateUserToken';

const router = express.Router();

// app.use('/users', userRoutes);

router.post('/register', userValidate, userController.registerUser);

// This API route will also allocate a token to the user who logs in.
router.post('/login', userValidate, userController.loginUser);

// At some point, the user will use this api route to check if the token is still valid.
router.post('/tokeninfo', validateUserToken)

export default router;
