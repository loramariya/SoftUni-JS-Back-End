import Game from "../models/Game.js";

const gameService = {
    getAll(filter){
        const query = Game.find(); 
        
        if(filter.name) {
            query.find({ name: { $regex: filter.name, $options: 'i' }});
        }

        if(filter.platform) {
            query.find({ platform: filter.platform });
        }
        
        return query;
    },
    getOne(gameId){
        return Game.findById(gameId);
    },
    create(gameData, userId){
        return Game.create({...gameData, owner: userId});
    },
    buy(gameId, userId){
        return Game.findByIdAndUpdate(gameId, {$push : {boughtBy: userId}});
    },
    remove(gameId){
        return Game.findByIdAndDelete(gameId);
    },
    edit(gameId, gameData){
        return Game.findByIdAndUpdate(gameId, gameData, {runValidators: true});
    }
};

export default gameService;