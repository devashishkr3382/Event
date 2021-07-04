User
id(PK)INT name VARCHAR

Events
id(PK) INT,startDate DATE,EndDate DATE,StartTime TIME,EndTime TIME,rec BINARY,name VARCHAR,userid(FK) INT,recdays JSON

change
id(PK) INT,startDate DATE,startTime TIME,endTime TIME,eventid(FK) INT,userid INT


Pseudo Code
-------------
Pre-requisites
1. server should be up
2. DB should be up
3. UserID should exist in user table
4. Date formate should be 'YYYY-MM-DD'

a. Functionality1:User should be able to add an event which occurs on a fixed date and time
-------------------------------------------------------------------------------------------
//validates inputs are correct or not
isValidRequest(payload){
	if(all required field present)
		true
	else
		send(Bad Request)
}
//checks overlapping for non-recurring events and non-recurring requests
isOverlappingNonRec(reqStartTime,reqEndTIme){
	all_events = db.getEventsByUserID();
	overlapping filter((event)=>{
		if(event.endTime>reqStartTime && event.startTime<reqEndTIme){//overlapping condition
			return true;	
		}
	})
}
//checks overlapping for recurring events
isOverlappingNonRec(reqStartTime,reqEndTIme){
	let overlappingEvents = response.filter((e) => {
            return (startTime < e.endtime && endTime > e.starttime);
        })//array_of_overlapping events on basis of request
	if(overlapping.length==0)
	{
	next()//Valid Request
	}
	else{
	for(every overlapping events in overlapping array){
	if(req.recurring == true && overlapping[current].recurring == true){// if insert request is recurring event and current element in overlapping array is also recurring
			 overlappingEvents[i].recdays = JSON.parse(overlappingEvents[i].recdays)//get recurring days
                if (startDate < overlappingEvents[i].enddate && (endDate || '9999-12-31') > overlappingEvents[i].startdate) { //check if recurring dates are in overlapping range
                    isNotOverLapping = overlappingEvents[i].recdays.every((e) => !recdays.includes(e))//if recurring days are matching
                    if (!isNotOverLapping)
                        break;
                }
			}
	else if (overlappingEvents[i].rec == true && !rec) {//if insert request is non-recurring event and current element in overlapping array is recurring
                const day = moment(new Date(overlappingEvents[i].startdate).get('day'));//get day of request e.g 'sunday'=0,'monday'=1,...
                if (startDate < (overlappingEvents[i].enddate || '9999-12-31') && startDate > overlappingEvents[i].startdate) {//if dates are in overlapping range
                    isNotOverLapping = !overlappingEvents[i].recdays.includes(day)//if requested day is among recurring days
                    if (!isNotOverLapping)
                        break;
                }
            }
	else if (overlappingEvents[i].rec == false && rec) {//if insert request is recurring event and current element in overlapping array is not recurring
                if (overlappingEvents[i].startdate < (endDate || '9999-12-31') && overlappingEvents[i].startdate > startDate) {//check ifdates are in overlapping area
                    isNotOverLapping = !recdays.includes(moment(new Date(overlappingEvents[i].startdate).get('day')));//get the day for current overlapping event e.g 'sunday'=0,'monday'=1,...
                    if (!isNotOverLapping)
                        break;
                }
            }
	if (overlappingEvents[i].rec == false && rec == false) {//if insert request is recurring event and current element in overlapping array is not recurring
                next();//handled previously
            }
		}
	}
}
addToDB(payload)

b. User should be able to add a recurring event
--------------------------------------------------

1. repeat steps same as in 1st functionality with below change
2. the payload will contain recurrence(true)
3. endDate is specified then default 9999-12-31 is inserted else specified enDate in inserted into DB

c. User should be able to alter one instance of an already existing recurring event
-------------------------------------------------------------------------------------

				let changedEvents = getChangedEvents(eventid);//get all events from change table
				changedEventsOverlapping = changedEvents.filter((e)=>e.eventid == eventid && startDate == e.startdate)//events which are already present for requested day
				if(changedEventsOverlapping.length == 0)//no such event dates
				{
				insertNew(startDate,eventid,changedStartTime,ChangedEndTime);
				}
				else{
				updateChnageTable(changedStartTime,ChangedEndTime)
				}
				
d. User should be able to alter an already existing recurring event from one instance onwards
------------------------------------------------------------------------------------------------

	{
	update event Table with new startTime and EndTime where eventid = requestedID
	}
	
e. User should be able to fetch the calendar for the given date range, start date and end date
both inclusive
-------------------------------------------------------------------------------------------------
input = userid,eventid,startDate,enddate
getAllEvents for userid from Event Table where startDate and EndDate is in range
getChangedEvents from change table for userid where startDate<=changedStartDate<=endDate
create a result array
for(let event of getAllEvents){
if(event is recurring){
loop through all dates untill enddate
check if getChangedEvents.includes(currentDate){
arr.push(getChangedEvents)}
}
else arr.push(event);
}
