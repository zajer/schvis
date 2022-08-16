// 70% na obszary , 20% przerwy pomiędzy obszarami, 10% margines wokół obszarów
const marginRatio = 0.1;
const usefulRatio = 0.7;
const spaceRatio = 0.2;

function sizeOfArea (canvasWidth, canvasHeight){
	let availXForAreas = canvasWidth*usefulRatio;
	let availYForAreas = canvasHeight*usefulRatio;
	
	return [availXForAreas/noCols, availYForAreas/noRows];
}
// Po każdym (z wyjątkiem ostatniego w wierszu, jak i kolumnie) obszarze jest przerwa zarówno w pionie i poziomie
function lengthOfSpace (canvasWidth, canvasHeight){
	let resXForSpace = canvasWidth*spaceRatio;
	let resYForSpace = canvasHeight*spaceRatio;
	
	return [ noCols > 1 ? resXForSpace/(noCols-1) : resXForSpace, noRows > 1 ? resYForSpace/(noRows-1) : resYForSpace];
}

function droneRadius (canvasWidth,canvasHeight){
	let [xLength, yLength] = sizeOfArea(canvasWidth, canvasHeight);
	// tyle w rzędzie aby wszystkie mieściły się w co najmniej dwóch rzędach
	// tyle rzędów aby noDrones się zmieściło
	/*
	if (xLength/5 < 25)
		return xLength/2
	else
	*/
	return Math.min(xLength, yLength)/(2*noDrones);
	//return 25;
}

function areaCoordinates(row, col, canvasWidth, canvasHeight){
	let [spaceX, spaceY] = lengthOfSpace( canvasWidth, canvasHeight);
	let [lengthX, lengthY] = sizeOfArea (canvasWidth, canvasHeight);
	let resultX = canvasWidth*(marginRatio*0.5) + (col-1)*spaceX + (col-1)*lengthX;
	let resultY = canvasHeight*(marginRatio*0.5) + (row-1)*spaceY + (row-1)*lengthY;
	
	return [resultX, resultY];
}

function shiftCoordinatesOfDronesBasedOnTheirPlacement(place, canvasWidth, canvasHeight) {
	let [xLength, yLenght] = sizeOfArea(canvasWidth,canvasHeight);
	let radius = droneRadius(canvasWidth, canvasHeight);
	let numberOfDronesInRow = Math.floor(xLength/(2*radius));
	let rowForDrone = Math.ceil(place/numberOfDronesInRow);
	let colForDrone = place - (rowForDrone-1)*numberOfDronesInRow;
	
	return [colForDrone*radius*2-radius, rowForDrone*2*radius-radius];
}
// Abstract activity: move
// Abstract activity: move ; role 0 
// - decrease objects count from an area the transitioning object is moving away from
let aa1r0_going_f1 = new SimRoleFun (
		"objCount", //output attribute
		-1, //role id this function needs attributes from
		[], //required attributes
		(modifiedObj,currentObjCount) => {modifiedObj.attributes.set('objCount',currentObjCount-1);},
		() => {throw "aa1r0_going_f1 should not call the function for the case when the output attribute does not exist!";}
	);
// Abstract activity: move ; role 1 
// - add a temporary attribute "dest_pos" indicating the final position of the transitioning object
let aa1r1_going_f1 = new SimRoleFun (
		"dest_pos",
		2,
		["posXY"], 
		() => {throw "aa1r2_going_f1 should not call the function for the case when the output attribute does exist!";},
		(modifiedObj,destinationPos) => {modifiedObj.attributes.set('dest_pos',destinationPos);}
	);
// - set a flag "is_moving" indicating that transitioning object is moving  
let aa1r1_going_f2 = new SimRoleFun (
		"is_moving",
		-1,
		[],
		(modifiedObj,currentPos) => {modifiedObj.attributes.set('is_moving',true);},
		modifiedObj => {modifiedObj.attributes.set('is_moving',true);}
	);
// - add a temporary attribute "dest_place" indicating which place the transitioning object will take after transition is finished
let aa1r1_going_f3 = new SimRoleFun (
		"dest_place",
		2,
		["objCount"],
		() => {throw "aa1r2_going_f3 should not call the function for the case when the output attribute does exist!";},
		(modifiedObj,objCount) => {modifiedObj.attributes.set('dest_place',objCount+1);}
	);
// (when activity is finished) - set a flag "is_moving" indicating that moving object is not moving anymore
let aa1r1_finished_f1 = new SimRoleFun (
		"is_moving",
		-1,
		[],
		(modifiedObj,currentVal) => {modifiedObj.attributes.set('is_moving',false);},
		modifiedObj => {throw "aa1r2_finished_f1 should not call the function for the case when the output attribute does not exist!";}
	);
// (when activity is finished) - change the position of moving moving object, remove the temporary attribute "dest_post"
let aa1r1_finished_f2 = new SimRoleFun (
		"dest_pos",
		-1,
		[],
		(modifiedObj,destPos) => {
		modifiedObj.attributes.set('posXY',destPos);
		modifiedObj.attributes.delete('dest_pos');
		},
		modifiedObj => {throw "aa1r2_finished_f2 should not call the function for the case when the output attribute does not exist!";}
	);
// 
let aa1r1_finished_f3 = new SimRoleFun (
		"dest_place",
		-1,
		[],
		(modifiedObj,destPlace) => {
		modifiedObj.attributes.set('place',destPlace);
		modifiedObj.attributes.delete('dest_place');
		},
		modifiedObj => {throw "aa1r2_finished_f2 should not call the function for the case when the output attribute does not exist!";}
	);
let aa1r2_going_f1 = new SimRoleFun (
		"objCount",
		-1,
		[], 
		(modifiedObj,currentObjCount) => {modifiedObj.attributes.set('objCount',currentObjCount+1);},
		() => {throw "aa1r1_going_f1 should not call the function for the case when the output attribute does not exist!";}
	);
let aa1r0 = new SimActAbstRole(0,[aa1r0_going_f1],[]);
let aa1r1 = new SimActAbstRole(1,[aa1r1_going_f1,aa1r1_going_f2,aa1r1_going_f3],[aa1r1_finished_f1,aa1r1_finished_f2,aa1r1_finished_f3]);
let aa1r2 = new SimActAbstRole(2,[aa1r2_going_f1],[]);
// Making abstract activity that has the above three roles and taking 1 unit of time
let aa1 = new SimAbstActivity([aa1r0,aa1r1,aa1r2], "move", 1);
// Abstract activity: init
// Abstract activity: init ; role 0
// - marks uav as initiated
let aa2r0_going_f1 = new SimRoleFun (
		"is_initiated",
		-1,
		[],
		(modifiedObj) => {modifiedObj.attributes.set('is_initiated',true);},
		(modifiedObj) => {modifiedObj.attributes.set('is_initiated',true);}
	);
// Abstract activity: init ; role 1
// - marks an area where the uav is located
let aa2r1_going_f1 = new SimRoleFun (
		"is_marked",
		-1,
		[],
		(modifiedObj) => {modifiedObj.attributes.set('is_marked',true);},
		(modifiedObj) => {modifiedObj.attributes.set('is_marked',true);}
	);
let aa2r0 = new SimActAbstRole(0,[aa2r0_going_f1],[]);
let aa2r1 = new SimActAbstRole(1,[aa2r1_going_f1],[]);
let aa2 = new SimAbstActivity([aa2r0,aa2r1], "init", 0);
// Abstract activity: mark
// Abstract activity: mark ; role 0
// it has no modyfing functions
// Abstract activity: mark ; role 1
// - marks an area adjacent to where an uav is
let aa3r1_going_f1 = new SimRoleFun (
		"is_marked",
		-1,
		[],
		(modifiedObj) => {modifiedObj.attributes.set('is_marked',true);},
		(modifiedObj) => {modifiedObj.attributes.set('is_marked',true);}
	);
let aa3r0 = new SimActAbstRole(0,[],[]);
let aa3r1 = new SimActAbstRole(1,[aa3r1_going_f1],[]);
let aa3 = new SimAbstActivity([aa3r0,aa3r1], "mark", 0);
// Abstract activity: download
// Abstract activity: download ; role 0
// - marks uav as downloading containing data
let aa4r0_going_f1 = new SimRoleFun (
		"is_downloading",
		-1,
		[],
		(modifiedObj) => {throw "aa4r0_going_f1 should not call the function for the case when the output attribute does exist!";},
		(modifiedObj) => {modifiedObj.attributes.set('is_downloading',true);}
	);
// - deletes initialization flag
let aa4r0_going_f2 = new SimRoleFun (
		"is_initiated",
		-1,
		[],
		(modifiedObj) => {modifiedObj.attributes.set('is_initiated',false);},
		(modifiedObj) => {throw "aa4r0_going_f2 should not call the function for the case when the output attribute does not exist!";}
	);
// - marks uav as containing data
let aa4r0_finished_f1 = new SimRoleFun (
		"done_downloading",
		-1,
		[],
		(modifiedObj) => {throw "aa4r0_going_f1 should not call the function for the case when the output attribute does exist!";},
		(modifiedObj) => {
			modifiedObj.attributes.set('done_downloading',true);
			modifiedObj.attributes.set('is_downloading',false);
			}
	);
let aa4r0 = new SimActAbstRole(0,[aa4r0_going_f1,aa4r0_going_f2],[aa4r0_finished_f1]);
let aa4 = new SimAbstActivity([aa4r0], "download", 2);
// Abstract activity - land
// Abstract activity: land ; role 0
// - sets a flag indicating that a uav has landed
let aa5r0_going_f1 = new SimRoleFun (
		"has_landed",
		-1,
		[],
		(modifiedObj) => {throw "aa5r0_going_f1 should not call the function for the case when the output attribute does exist!";},
		(modifiedObj) => {modifiedObj.attributes.set('has_landed',true);}
	);
let aa5r0 = new SimActAbstRole(0,[aa5r0_going_f1],[]);
let aa5 = new SimAbstActivity([aa5r0], "land", 1);
// This variable allows to use a facade function named "makeAct" defined in simulation_utils.js
let availableAbstActs = [aa1,aa2,aa3,aa4,aa5];

let drawerFunAreas = (canvas, objAttrs) => {
	if (objAttrs.get('type') != 'area')
		return AnimationStatus.Finished;
	else {
		let domRect = canvas.getBoundingClientRect();
		let canvasWidth = domRect.width;
		let canvasHeight = domRect.height;
		
		let [posX,posY] = objAttrs.get('posXY');
		let areaId = objAttrs.get('areaId');
		let [x,y] = areaCoordinates(posX, posY, canvasWidth, canvasHeight);
		let [xLength, yLength] = sizeOfArea(canvasWidth, canvasHeight);
		
		let ctx = canvas.getContext('2d');
		let textSize = Math.ceil(yLength/10);
		ctx.save();
		ctx.beginPath();
		ctx.lineWidth = "2";
		let is_area_marked = objAttrs.get('is_marked');
		ctx.strokeStyle = is_area_marked ? "orange" : "green";
		ctx.rect(x, y, xLength, yLength);
		ctx.stroke();
		ctx.font = 2*textSize+"px Arial";
		ctx.fillStyle = "white";
		ctx.strokeStyle = "black";
		let metrics = ctx.measureText(areaId);
		ctx.fillText(areaId, x+xLength-metrics.width-5, y+yLength-5);
		ctx.lineWidth = "1";
		ctx.strokeText(areaId, x+xLength-metrics.width-5, y+yLength-5);
		ctx.lineWidth = "2";
		
		if ( objAttrs.get('has_hq') ) {
			ctx.font = 2*textSize+"px Arial";
			ctx.fillStyle = "white";
			ctx.strokeStyle = "blue";
			metrics = ctx.measureText("H");
			ctx.strokeText("H", x+metrics.width-5, y+yLength-5);
			ctx.fillText("H", x+metrics.width-5, y+yLength-5);
		}
		
		ctx.restore();
		
		return AnimationStatus.Finished;
	}
};


let drawerFunDrones_dynamic = (canvas, objAttrs) => {
	let resultAnimStatus = AnimationStatus.Finished;
	if (objAttrs.get('type') != 'uav')
		return resultAnimStatus;
	else {
		let domRect = canvas.getBoundingClientRect();
		let canvasWidth = domRect.width;
		let canvasHeight = domRect.height;
		
		let [posX,posY] = objAttrs.get('posXY');
		let [x,y] = areaCoordinates(posX, posY, canvasWidth, canvasHeight);
		let [xShift,yShift] = shiftCoordinatesOfDronesBasedOnTheirPlacement(objAttrs.get("place"), canvasWidth, canvasHeight);
		
		let ctx = canvas.getContext('2d');
		ctx.save();
		if( objAttrs.get('is_moving') == true ) {
			resultAnimStatus = AnimationStatus.Going;
			let animSpeed = 3;
			
			
			let [destAreaPosX, destAreaPosY] = objAttrs.get('dest_pos');
			let [xDest,yDest] = areaCoordinates(destAreaPosX, destAreaPosY, canvasWidth, canvasHeight);
			let [xDestShift,yDestShift] = shiftCoordinatesOfDronesBasedOnTheirPlacement(objAttrs.get("dest_place"), canvasWidth, canvasHeight);
			
			let dirFun = val => { if (val > 0) return 1; else if (val < 0) return -1; else return 0; };
			let xDir = dirFun ((xDest+xDestShift)-(x+xShift));
			let yDir = dirFun ((yDest+yDestShift)-(y+yShift));
			let moveShift = objAttrs.get('moveShift');
			moveShift = moveShift != undefined ? moveShift : [0,0];
			let [xMoveShift, yMoveShift] = moveShift;
			
			ctx.translate(xMoveShift, yMoveShift);
			
			let isXReached = false;
			let isYReached = false;
			
			if ( xDir > 0 ? (x+xShift+xMoveShift < xDest+xDestShift) : (x+xShift+xMoveShift > xDest+xDestShift) )
				moveShift[0] =  xMoveShift+animSpeed*xDir;
			else
				isXReached = true;
			
			if ( yDir > 0 ? (y+yShift+yMoveShift < yDest+yDestShift) : (y+yShift+yMoveShift > yDest+yDestShift) )
				moveShift[1] =  yMoveShift+animSpeed*yDir;
			else
				isYReached = true;
			
			if( isXReached && isYReached) {
				objAttrs.delete('moveShift');
				resultAnimStatus = AnimationStatus.Finished;
			}
			else
				objAttrs.set('moveShift',moveShift);
				
		}
		
		ctx.beginPath();
		ctx.lineWidth = "2";
		ctx.strokeStyle = "black";
		let radius = droneRadius(canvasWidth, canvasHeight);
		/*
		if ( objAttrs.get('is_initiated') )
			ctx.fillStyle = "red";
		else if ( objAttrs.get('is_downloading') )
			ctx.fillStyle = "yellow";
		else if ( objAttrs.get('done_downloading') )
			ctx.fillStyle = "orange";
		else
			ctx.fillStyle = "grey";
		*/
		ctx.fillStyle = droneColorFromAttrs(objAttrs);
		ctx.arc( x+xShift, y+yShift, radius, 0, 2 * Math.PI );
		ctx.fill();
		ctx.stroke();
		
		ctx.font = (3/5*2*radius)+"px Arial";
		ctx.fillStyle = "black";
		ctx.fillText(objAttrs.get('uavId'), x+xShift-(radius/3), y+yShift+(radius/2));
		ctx.restore();
		
		return resultAnimStatus;
	}
};
function droneColorFromAttrs(objAttrs){
	let result = "white"
	if ( objAttrs.get('is_initiated') )
		result =  "red";
	else if ( objAttrs.get('is_downloading') )
		result =  "yellow";
	else if ( objAttrs.get('done_downloading') )
		result =  "orange";
	if ( objAttrs.get('has_landed') )
		result =  "gray";
	
	return result;
}
let drawerFunDrones_trans = (canvas, objAttrs) => {
	if (objAttrs.get('type') != 'uav')
		return AnimationStatus.Finished;
	else {
		let domRect = canvas.getBoundingClientRect();
		let canvasWidth = domRect.width;
		let canvasHeight = domRect.height;
		
		let posX, posY;
		if (objAttrs.has('dest_pos'))
			[posX,posY] = objAttrs.get('dest_pos');
		else
			[posX,posY] = objAttrs.get('posXY');
		
		let place;
		if (objAttrs.has('dest_place'))
			place = objAttrs.get('dest_place');
		else
			place = objAttrs.get("place");
			
		let [x,y] = areaCoordinates(posX, posY, canvasWidth, canvasHeight);
		let [xShift,yShift] = shiftCoordinatesOfDronesBasedOnTheirPlacement(place, canvasWidth, canvasHeight);
		
		let ctx = canvas.getContext('2d');
		ctx.save();
		
		ctx.beginPath();
		ctx.lineWidth = "2";
		ctx.strokeStyle = "black";
		let radius = droneRadius(canvasWidth, canvasHeight);

		ctx.fillStyle = droneColorFromAttrs(objAttrs);
		ctx.arc( x+xShift, y+yShift, radius, 0, 2 * Math.PI );
		ctx.fill();
		ctx.stroke();
		
		ctx.font = (3/5*2*radius)+"px Arial";
		ctx.fillStyle = "black";
		ctx.fillText(objAttrs.get('uavId'), x+xShift-(radius/3), y+yShift+(radius/2));
		
		ctx.restore();
		
		return AnimationStatus.Finished;
	}
};
// download in progress indicator
let drawerFunDownloadIndicator_dynamic = (canvas, objAttrs) => {
	if (objAttrs.get('type') != 'uav' || objAttrs.get('is_downloading') != true )
		return AnimationStatus.Finished;
	else {
		let animSpeed = 3;
		let domRect = canvas.getBoundingClientRect();
		let canvasWidth = domRect.width;
		let canvasHeight = domRect.height;
		
		let [posX,posY] = objAttrs.get('posXY');
		let [x,y] = areaCoordinates(posX, posY, canvasWidth, canvasHeight);
		let [xShift,yShift] = shiftCoordinatesOfDronesBasedOnTheirPlacement(objAttrs.get("place"), canvasWidth, canvasHeight);
		let [xLength, yLength] = sizeOfArea (canvasWidth, canvasHeight);
		let [xSpace, ySpace] = lengthOfSpace (canvasWidth, canvasHeight);
		
		let ctx = canvas.getContext('2d');
		
		let progress = objAttrs.get('dli:progress');
		progress = progress != undefined ? progress : 0;
		progress += animSpeed;
		ctx.save();
		ctx.beginPath();
		ctx.lineWidth = "2";
		ctx.strokeStyle = "blue";
		//ctx.ellipse(x+xShift, y+yShift, xLength+xSpace, yLength+ySpace, 0 , 0, 2 * Math.PI);
		ctx.arc( x+xShift, y+yShift, progress, 0, 2 * Math.PI );
		ctx.stroke();
		
		objAttrs.set('dli:progress', progress > (xLength+xSpace > yLength+ySpace ? xLength+xSpace : yLength+ySpace) ? 0 : progress);
		
		ctx.restore();
		return AnimationStatus.Finished;
	}
		
}

let drawerFunDownloadIndicator_trans = (canvas, objAttrs) => {
	objAttrs.delete('dli:progress');
}

let drawerFunSimTime = canvas => {
	let timeCtx = canvas.getContext("2d");
	timeCtx.save();
	timeCtx.font = "30px Arial";
	timeCtx.strokeStyle = "blue";
	timeCtx.strokeText("Current time: "+ simulation.time, 10, 30);
	timeCtx.restore();
	return AnimationStatus.Finished;
};

let timeDrawer = new Drawer( drawerFunSimTime, drawerFunSimTime );
let areasDrawer = new Drawer(() => { return AnimationStatus.Finished; }, drawerFunAreas );
let dronesDrawer = new Drawer( drawerFunDrones_trans, drawerFunDrones_dynamic );
let dliDrawer = new Drawer(drawerFunDownloadIndicator_trans, drawerFunDownloadIndicator_dynamic  );
// ---------------------------------

const noRows=4;
const noCols=5;
const noDrones=3;

let simObjs = [
	{ id:"A0", posXY:[4,4], type:"area", objCount:2, areaId:0, has_hq: true },
	{ id:"A1", posXY:[4,3], type:"area", objCount:0, areaId:1 },
	{ id:"A2", posXY:[4,2], type:"area", objCount:0, areaId:2 },
	{ id:"A3", posXY:[4,1], type:"area", objCount:0, areaId:3 },
	{ id:"A4", posXY:[3,2], type:"area", objCount:0, areaId:4 },
	{ id:"A5", posXY:[3,4], type:"area", objCount:0, areaId:5 },
	{ id:"A6", posXY:[4,5], type:"area", objCount:0, areaId:6 },
	{ id:"A7", posXY:[1,5], type:"area", objCount:0, areaId:7 },
	{ id:"A8", posXY:[2,4], type:"area", objCount:0, areaId:8 },
	{ id:"A9", posXY:[1,4], type:"area", objCount:0, areaId:9 },
	
	{ id:"U1", posXY:[4,4], type:"uav", uavId:1, place:1 },
	{ id:"U3", posXY:[4,4], type:"uav", uavId:3, place:2 },
	{ id:"U2", posXY:[4,4], type:"uav", uavId:2, place:3 },
].map( obj => { return parseSimObj(obj); } );

let simCanvasWrapper = document.getElementById("sim-canvas-wrapper");
let simCanvas = document.getElementById("simulation");

let timeCanvasWrapper = document.getElementById("time-indicator-canvas-wrapper");
let timeCanvas = document.getElementById("time-indicator");

const usedCanvas = 
	[
		{wrapper:simCanvasWrapper, canvas: simCanvas},
		{wrapper:timeCanvasWrapper, canvas: timeCanvas} 
	];

const workingAnimators = [
	new Animator(simCanvas,simObjs[0],[areasDrawer]),
	new Animator(simCanvas,simObjs[1],[areasDrawer]),
	new Animator(simCanvas,simObjs[2],[areasDrawer]),
	new Animator(simCanvas,simObjs[3],[areasDrawer]),
	new Animator(simCanvas,simObjs[4],[areasDrawer]),
	new Animator(simCanvas,simObjs[5],[areasDrawer]),
	new Animator(simCanvas,simObjs[6],[areasDrawer]),
	new Animator(simCanvas,simObjs[7],[areasDrawer]),
	new Animator(simCanvas,simObjs[8],[areasDrawer]),
	new Animator(simCanvas,simObjs[9],[areasDrawer]),
	new Animator(simCanvas,simObjs[10],[dronesDrawer,dliDrawer]),
	new Animator(simCanvas,simObjs[11],[dronesDrawer,dliDrawer]),
	new Animator(simCanvas,simObjs[12],[dronesDrawer,dliDrawer]),
	
	new Animator(timeCanvas,{attributes: new Map()},[ timeDrawer ])
];

// This variable is required by simEngine to work
let allPlannedActivities = [
	makeAct("move", [simObjs[0],simObjs[10],simObjs[1]], 0),
	makeAct("move", [simObjs[0],simObjs[11],simObjs[5]], 0),
	makeAct("move", [simObjs[1],simObjs[10],simObjs[2]], 1),
	makeAct("move", [simObjs[5],simObjs[11],simObjs[8]], 1),
	makeAct("move", [simObjs[8],simObjs[11],simObjs[9]], 2),
	/*
	makeAct("init", [simObjs[10],simObjs[2]], 3),
	makeAct("mark", [simObjs[10],simObjs[3]], 3),
	makeAct("mark", [simObjs[10],simObjs[4]], 3),
	makeAct("mark", [simObjs[10],simObjs[1]], 3),
	makeAct("download", [simObjs[10]], 3),
	makeAct("init", [simObjs[11],simObjs[9]], 3),
	makeAct("mark", [simObjs[11],simObjs[7]], 3),
	makeAct("mark", [simObjs[11],simObjs[8]], 3),
	makeAct("download", [simObjs[11]], 3),
	makeAct("init", [simObjs[12],simObjs[0]], 3),
	makeAct("mark", [simObjs[12],simObjs[5]], 3),
	makeAct("mark", [simObjs[12],simObjs[6]], 3),
	makeAct("download", [simObjs[12]], 3),*/
	makeAct("init", [simObjs[10],simObjs[2]], 3),
	makeAct("init", [simObjs[11],simObjs[9]], 3),
	makeAct("init", [simObjs[12],simObjs[0]], 3),
	makeAct("mark", [simObjs[10],simObjs[3]], 3),
	makeAct("mark", [simObjs[10],simObjs[4]], 3),
	makeAct("mark", [simObjs[10],simObjs[1]], 3),
	makeAct("download", [simObjs[10]], 3),
	makeAct("mark", [simObjs[11],simObjs[7]], 3),
	makeAct("mark", [simObjs[11],simObjs[8]], 3),
	makeAct("download", [simObjs[11]], 3),
	makeAct("mark", [simObjs[12],simObjs[5]], 3),
	makeAct("mark", [simObjs[12],simObjs[6]], 3),
	makeAct("download", [simObjs[12]], 3),
	
	makeAct("move", [simObjs[9],simObjs[11],simObjs[8]], 5),
	makeAct("move", [simObjs[2],simObjs[10],simObjs[1]], 5),
	makeAct("land", [simObjs[12]], 5),
	makeAct("move", [simObjs[8],simObjs[11],simObjs[5]], 6),
	makeAct("move", [simObjs[1],simObjs[10],simObjs[0]], 6),
	makeAct("land", [simObjs[10]], 7),
	makeAct("move", [simObjs[5],simObjs[11],simObjs[0]], 7),
	makeAct("land", [simObjs[11]], 8)
	
];

const simulation = new Simulation(allPlannedActivities);

