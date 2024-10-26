import bcrypt from 'bcrypt';
import User from "../models/User.js";
import jwt from '../lib/jwt.js';

const authService = {
    async register(username, email, password, rePassword) {
        const user = await User.findOne({ $or: [{ email }, { username }] })

        if (password !== rePassword) {
            throw new Error("Passwords do not match!");
        }

        if (user) {
            throw new Error("Username or email already exists!");
        }

        const newUser = await User.create({
            username,
            email,
            password,
        });

        return this.generateToken(newUser);
    },
    async login(email, password) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("Invalid user or password!");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error("Invalid user or password!");
        }

        return this.generateToken(user);

    },
    async generateToken(user) {
        const payload = {
            _id: user._id,
            email: user.email,
            username: user.username,

        };
        
        const header = { expiresIn: '2h' };

        const token = await jwt.sign(payload, process.env.JWT_SECRET, header );

        return token;
    }
};

export default authService;