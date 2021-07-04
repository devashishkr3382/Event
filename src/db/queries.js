
const connection = require('./connect');
const moment = require('moment');

const insertEvent = (payload) => {
    let { eventName = "Default", startDate, startTime, endTime, userid, endDate = null, rec = false } = payload;
    let recdays = payload.recdays || [];
    startDate = moment(new Date(startDate)).format('YYYY-MM-DD');
    endDate = endDate && moment(new Date(endDate)).format('YYYY-MM-DD');//null will output as null
    if (rec) {
        endDate = endDate || '9999-12-31';
        query = `insert into event(startdate,enddate,starttime,endtime,rec,name,userid,recdays) values(DATE('${startDate}'),DATE('${endDate}'),'${startTime}','${endTime}',${rec},'${eventName}',${userid},'[${recdays}]')`;
    }
    else
        query = `insert into event(startdate,starttime,endtime,rec,name,userid) values(DATE('${startDate}'),'${startTime}','${endTime}',${rec},'${eventName}',${userid})`;
    return new Promise((resolve, reject) => {
        connection.query(query, (err, result, field) => {
            if (err)
                return reject(err);
            else
                return resolve(result)
        })
    })
}
const getEventByDate = (id, startDate, endDate) => {
    startDate = startDate && moment(startDate).format('YYYY-MM-DD');
    endDate = endDate && moment(endDate).format('YYYY-MM-DD');
    if (startDate && endDate)
        query = `select id,name,startdate,enddate,starttime,endtime,rec,recdays from event where userid=${id} AND STARTdate>=DATE('${startDate}') AND startdate<=DATE('${endDate}');`;
    else if (startDate && !endDate)
        query = `select id,name,startdate,enddate,starttime,endtime,rec,recdays from event where userid=${id} AND STARTdate>=DATE('${startDate}');`;
    else if (!startDate && endDate)
        query = `select id,name,startdate,enddate,starttime,endtime,rec,recdays from event where userid=${id} AND endDate<=DATE('${endDate}');`;
    else
        query = `select id,name,startdate,enddate,starttime,endtime,rec,recdays from event where userid=${id};`;

    return new Promise((resolve, reject) => {
        connection.query(query, (err, result, field) => {
            if (err)
                return reject(err);
            else
                return resolve(result)
        })
    })
}

const insertUser = (payload) => {
    let { name = "anonymous", id } = payload;
    query = `insert into user(id,name) values(${id},'${name}')`;
    return new Promise((resolve, reject) => {
        connection.query(query, (err, result, field) => {
            if (err)
                return reject(err);
            else
                return resolve(result)
        })
    })
}

const getEventById = (userid) => {
    return getEventByDate(userid);
}
const getEventByIdAndUserId = (eventid, userid) => {
    return new Promise((resolve, reject) => {
        const query = `select id,name,startdate,enddate,starttime,endtime,rec,recdays from event where userid=${userid} and id=${eventid};`;
        connection.query(query, (err, result, field) => {
            if (err)
                return reject(err);
            else
                return resolve(result)
        })
    })
}
const getChangedEventByIdAndUserId = async (eventid) => {
    try {
        const query = `select * from change where eventid=${eventid};`;
        return new Promise((resolve, reject) => {
            connection.query(query, (err, result, field) => {
                if (err)
                    return reject(err);
                else
                    return resolve(result)
            })
        })
    } catch (e) {
        throw new Error("Not Authorized")
    }
}
const updateEvent = async (payload, userid) => {
    try {
        let { startDate = null, startTime, endTime, eventid } = payload;
        startDate = moment(new Date(startDate)).format('YYYY-MM-DD');
        let event = await getEventByIdAndUserId(eventId);
        if (event.length == 0) {
            throw new Error("Not Found");
        }
        let changedEvent = await getChangedEventByIdAndUserId(eventid);
        if (startDate) {
            //update in change table
            if (!event.rec)
                throw new Error("Not Authorized");
            changedEvent = changedEvent.filter((e) => e.eventid == eventid && startDate == moment(new Date(e.startdate)).format('YYYY-MM-DD'));
            if (changedEvent.length == 0) {
                query = `insert into change(eventid,startdate,starttime,endtime) values(${eventid},DATE('${startDate}'),'${startTime}','${endTime}')`;
            }
            else {
                query = `update into change(startdate,starttime,endtime) values(DATE('${startDate}'),'${startTime}','${endTime}')`;
            }
        }
        else
            query = `update event set starttime=${startTime},endtime=${endTime} where id=${eventid} and userid=${userid}`;
        return new Promise((resolve, reject) => {
            connection.query(query, (err, result, field) => {
                if (err)
                    return reject(err);
                else
                    return resolve(result)
            })
        })
    } catch (e) {
        throw new Error("Bad Request");
    }
}
module.exports = { insertEvent, getEventByDate, insertUser, getEventById, updateEvent };