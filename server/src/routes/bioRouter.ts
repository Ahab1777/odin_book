import express from 'express';
import { authentication } from '../middlewares/authMiddleware';
import { editBio, editBioValidation, getBio } from '../controllers/bioControllers';


const bioRouter = express.Router();

bioRouter.get(
    '/:userId',
    authentication,
    getBio
);

bioRouter.put(
    '/',
    authentication,
    editBioValidation,
    editBio
);

export default bioRouter;