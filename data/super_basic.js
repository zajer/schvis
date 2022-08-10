// Three squares with a circle moving from first to last.
let obj0 = { id:0, pos:1, color:"orange", shape:"circle" };
let obj1 = { id:1, pos:1, color:"blue", shape:"square" };
let obj2 = { id:2, pos:2, color:"red", shape:"square" };
let obj3 = { id:3, pos:3, color:"green", shape:"square" };

let simObjs = [obj0,obj1,obj2,obj3].map( obj => { return parseSimObj(obj); } );

// Two activity types, one for moving circle between squares and second for changing circle's color

// First activity type is for moving, the second is for color change.
// First activity has three roles: 
// 	- first is for square the circle is moving from
// 	- second is for the circle
// 	- third is for square the circle moving to
// 	The first and third role do not have role functions. The second one has one 
let aa1r0 = new SimActAbstRole(0,[],[]);

let aa1r1_going_f1 = new SimRoleFun (
		"pos", //output
		2, //role id this function needs attributes from
		["pos"], //required attrs
		(modifiedObj,currentVal,destinationPos) => {modifiedObj.attributes.set('pos',destinationPos);},
		() => {throw "aa1r1_going_f1 should not call the function for the case when attribute not exists!";}
	);
let aa1r1_going_f2 = new SimRoleFun (
		"is_moving",
		1,
		[],
		() => {throw "aa1r1_going_f2 should not call the function for the case when attribute exists!";},
		(modifiedObj) => {modifiedObj.attributes.set('is_moving',true);}
	);
let aa1r1_finished_f1 = new SimRoleFun (
		"is_moving",
		1,
		["is_moving"],
		(modifiedObj,currentVal,sameAsCurrent) => {modifiedObj.attributes.delete("is_moving");},
		() => {throw "aa1r1_finished_f1 should not call the function for the case when attribute does not exist!";}	
	);

let aa1r1 = new SimActAbstRole(1,[aa1r1_going_f1,aa1r1_going_f2],[aa1r1_finished_f1]);
let aa1r2 = new SimActAbstRole(2,[],[]);

let aa1 = new SimAbstActivity([aa1r0,aa1r1,aa1r2], "move", 2);

// The second activity type is for changing the color of the circle.
let aa2r0_going_f1 = new SimRoleFun (
		"color",
		0,
		[],
		(modifiedObj,currentVal) => { modifiedObj.attributes.set('color',"purple");},
		() => {}
	);
let aa2r0 = new SimActAbstRole(0,[aa2r0_going_f1],[]);

let aa2 = new SimAbstActivity([aa2r0], "change color", 1);

let availableAbstActs = [aa1,aa2];

// Making activities based on their type, objects performing their role and moment they are starting
let a1 = makeAct("move", [simObjs[1],simObjs[0],simObjs[2]], 0);
let a2 = makeAct("change color", [simObjs[0]], 2);
let a3 = makeAct("move", [simObjs[2],simObjs[0],simObjs[3]], 3);

// Drawer for squares
let drawerFunMoveSquares = (canvas, objAttrs) => {
	if (objAttrs.get('shape') != 'square')
		return AnimationStatus.Finished;
	else {
		let domRect = canvas.getBoundingClientRect();
		let canvasWidth = domRect.width;
		let canvasHeight = domRect.height;
		
		let ctx = canvas.getContext('2d');
		ctx.save();
		
		ctx.beginPath();
		ctx.lineWidth = "2";
		ctx.strokeStyle = objAttrs.get("color");
		ctx.rect((canvasWidth/3)*(objAttrs.get("pos")-1)+50, canvasHeight/7, 100, 100);
		ctx.stroke();
		
		ctx.restore();
		return AnimationStatus.Finished;
	}
};
// Drawer for moving circles
let drawerFunMoveCircles = (canvas, objAttrs) => {
	let animationSpeed = 3;
	let drawCircleBasedOnAttrsFun = (ctx, objAttrs, canvasWidth, canvasHeight) => { 
		ctx.beginPath();
		ctx.fillStyle = objAttrs.get("color");
		ctx.arc( (canvasWidth/3)*(objAttrs.get("pos")-1)+100 , canvasHeight/7+50, 25, 0, 2 * Math.PI );
		ctx.fill();
	}
	if (objAttrs.get('shape') != 'circle')
		return AnimationStatus.Finished;
	else {
		let domRect = canvas.getBoundingClientRect();
		let canvasWidth = domRect.width;
		let canvasHeight = domRect.height;
		
		let ctx = canvas.getContext('2d');
		
		if( objAttrs.get('is_moving') == true ) {
			ctx.save();
			
			let shift = objAttrs.get('moveCirclesTMP');
			if (shift == undefined)
				shift = 0;
			ctx.translate(shift-(canvasWidth/3), 0);						
			drawCircleBasedOnAttrsFun(ctx, objAttrs, canvasWidth, canvasHeight);			
			ctx.restore();
			
			if (shift < (canvasWidth/3) ) {
				objAttrs.set('moveCirclesTMP',shift + animationSpeed);
				return AnimationStatus.Going;
			}
			else {
				objAttrs.delete('moveCirclesTMP');
				return AnimationStatus.Finished;
			}
			
		} else {
			ctx.save();
			drawCircleBasedOnAttrsFun(ctx, objAttrs, canvasWidth, canvasHeight);			
			ctx.restore();
			
			return AnimationStatus.Finished;
		}
	}
};

let moveDrawerSquares = new Drawer(() => { return AnimationStatus.Finished; }, drawerFunMoveSquares );
let moveDrawerCircles = new Drawer(() => { return AnimationStatus.Finished; }, drawerFunMoveCircles );

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
let area1Anim = new Animator(simCanvas,simObjs[1],[moveDrawerSquares]);
let area2Anim = new Animator(simCanvas,simObjs[2],[moveDrawerSquares]);
let area3Anim = new Animator(simCanvas,simObjs[3],[moveDrawerSquares]);
let circleAnim = new Animator(simCanvas,simObjs[0],[moveDrawerCircles]);
let timeAnim = new Animator(timeCanvas,{attributes: new Map()},[ timeDrawer ]);

let allPlannedActivities = [a1,a2,a3];
const workingAnimators = [area1Anim,area2Anim,area3Anim,circleAnim,timeAnim];
const simulation = new Simulation(allPlannedActivities);
