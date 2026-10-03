import * as Yup from 'yup';

export const registerSchema = Yup.object().shape({
  userName: Yup.string()
    .min(2, 'At least two characters')
    .max(20, 'Too Long!')
    .required('Required😾'),
  password: Yup.string()
    .required('Password is required')
    .min(5, 'Password is too short - should be 5 chars minimum.'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], "Passwords don't match"),
});
