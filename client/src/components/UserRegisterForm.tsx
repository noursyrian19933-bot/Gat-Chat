import { Button, FloatingLabel, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { RegisterForm, RegisterFormProps, User } from '../Interfaces/Interfaces';
import { Formik } from 'formik';
import { registerSchema } from '../validation/registerSchema';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const UserRegisterForm = (props: RegisterFormProps): React.ReactElement => {
  const { setLoggedUser } = props;
  const navigate = useNavigate();
  const initialValues: RegisterForm = {
    userName: '',
    password: '',
    confirmPassword: '',
    formError: null,
  };

  const onRegisterHandler = async (values: RegisterForm) => {
    const userName = values.userName.trim();
    const password = values.password?.trim();
    if (!userName || !password) {
      values.userName = '';
      values.password = '';
      values.confirmPassword = '';
      return alert("That's cheating😿! Please fill the form");
    }
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        alert(error.message);
        return;
      }
      const data = await response.json();
      localStorage.setItem('token', data.payload.token);
      setLoggedUser(data.payload.user as User);
      navigate('/chat/welcome');
    } catch (error: unknown) {
      // show an alert window with the error received from the backend
      alert('Something went wront, please try again later');
      return;
    }
  };

  // Auto-focus input when the user enters the chat
  const userInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  }, []);

  return (
    <motion.div
      className="name-field"
      initial={{ scale: 0 }}
      animate={{ rotate: 360, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      exit={{ opacity: 0, x: '-100vw' }}
    >
      <h2>Register</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={registerSchema}
        onSubmit={onRegisterHandler}
      >
        {(formik) => {
          // console.log('Formik props', formik);
          return (
            <Form noValidate onSubmit={formik.handleSubmit}>
              <FloatingLabel
                controlId="username"
                label="Your username"
                className="mb-2 p-0"
              >
                <Form.Control
                  ref={userInputRef}
                  type="text"
                  name="userName"
                  placeholder="Your username"
                  isValid={formik.touched.userName && !formik.errors.userName}
                  isInvalid={formik.touched.userName && !!formik.errors.userName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.userName}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.userName}
                </Form.Control.Feedback>
              </FloatingLabel>
              <FloatingLabel controlId="password" label="Password" className="mb-2 p-0">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  isValid={formik.touched.password && !formik.errors.password}
                  isInvalid={formik.touched.password && !!formik.errors.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.password}
                </Form.Control.Feedback>
              </FloatingLabel>
              <FloatingLabel
                className="d-flex"
                controlId="confirmPassword"
                label="Confirm password"
              >
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  isValid={
                    formik.touched.confirmPassword && !formik.errors.confirmPassword
                  }
                  isInvalid={
                    formik.touched.confirmPassword && !!formik.errors.confirmPassword
                  }
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                />
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={!formik.isValid || formik.isSubmitting}
                >
                  Submit
                </Button>
              </FloatingLabel>
            </Form>
          );
        }}
      </Formik>
      <Link to="/gatochat/login">Already registered? Login🔑</Link>
    </motion.div>
  );
};

export default UserRegisterForm;
