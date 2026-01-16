import express from 'express';
import type { Application } from 'express';
import { routes } from './routes/index';


const app: Application = express();


//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Routes
app.use('/auth', routes.auth);
app.use('/post', routes.post);
app.use('/user', routes.user);

//Network settings
const PORT: number = parseInt(process.env.PORT || '9001', 10);
const HOST: string = process.env.HOST || 'localhost';


app.listen(PORT, HOST, (error?: NodeJS.ErrnoException) => {
    if (error) {
        // Possible errors reference:
        // - EADDRINUSE: Port is already in use
        // - EACCES: Insufficient privileges to bind to the port
        // - ENOTFOUND: Hostname not found
        // - ECONNREFUSED: Connection refused
        // - EADDRNOTAVAIL: Address not available
        // - ENETUNREACH: Network is unreachable
        // - EHOSTUNREACH: No route to host
        // - EPIPE: Broken pipe
        // - EFAULT: Bad address
        // - ENOMEM: Not enough memory
        // - EINVAL: Invalid argument
        // - EPERM: Operation not permitted
        // - ESOCKTNOSUPPORT: Socket type not supported
        // - EPROTONOSUPPORT: Protocol not supported
        // - EAFNOSUPPORT: Address family not supported by protocol
        throw error;
    }
    console.log(`!! - Server running on http://${HOST}:${PORT} - !!`);
});