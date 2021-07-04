const express = require('express');
const router = new express.Router();
const { validateEventInput, validateUser, validateOverlappingNoRec, validateOverlappingRec,validateUpdateInput } = require('./../utilities/utility');
const { insertEvent, getEventByDate, insertUser ,updateEvent} = require('./../db/queries')

router.post('/add', validateEventInput, validateOverlappingNoRec, validateOverlappingRec, async (req, res) => {
    try {
        // await insertEvent(req.body);
        res.status(201).send("Created");
    } catch (e) {
        res.status(401).send("User not authorized");
    }
})

router.patch('/modify/:id', validateUpdateInput, validateOverlappingNoRec, validateOverlappingRec, async (req, res) => {
    try {
        await updateEvent(req.body,req.params.id);
        res.status(201).send("Created");
    } catch (e) {
        console.log(e);
        res.status(401).send("User not authorized");
    }
})

router.post('/user', validateUser, async (req, res) => {
    try {
        await insertUser(req.body);
        res.status(201).send("Created");
    } catch (e) {
        res.status(400).send("Failed" + e);
    }
})

router.get('/getEvent/:id', async (req, res) => {
    const { startDate, endDate } = req.query;
    const id = req.params.id
    try {
        const response = await getEventByDate(id, startDate, endDate);
        res.status(200).send(response);
    } catch (e) {
        res.status(400).send("Failed" + e);
    }
})

module.exports = router;