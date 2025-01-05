// requestRoutes.ts
import express from 'express';
import RequestService from '../services/RequestService';
const publicRoutes = express.Router();
const requestService = new RequestService()

publicRoutes.post('/query', requestService.dummyRequest);

export default publicRoutes;

