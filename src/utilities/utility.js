const EventSchema = require('./eventSchema.json');
const UserSchema = require('./userSchema.json');
const updateSchema  = require('./eventUpdateSchema.json');
const { getEventById } = require('./../db/queries');
const moment = require('moment');

//requesting non-recurring and checking with non-recurring
const validateOverlappingNoRec = async (req, res, next) => {
    try {
        let { userid, startDate, startTime, endTime, rec ,eventid} = req.body;
        userid = req.params.id || userid;
        let response = await getEventById(userid);
        if(eventid){
            response = response.filter((e)=>e.id != eventid)
        }
        req.db_response = response;
        if (rec == false) {
            if (response.length == 0)
                return next();
            startDate = moment(new Date(startDate)).format('YYYY-MM-DD');
            const isNotOverLapping = response.every((e) => {
                e.startdate = moment(new Date(e.startdate)).format('YYYY-MM-DD');
                if (!e.rec && (startDate == e.startdate)) {
                    return !(startTime < e.endtime && endTime > e.starttime);
                }
                return true;
            })
            if (!isNotOverLapping)
                return res.status(400).send("Overlapping");
        }
        next();
    } catch (e) {
        res.status(404).send("Failed" + e);
    }
}

//1. req recur 2. req non-recur-event-recur 3. req recur-db non recur
const validateOverlappingRec = async (req, res, next) => {
    try {
        const { startDate, endDate, startTime, endTime, rec, recdays } = req.body;
        const response = req.db_response;
        let isNotOverLapping = true;
        if (response.length == 0)
            return next();
        //time match then go for further
        let overlappingEvents = response.filter((e) => {
            return (startTime < e.endtime && endTime > e.starttime);
        })
        if (overlappingEvents.length == 0)
            return next();
        //match recurring days
        for (let i = 0; i < overlappingEvents.length; i++) {
            overlappingEvents[i].enddate = moment(new Date(overlappingEvents[i].enddate)).format('YYYY-MM-DD');
            overlappingEvents[i].startdate = moment(new Date(overlappingEvents[i].startdate)).format('YYYY-MM-DD');
            if (overlappingEvents[i].rec == false && rec == false) {
                next();//handled previously
            }
            //when req is recurring and event is not
            else if (overlappingEvents[i].rec == false && rec) {
                if (overlappingEvents[i].startdate < (endDate || '9999-12-31') && overlappingEvents[i].startdate > startDate) {
                    isNotOverLapping = !recdays.includes(moment(new Date(overlappingEvents[i].startdate).get('day')));
                    if (!isNotOverLapping)
                        break;
                }
            }
            //when req is non-recurring and event is rec
            else if (overlappingEvents[i].rec == true && !rec) {
                const day = moment(new Date(overlappingEvents[i].startdate).get('day'));
                if (startDate < (overlappingEvents[i].enddate || '9999-12-31') && startDate > overlappingEvents[i].startdate) {
                    isNotOverLapping = !overlappingEvents[i].recdays.includes(day)
                    if (!isNotOverLapping)
                        break;
                }
            }
            else if (overlappingEvents[i].rec == true && rec) {
                overlappingEvents[i].recdays = JSON.parse(overlappingEvents[i].recdays)
                if (startDate < overlappingEvents[i].enddate && (endDate || '9999-12-31') > overlappingEvents[i].startdate) {
                    isNotOverLapping = overlappingEvents[i].recdays.every((e) => !recdays.includes(e))
                    if (!isNotOverLapping)
                        break;
                }
            }
        }
        if (!isNotOverLapping)
            return res.status(404).send('Overlapping');
        next();
    } catch (e) {
        return res.status(404).send("Failed");
    }
}

const validateEventInput = (req, res, next) => {
    const payload = req.body;
    let isValid = true;
    const startDate = payload.startDate;
    const endDate = payload.endDate;
    if (!(payload.startDate && moment(new Date(startDate)).isValid()))
        isValid = false;
    else if (payload.endDate && !moment(new Date(endDate)).isValid())
        isValid = false;
    else if (startDate && endDate && moment(new Date(startDate)) >= moment(new Date(endDate))) {
        isValid = false;
    }
    else
        isValid = Object.keys(payload).every((e) => EventSchema.includes(e));
    if (!isValid)
        return res.status(400).send("Invalid Event");
    next()
}

const validateUpdateInput = (req,res,next)=>{
    const payload = req.body;
    let isValid = true;
    const startDate = payload.startDate;
    if (startDate && !( moment(new Date(startDate)).isValid()))
        isValid = false;
    else
        isValid = Object.keys(payload).every((e) => updateSchema.includes(e));
    if (!isValid)
        return res.status(400).send("Invalid Event");
    next()
}

const validateUser = (req, res, next) => {
    const payload = req.body;
    const isValid = Object.keys(payload).every((e) => UserSchema.includes(e));
    if (!isValid)
        return res.status(400).send("Invalid User");
    next()
}

module.exports = { validateEventInput, validateUser, validateOverlappingNoRec, validateOverlappingRec,validateUpdateInput };