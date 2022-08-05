// potrzebne obiekty:
// availableAbstActs

function parseSimObj(obj) {
	let attrNamesArray = Object.getOwnPropertyNames(obj).filter( attrName => { return attrName != "id"; });
	let id = obj.id;
	let attrs = new Map();
	attrNamesArray.forEach( attr => { attrs.set(attr,obj[attr]); });
	return new SimObject(id, attrs);
}

function getAbstActivity(actType){
	let result = availableAbstActs.find ( abstAct => { return abstAct.type == actType; } );
	if (result == undefined) 
		throw "Requested abstract activity does not exist!";
	else
		return result;
}

function makeAct(actType, objToRoles, startTime) {
	let abstAct = getAbstActivity(actType);
	return new SimActivity(abstAct, objToRoles, startTime);
}

function sortActsByStartTime(activitiesToSort) {
	return activitiesToSort.sort( (act1,act2) => { 
		if (act1.start > act2.start)
			return 1;
		else if (act1.start == act2.start)
			return 0;
		else
			return -1;
	});
}
