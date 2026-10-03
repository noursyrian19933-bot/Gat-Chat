import { Button, FloatingLabel, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { LoginForm, LoginFormProps, User } from '../Interfaces/Interfaces';
import { Formik } from 'formik';
import { loginSchema } from '../validation/loginSchema';
import { motion } from 'framer-motion';

const UserLoginForm = (props: LoginFormProps) => {
  const { setLoggedUser } = props;
  const navigate = useNavigate();
  const initialValues: LoginForm = {
    userName: '',
    password: '',
    formError: null,
  };

  const onLoginHandler = async (values: LoginForm) => {
    const { userName, password } = values;
    try {
      const response = await fetch('/api/users/login', {
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
      alert('Something went wront, please try again later');
      return;
    }
  };

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
      <h2>Login</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={onLoginHandler}
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
              <FloatingLabel
                controlId="password"
                label="Password"
                className="d-flex mb-2 p-0"
              >
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
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={!formik.isValid || formik.isSubmitting}
                >
                  Submit
                </Button>
              </FloatingLabel>
              <Form.Control.Feedback type="invalid">
                {formik.errors.password}
              </Form.Control.Feedback>
            </Form>
          );
        }}
      </Formik>
      <Link to="/gatochat/register">I am not yet registered🔑</Link>
    </motion.div>
  );
};

export default UserLoginForm;
