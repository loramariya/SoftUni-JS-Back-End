import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/constants.js';

export const authMiddleware = (req, res, next) => {
    const token = req.cookies['auth'];

    if(!token) {
        return next();
    }

    try {
       const deocdedToken = jwt.verify(token, JWT_SECRET)
        
       return next();
    } catch (error) {
        res.clearCookie('auth');

        res.redirect('/auth/login');
    }

};
