import express from 'express';
import type { Application } from 'express';
import { routes } from './routes/index';


const app: Application = express();


//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Routes
app.use('/auth', routes.auth)