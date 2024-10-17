import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/constants.js';

export const authMiddleware = (req, res, next) => {
    const token = req.cookies['auth'];

    if(!token) {
        return next();
    }

    try {
       const deocdedToken = jwt.verify(token, JWT_SECRET)
       
       const user = {
           _id: deocdedToken._id,
           email: deocdedToken.email
       };

       req.user = user;
       req.isAuthenticated = true;
       res.locals.userId= user._id;
       res.locals.userEmail = user.email;
       res.locals.isAuthenticated = true;

       return next();
    } catch (error) {
        res.clearCookie('auth');

        res.redirect('/auth/login');
    }

};

export const isAuth = (req, res, next) => {
    if(!req.isAuthenticated) {
        return res.redirect('/auth/login');
    }
    return next();
}
