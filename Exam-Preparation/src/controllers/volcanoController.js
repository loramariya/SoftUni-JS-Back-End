import { Router } from "express";
import volcanoService from "../services/volcanoService.js";
import { getErrorMessage } from "../utils/errorUtils.js";
import { isAuth } from "../middlewares/authMiddleware.js";

const volcanoController = Router();

volcanoController.get('/', async (req, res) => {
    const volcanoes = await volcanoService.getAll().lean();

    res.render('volcano', { volcanoes, title: 'Volcano Catalog' });
});

volcanoController.get('/create', isAuth, (req, res) => {
    const volcanoTypes = getVolcanoTypeViewData({});

    res.render('volcano/create', { volcanoTypes, title: 'Create Page' });
});

volcanoController.post('/create', isAuth, async (req, res) => {
    const volcanoData = req.body;
    const userId = req.user._id;

    try {
        await volcanoService.create(volcanoData, userId);

        res.redirect('/volcanoes');
    } catch (err) {
        const error = getErrorMessage(err);
        const volcanoTypeData = getVolcanoTypeViewData(volcanoData);

        res.render('volcano/create', { volcano: volcanoData, volcanoTypes: volcanoTypeData, error, title: 'Create Page' });
    }
});

volcanoController.get('/search', async (req, res) => {
    const query = req.query
    const volcanoes = await volcanoService.getAll(query).lean();
    const volcanoTypes = getVolcanoTypeViewData(query)

    res.render('volcano/search', { title: 'Search', volcanoes, query, volcanoTypes })
});

volcanoController.get('/:volcanoId/details', async (req, res) => {
    const volcano = await volcanoService.getOne(req.params.volcanoId).lean();
    const isOwner = volcano.owner.toString() === req.user?._id;
    const isVoted = volcano.voteList?.some(userId => userId.toString() === req.user?._id);
    const voteCount = volcano.voteList?.length || 0;

    res.render('volcano/details', { volcano, title: 'Details Page', isOwner, isVoted, voteCount })
});

volcanoController.get('/:volcanoId/vote', isAuth, async (req, res) => {
    const volcanoId = req.params.volcanoId;
    const userId = req.user._id;
   
    if (await isVolcanoOwner(volcanoId, userId)) {
        return res.redirect(`/404`)
    }

    try {
        await volcanoService.vote(volcanoId, userId);

        res.redirect(`/volcanoes/${volcanoId}/details`);
    } catch (err) {
        console.log(err);
    }
});

volcanoController.get('/:volcanoId/delete', isAuth, async (req, res) => {
    if (!isVolcanoOwner(req.params.volcanoId, req.user._id)) {
        return res.redirect('/404');
    }

    try {
        await volcanoService.remove(req.params.volcanoId);

        res.redirect('/volcanoes');
    } catch (err) {
        console.log(err);
    }
});

volcanoController.get('/:volcanoId/edit', isAuth, async (req, res) => {
    const volcano = await volcanoService.getOne(req.params.volcanoId).lean();
    const volcanoTypes = getVolcanoTypeViewData(volcano);
    const isOwner = volcano.owner.toString() === req.user._id;

    if (!isOwner) {
        return res.redirect('/404');
    }

    res.render('volcano/edit', { title: 'Edit Page', volcano, volcanoTypes });
});

volcanoController.post('/:volcanoId/edit', isAuth, async (req, res) => {
    const volcanoData = req.body;
    const volcanoId = req.params.volcanoId;

    if (!isVolcanoOwner(volcanoId, req.user._id)) {
        return res.redirect('/404');
    }

    try {
        await volcanoService.edit(volcanoId, volcanoData);

        res.redirect(`/volcanoes/${volcanoId}/details`);
    } catch (err) {
        const volcanoData = req.body;
        const volcanoTypes = getVolcanoTypeViewData(volcanoData);
        const error = getErrorMessage(err);

        res.render('volcano/edit', { title: 'Edit Page', volcano: volcanoData, volcanoTypes, error });
    }
});

function getVolcanoTypeViewData({ typeVolcano }) {
    const volcanoTypes = [
        'Supervolcanoes',
        'Submarine',
        'Subglacial',
        'Mud',
        'Stratovolcanoes',
        'Shield',
    ];

    const viewData = volcanoTypes.map(type => ({
        value: type,
        label: type,
        selected: typeVolcano === type ? 'selected' : ''
    }));

    return viewData;
};

async function isVolcanoOwner(volcanoId, userId) {
    const volcano = await volcanoService.getOne(volcanoId);
    const isOwner = volcano.owner.toString() === userId;

    return isOwner;
}

export default volcanoController;