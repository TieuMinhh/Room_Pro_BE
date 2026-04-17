import express, { Express, Request, Response, NextFunction } from 'express';
import { env } from './config/environment';
import { APIs_V1 } from './routes/v1';
import { errorHandlingMiddleware } from './middlewares/erroHandlingMiddlewares';
import { corsOptions } from './config/cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const START_SERVER = () => {
    const app: Express = express();

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.set('Cache-Control', 'no-store');
        next();
    });

    app.use(cookieParser());

    const hostname = env.APP_HOST;
    const port = env.APP_POST;

    app.use(cors(corsOptions));
    app.use(express.json());

    app.use('/api/v1', APIs_V1);

    // middleware error handling (always at the end)
    app.use(errorHandlingMiddleware);

    const server = http.createServer(app);

    const io = new Server(server, { cors: corsOptions });

    // io.on('connection', (socket) => {
    //   socket.on('FE_INVITED_TO_BOARD', (invitation) => {
    //     socket.broadcast.emit('BE_INVITED_TO_BOARD', invitation)
    //   })
    // })

    server.listen(port, hostname, () => {
        // eslint-disable-next-line no-console
        console.log(`Hello ${env.AUTHOR}, I am running at http://${hostname}:${port}/`);
    });
};

connectDB()
    .then(() => START_SERVER())
    .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        process.exit(0);
    });
