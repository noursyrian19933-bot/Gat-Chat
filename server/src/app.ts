import config from './config'; //sanitized env variables
import http from 'http';
import express from 'express';
import initDB from './models/initModels';
import userRoutes from './routes/userRoutes';
import notFoundController from './middlewares/notFoundController';
// import cors from 'cors';
import { ServerSocket } from './models/socket';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express(); // Express app object can handle http requests but is not suitable for sockets.
const httpServer = http.createServer(app); // Node http server object is suitable for sockets.

/** Start the single Socket instance **/
new ServerSocket(httpServer);

/** Log the request */
app.use((req, res, next) => {
  console.info(
    `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
  );

  res.on('finish', () => {
    console.info(
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
    );
  });

  next();
});

/** Enable JSON parsing */
app.use(express.json());

/** CORS handling **/
// app.use(cors());
// For the moment we'll use a proxy at client side to avoid CORS issues.

app.use('/users', userRoutes);
app.use(notFoundController);

app.use(errorMiddleware);

/** Listen */
const PORT = config.PORT || 5000;
initDB().then(() => {
  httpServer.listen(PORT, () => console.info('🚀🚀Server is running on port', PORT));
});
