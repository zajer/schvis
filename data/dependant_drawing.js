// The following objects are used to construct simulation objects. The "id" property is mandatory.
let obj0 = { id:"area 1", pos:1, type:"area", objCount:2 };
let obj1 = { id:"area 2", pos:2, type:"area", objCount:0 };
let obj2 = { id:"area 3", pos:3, type:"area", objCount:0 };
let obj3 = { id:"area 4", pos:4, type:"area", objCount:0 };

let obj4 = { id:"object 1", pos:1, type:"object", place:1, objId:"1" };
let obj5 = { id:"object 2", pos:1, type:"object", place:2, objId:"2"};

let simObjs = [obj0,obj1,obj2,obj3,obj4,obj5].map( obj => { return parseSimObj(obj); } );
//One type of abstract activity. It represents moving between areas and involves three objects (has three roles):
//	- An area an object is transitioning from
//	- An area an object is transitioning to
//	- The moving object
// The first role decreases the total number of objects on the first area.
// The second role :
// 		- sets the position of the object
// 		- (while this activity is not finished) marks this object as moving between specific areas
// 		- sets which place on the area it takes after activity is finished
// The third role increases the total number of objects on the second area.
let aa1r0_going_f1 = new SimRoleFun (
		"objCount", //output attribute
		-1, //role id this function needs attributes from
		[], //required attributes
		(modifiedObj,currentObjCount) => {modifiedObj.attributes.set('objCount',currentObjCount-1);},
		() => {throw "aa1r0_going_f1 should not call the function for the case when the output attribute does not exist!";}
	);
let aa1r1_going_f1 = new SimRoleFun (
		"dest_pos",
		2,
		["pos"], 
		() => {throw "aa1r2_going_f1 should not call the function for the case when the output attribute does exist!";},
		(modifiedObj,destinationPos) => {modifiedObj.attributes.set('dest_pos',destinationPos);}
	);
let aa1r1_going_f2 = new SimRoleFun (
		"is_moving",
		-1,
		[],
		(modifiedObj,currentPos) => {modifiedObj.attributes.set('is_moving',true);},
		modifiedObj => {modifiedObj.attributes.set('is_moving',true);}
	);
let aa1r1_going_f3 = new SimRoleFun (
		"dest_place", //output attribute
		2, //role id this function needs attributes from
		["objCount"], //required attributes
		() => {throw "aa1r2_going_f3 should not call the function for the case when the output attribute does exist!";},
		(modifiedObj,objCount) => {modifiedObj.attributes.set('dest_place',objCount+1);}
	);
let aa1r1_finished_f1 = new SimRoleFun (
		"is_moving",
		-1,
		[],
		(modifiedObj,currentVal) => {modifiedObj.attributes.set('is_moving',false);},
		modifiedObj => {throw "aa1r2_finished_f1 should not call the function for the case when the output attribute does not exist!";}
	);
let aa1r1_finished_f2 = new SimRoleFun (
		"dest_pos",
		-1,
		[],
		(modifiedObj,destPos) => {
		modifiedObj.attributes.set('pos',destPos);
		modifiedObj.attributes.delete('dest_pos');
		},
		modifiedObj => {throw "aa1r2_finished_f2 should not call the function for the case when the output attribute does not exist!";}
	);
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
// Making abstract activity roles
let aa1r0 = new SimActAbstRole(0,[aa1r0_going_f1],[]);
let aa1r1 = new SimActAbstRole(2,[aa1r1_going_f1,aa1r1_going_f2,aa1r1_going_f3],[aa1r1_finished_f1,aa1r1_finished_f2,aa1r1_finished_f3]);
let aa1r2 = new SimActAbstRole(1,[aa1r2_going_f1],[]);
// Making abstract activity that has the above three roles and taking 1 unit of time
let aa1 = new SimAbstActivity([aa1r0,aa1r1,aa1r2], "move", 1);
// This variable allows to use a facade function named "makeAct" defined in simulation_utils.js
let availableAbstActs = [aa1];
// Making (concrete) activities based on their type, objects performing their role and a moment they are starting
let a1 = makeAct("move", [simObjs[0],simObjs[4],simObjs[2]], 0);
let a2 = makeAct("move", [simObjs[0],simObjs[5],simObjs[2]], 0);
let a3 = makeAct("move", [simObjs[2],simObjs[4],simObjs[1]], 1);
let a4 = makeAct("move", [simObjs[2],simObjs[5],simObjs[3]], 1);
// This variable is required by simEngine to work
let allPlannedActivities = [a1,a2,a3,a4];


// ------------------------------------------------ Animation ----------------------------------------------------------------
/* The areas are located like this
			     ________
			     |	     |
			     |		 |
			     |   1   |
			     |		 |
			     |_______|
			
	________     ________     _______   
	|		|    |		 |    |      |
	|		|    |		 |    |      |
	|   2   |    |   3	 |	  |   4  |
	|		|    |		 |    |      |
	|_______|    |_______|	  |______|
*/

function coordinatesOfAreaRectangles(areaId,width,height){
	switch(areaId) {
  	case 1:
    	return [width/2,height/7];
  	case 2:
    	return [width/4,height/2];
    case 3:
    	return [width/2,height/2];
    case 4:
    	return [3*width/4,height/2];
  	default:
    	throw "unknown area identifier: "+areaId;
	}
}
function shiftCoordinatesOfCirclesBasedOnTheirPlacement(place){
	switch(place) {
  	case 1:
    	return [25,25];
  	case 2:
    	return [75,25];
    case 3:
    	return [75,25];
    case 4:
    	return [75,75];
  	default:
    	throw "unknown placement on an area: "+place;
	}
}
// Drawer function used to draw areas as rectangles.
let drawerFunAreas = (canvas, objAttrs) => {
	if (objAttrs.get('type') != 'area')
		return AnimationStatus.Finished;
	else {
		let domRect = canvas.getBoundingClientRect();
		let canvasWidth = domRect.width;
		let canvasHeight = domRect.height;
		let areaId = objAttrs.get('pos');
		let [x,y] = coordinatesOfAreaRectangles(areaId, canvasWidth, canvasHeight);
		let ctx = canvas.getContext('2d');
		
		ctx.save();
		ctx.beginPath();
		ctx.lineWidth = "2";
		ctx.strokeStyle = "green";
		ctx.rect(x, y, 100, 100);
		ctx.stroke();
		ctx.font = "15px Arial";
		ctx.fillStyle = "black";
		ctx.fillText(areaId, x+90, y+95);
		ctx.restore();
		
		return AnimationStatus.Finished;
	}
};

// Drawer function used to draw areas as rectangles.
let drawerFunObjs = (canvas, objAttrs) => {
	let animSpeed = 3;
	let resultAnimStatus = AnimationStatus.Finished;
	if (objAttrs.get('type') != 'object')
		return resultAnimStatus;
	else {
		let domRect = canvas.getBoundingClientRect();
		let canvasWidth = domRect.width;
		let canvasHeight = domRect.height;
		let areaId = objAttrs.get('pos');
		let [x,y] = coordinatesOfAreaRectangles(areaId, canvasWidth, canvasHeight);
		let [xShift,yShift] = shiftCoordinatesOfCirclesBasedOnTheirPlacement(objAttrs.get("place"));
		let ctx = canvas.getContext('2d');
		ctx.save();
		if( objAttrs.get('is_moving') == true ) {
			resultAnimStatus = AnimationStatus.Going;
			
			let destArea = objAttrs.get('dest_pos');
			let [xDest,yDest] = coordinatesOfAreaRectangles(destArea, canvasWidth, canvasHeight);
			let [xDestShift,yDestShift] = shiftCoordinatesOfCirclesBasedOnTheirPlacement(objAttrs.get("dest_place"));
			
			let dirFun = val => { if (val > 0) return 1; else if (val < 0) return -1; else return 0; };
			let xDir = dirFun (xDest-x);
			let yDir = dirFun (yDest-y);
			let xMoveShift = objAttrs.get('xMoveShift');
			let yMoveShift = objAttrs.get('yMoveShift');
			xMoveShift = xMoveShift != undefined ? xMoveShift : 0;
			yMoveShift = yMoveShift != undefined ? yMoveShift : 0;
			ctx.translate(xMoveShift+animSpeed*xDir, yMoveShift+animSpeed*yDir);
			
			let isXReached = false;
			let isYReached = false;
			
			if ( xDir > 0 ? (x+xShift+xMoveShift < xDest+xDestShift) : (x+xShift+xMoveShift > xDest+xDestShift) )
				objAttrs.set('xMoveShift',xMoveShift+animSpeed*xDir);
			else
				isXReached = true;
			
			if ( yDir > 0 ? (y+yShift+yMoveShift < yDest+yDestShift) : (y+yShift+yMoveShift > yDest+yDestShift) )
				objAttrs.set('yMoveShift',yMoveShift+animSpeed*yDir);
			else
				isYReached = true;
			
			if( isXReached && isYReached) {	
				objAttrs.delete('xMoveShift');
				objAttrs.delete('yMoveShift');
				resultAnimStatus = AnimationStatus.Finished;
			}
				
		}
		ctx.beginPath();
		ctx.lineWidth = "2";
		ctx.strokeStyle = "black";
		ctx.fillStyle = "orange";
		ctx.arc( x+xShift, y+yShift, 25, 0, 2 * Math.PI );
		ctx.fill();
		ctx.stroke();
		ctx.font = "30px Arial";
		ctx.fillStyle = "black";
		ctx.fillText(objAttrs.get('objId'), x+xShift-9, y+yShift+12);
		ctx.restore();
		
		return resultAnimStatus;
	}
};

let areasDrawer = new Drawer(() => { return AnimationStatus.Finished; }, drawerFunAreas );
let objectsDrawer = new Drawer(() => { return AnimationStatus.Finished; }, drawerFunObjs );

let simCanvasWrapper = document.getElementById("sim-canvas-wrapper");
let simCanvas = document.getElementById("simulation");

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

let timeCanvasWrapper = document.getElementById("time-indicator-canvas-wrapper");
let timeCanvas = document.getElementById("time-indicator");

const usedCanvas = 
	[
		{wrapper:simCanvasWrapper, canvas: simCanvas}, 
		{wrapper:timeCanvasWrapper, canvas: timeCanvas} 
	];
let area1Anim = new Animator(simCanvas,simObjs[0],[areasDrawer]);
let area2Anim = new Animator(simCanvas,simObjs[1],[areasDrawer]);
let area3Anim = new Animator(simCanvas,simObjs[2],[areasDrawer]);
let area4Anim = new Animator(simCanvas,simObjs[3],[areasDrawer]);

let obj1Anim = new Animator(simCanvas,simObjs[4],[objectsDrawer]);
let obj2Anim = new Animator(simCanvas,simObjs[5],[objectsDrawer]);

let timeAnim = new Animator(timeCanvas,{attributes: new Map()},[ timeDrawer ]);

const workingAnimators = [area1Anim,area2Anim,area3Anim,area4Anim,obj1Anim,obj2Anim,timeAnim];
const simulation = new Simulation(allPlannedActivities);
