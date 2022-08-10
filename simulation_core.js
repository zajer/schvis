
function SimObject(objectId, initAttrs) {
	this.id = objectId;	
	this.attributes = (function () {
			if ( ! initAttrs instanceof Map )
				throw new TypeError ('initAttrs should be of type Map');
			else
				return initAttrs;
		}) ();
}
/*
var roleParticipationFun = 
	{
		outputAttrName : "yolo",
		impactfulRoleId : 3,
		impactfulAttrs : [ "abc","def"],
		funIfOutAttrExists : function(val) { return 0; }, //jezeli null to usuwam
		funIfOutAttrNotExists : function() { return 1; }
	}
*/
function SimRoleFun (outputAttributeName, impactfulRoleId, impactfulAttributes, funIfOutAttrExists, funIfOutAttrNotExists) {
	this.outAttrName = outputAttributeName;
	this.impactfulAttrs = impactfulAttributes;
	this.impactfulRoleId = impactfulRoleId;
	this.funIfOutAttrExists = funIfOutAttrExists;
	this.funIfOutAttrNotExists = funIfOutAttrNotExists;
}

/*
var roleModifier = [ rolePartFun1, rolePartFun2, ...];
*/
//Roles are numbered from 0
function SimActAbstRole(roleId,ongoingActivityModifier,finishedActivityModifier) {
	(function () {
		let areRoleModifiersValid = ongoingActivityModifier.every ( (element) => { 
			return element instanceof SimRoleFun; 
			})
		if (! areRoleModifiersValid)
			throw new TypeError("ongoingActivityModifier must contain objects of type SimRoleFun");
		
		areRoleModifiersValid = finishedActivityModifier.every ( (element) => { 
			return element instanceof SimRoleFun; 
			})
		if (! areRoleModifiersValid)
			throw new TypeError("finishedActivityModifier must contain objects of type SimRoleFun");
	}) ();
	this.id = roleId;
	this.ongoingMod = 
	/*( function () {
		let areRoleModifiersValid = ongoingActivityModifier.every ( (element) => { 
			return element instanceof SimRoleFun; 
			})
		if (! areRoleModifiersValid)
			throw "ongoingActivityModifier must contain objects of type SimRoleFun"
		else
			return ongoingActivityModifier;
	
	}) ();*/ ongoingActivityModifier;
	this.finishedMod = finishedActivityModifier;
}

function SimAbstActivity(rolesArray, activityType, duration){
	this.roles =  ( function () { 
		let areRolesValid = rolesArray.every ( (element) => { 
			return element instanceof SimActAbstRole; 
			})
		if (! areRolesValid)
			throw "rolesArray must contain objects of type SimActAbstRole"
		else
			return rolesArray;
		}) ();
	this.type = activityType;
	this.duration = duration;
}
//można stąd usunąć i przenieść do utils (?)
/*
const availableAbstActivities = new Map();

function addAbstActivity(abstActivity){
	availableAbstActivities.set(abstActivity.type, abstActivity);	
}

function getAbstActivityByType(type){
	return availableAbstActivities.get(type);
}
*/
function SimActRole(abstActRole, objectPerformingRole) {
	this.id = abstActRole.id;
	this.ongoingMod = abstActRole.ongoingMod;
	this.finishedMod = abstActRole.finishedMod;
	this.obj = objectPerformingRole;
}
/*
function makeActRole(activityType, roleId, objPerfRole) {
	let abstAct = getAbstActivity(activityType);
	let abstRole = abstAct.roles[roleId];
	return SimActRole(abstRole, objPerfRole);
}
*/

const SimActivityStatus = {
	NotStarted: 0,
	Started: 1,
	Finished: 2
}

function SimActivity(abstAct, rolesToObj, startTime) {
	this.roles=( function () { 
		return abstAct.roles.map( (abstRole, idx) => { 
				if ( ! rolesToObj[idx] instanceof SimObject )
					throw "rolesToObj array must contain objects of type SimObject";
			return new SimActRole(abstRole, rolesToObj[idx]); } ) 
	}) (),
	this.type = abstAct.type;
	this.start = startTime;
	this.end = (() => { return (abstAct.duration > 0) ? (startTime + abstAct.duration - 1) : (startTime + abstAct.duration); }) (); // activities that take 0 time are treated the same as those that take 1 unit of time to complete
	this.status = SimActivityStatus.NotStarted;
}

function applyRoleFun (modifiedObj, appliedFun, allRoles) {
	let requiredAttrs = appliedFun.impactfulAttrs;
	let requiredValues = requiredAttrs.map( (attr) => {
			let impactfulRole = allRoles[appliedFun.impactfulRoleId];
			let objectPerformingAboveRole = impactfulRole.obj;
			return objectPerformingAboveRole.attributes.get(attr);
		});
	if (modifiedObj.attributes.has( appliedFun.outAttrName ) ) {
		let currentAttrValue = modifiedObj.attributes.get ( appliedFun.outAttrName ) ;
		appliedFun.funIfOutAttrExists ( modifiedObj, currentAttrValue, ...requiredValues);
	}
	else {
		appliedFun.funIfOutAttrNotExists ( modifiedObj, ...requiredValues);
	}
}

function performActRole(performedRole, allRoles, parentActivityStatus) {
	let roleFunctionsToApply;
	if (parentActivityStatus == SimActivityStatus.Started)
		roleFunctionsToApply = performedRole.ongoingMod;
	else
		roleFunctionsToApply = performedRole.finishedMod;
	
	roleFunctionsToApply.forEach( (appliedRoleFun) => {
			applyRoleFun( performedRole.obj, appliedRoleFun, allRoles);
		});
}

function performActRoles(activity){
	activity.roles.forEach( (role) => { 
		performActRole(role, activity.roles, activity.status);
	});
}

function startActivity (activity) {
	activity.status = SimActivityStatus.Started;
	performActRoles(activity);
}

function finishActivity (activity) {
	activity.status = SimActivityStatus.Finished;
	performActRoles(activity);
}
