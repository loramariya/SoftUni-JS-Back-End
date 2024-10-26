import { Router } from "express";
import gameService from "../services/gameService.js";
import { getErrorMessage } from "../utils/errorUtils.js";
import { isAuth } from "../middlewares/authMiddleware.js";

const gameController = Router();

gameController.get('/', async (req, res) => {
    const games = await gameService.getAll({}).lean()
    ;
    res.render('game/index', {games, title: 'Catalog Page - Gaming Team'})
});

gameController.get('/create', isAuth, (req, res) => {
    res.render('game/create', {title: 'Create Page - Gaming Team'})
})


gameController.post('/create', isAuth, async (req, res) => {
    const gameData = req.body;
    const userId = req.user._id;

    try {
        await gameService.create(gameData, userId);

        res.redirect('/games');
    } catch (err) {
        const error = getErrorMessage(err);

        res.render('game/create', { error, title: 'Create Page' });
    }
});

gameController.get('/search', async (req, res) => {
    const query = req.query;
    const games = await gameService.getAll(query).lean();
    const gameTypes = getPlatformTypeData(query);

    res.render('game/search', { title: 'Search Page', games, query, gameTypes})
});

gameController.get('/:gameId/details', async (req, res) => {
    const game = await gameService.getOne(req.params.gameId).lean();
    const isOwner = game.owner.toString() === req.user?._id;
    const hasBought = game.boughtBy?.some(userId => userId.toString() === req.user?._id);

    res.render('game/details', { game, title: 'Details Page', isOwner, hasBought})
});

gameController.get('/:gameId/buy', isAuth,  async (req, res) => {
    const gameId = req.params.gameId;
    const userId = req.user._id;


    if (await isGameOwner(gameId, userId)) {
        return res.redirect(`/404`)
    }

    try {
        await gameService.buy(gameId, userId);

        res.redirect(`/games/${gameId}/details`);
    } catch (err) {
        console.log(err);
    }
});

gameController.get('/:gameId/delete', isAuth,  async (req, res) => {
    if (!(await isGameOwner(req.params.gameId, req.user._id))) {
        return res.redirect('/404');
    }

    try {
        await gameService.remove(req.params.gameId);

        res.redirect('/games');
    } catch (err) {
        console.log(err);
    }
});

gameController.get('/:gameId/edit', isAuth,  async (req, res) => {
    const game = await gameService.getOne(req.params.gameId).lean();
    const gameTypes = getPlatformTypeData(game);
    const isOwner = game.owner.toString() === req.user._id;

    if (!isOwner) {
        return res.redirect('/404');
    }

    res.render('game/edit', { title: 'Edit Page - Gaming Team', game, gameTypes });
});

gameController.post('/:gameId/edit', isAuth,  async (req, res) => {
    const gameData = req.body;
    const gameId = req.params.gameId;

    try {
        await gameService.edit(gameId, gameData);

        res.redirect(`/games/${gameId}/details`);
    } catch (err) {
        const gameData =req.body;
        const gameTypeData = getPlatformTypeData(gameData);
        const error = getErrorMessage(err);

        res.render('game/edit', { game: gameData, gameTypes: gameTypeData, error, title: 'Edit Page - Gaming Team' });
    }
});

async function isGameOwner(gameId, userId) {
    const game = await gameService.getOne(gameId);
    const isOwner = game.owner.toString() === userId;

    return isOwner;
}

function getPlatformTypeData({ platform }) {
    const platformTypes = ['PC', 'Nintendo', 'PS4', 'PS5', 'XBOX'];

    const viewData = platformTypes.map(type => ({
        value: type,
        label: type,
        selected: platform === type ? 'selected' : ''
    }));

    return viewData;
}
export default gameController;