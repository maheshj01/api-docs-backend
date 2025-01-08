import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import publicRoutes from './routes/publicRoutes';
import RequestService from './services/RequestService';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT;
// Middleware to parse JSON requests

dotenv.config();

const corsOptions = {
    origin: [process.env.CLIENT_BASE_URL || 'http://localhost:3000', 'https://www.getpostman.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies, if your application uses them
    optionsSuccessStatus: 204, // Some legacy browsers (IE11) choke on 204
    // headers: 'Content-Type, Authorization, Content-Length, X-Requested-With',
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.json());
// Mount the checkout routes
app.use('/api/v1', publicRoutes);

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);

    new RequestService().loadFromSitemap('https://nextjs.org/sitemap.xml');
});