import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <>
      <h2 className="display-5">Nothing to show here 😿</h2>
      <Link to="/gatochat/login">Go to Login page</Link>
    </>
  );
};

export default NotFound;
