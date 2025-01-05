import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import publicRoutes from './routes/publicRoutes';
dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(bodyParser.json());
// Middleware to parse JSON requests
app.use(express.json());
// Mount the checkout routes
app.use('/api/v1', publicRoutes);
/*
* Uncomment the following code to test the connection to the database
pool
    .connect()
    .then(() => {
        console.log('service Connected to the database');
    })
    .catch((error: any) => {
        console.error('Unable to connect to the database:', error);
    });
*/
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});