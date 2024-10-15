import bcrypt from 'bcrypt';

import User from "../models/User.js";

const register = (email, password) => {
    return User.create({email, password});
}

const login = async (email, password) => {
    const user = await User.findOne({email});

    if (!user){
        throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if(!isValid){
        throw new Error('Invalid password');
    }
   
};

export default {
    register,
    login,
}