// requestRoutes.ts
import express from 'express';
import RequestService from '../services/RequestService';
const publicRoutes = express.Router();
const requestService = new RequestService()

publicRoutes.post('/query', requestService.queryCrustData);
publicRoutes.post('/vectorize', requestService.vectorize);

publicRoutes.get('/status', (req, res) => { res.status(200).json({ message: 'Service is running' }) });
export default publicRoutes;

