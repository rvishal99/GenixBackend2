import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import morgan from 'morgan';

import userRoutes from './routes/user.routes.js'
import productRoutes from './routes/products.routes.js'
import errorMiddleware from './middlewares/error.middleware.js';


const app = express();


config(); // considers all values in env file

app.use(express.json()); // used for parsing


app.use(express.urlencoded({ extended: true })); // used to take querries, params from the url easily


app.use(cookieParser());


app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));


app.use('/ping', function (req, res) {
    res.send('/pong')
})


app.use(morgan('dev'))


app.use('/api/v1/user', userRoutes);
app.use('/api/v1/products', productRoutes);


app.use(errorMiddleware);

export default app;
