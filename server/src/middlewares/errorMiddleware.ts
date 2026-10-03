import {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

export const errorMiddleware: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof SyntaxError) {
    console.error(err);
    return res.status(400).json({ status: false, error: 'Enter valid json body' });
  }

  return res.status(500).json({ status: false, error: 'Internal server error' });
  // Internal server error
};
