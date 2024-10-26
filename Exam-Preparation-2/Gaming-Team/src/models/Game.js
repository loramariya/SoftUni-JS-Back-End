import { Schema, model, Types } from "mongoose";

const gameSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required!'],
        minLenght: 4,
    },
    image: {
        type: String,
        required: [true, 'Image is required!'],
        validate: /^https?:\/\//,
    },
    price: {
        type: Number,
        required: [true, 'Price is required!'],
        min: 0,
    },
    description: {
        type: String,
        required: [true, 'Description is required!'],
        minLenght: 10,
    },
    genre: {
        type: String,
        required: [true, 'Genre is required!'],
        minLenght: 2,
    },
    platform: {
        type: String,
        required: [true, 'Platfrom is required!'],
        enum: ['PC', 'Nintendo', 'PS4', 'PS5', 'XBOX']
    },
    owner: {
        type: Types.ObjectId,
        ref: 'User',
    },
    boughtBy: [{
        type: Types.ObjectId,
        ref: 'User'
    }],
});

const Game = model('Game', gameSchema);

export default Game;