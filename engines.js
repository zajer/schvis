
//silnik symulacji musi posidać funkcje:
//- zgłaszającą chęć postępu symulacji o moment czasu
//- zgłaszającą chęć postępu symulacji o jedną czynność
//- zgłaszającą chęć resetu symulacji
//- zgłaszającą chęć automatycznego postępu o kolejne momenty
//- funkcję, która będą służyła jako callback oznaczający, że można dokonać postępu symulacji

//potrzebne są cztery obiekty:
//	allPlannedActivities
//	workingAnimators
//	simulation
//	usedCanvas = [ {cavas,wrapper} ]
function modifyButtons( funcToApply ) {
	let playBtn = document.getElementById("play-btn");
	let actBtn = document.getElementById("next-act-btn");
	let momBtn = document.getElementById("next-mnt-btn");
	let resetBtn = document.getElementById("reset-btn");
	[playBtn,actBtn,momBtn,resetBtn].forEach( funcToApply );
}

function lockButtons () {
	modifyButtons( btn => { btn.classList.add("pure-button-disabled"); } );
}

function unlockButtons () {
	modifyButtons( btn => { btn.classList.remove("pure-button-disabled"); } );
}

const simEngine = {
	reqSimProgressByActivity : () => {
		lockButtons();
		simulation.state = SimState.UnsetNotChanged;
		let advanceSim = () => {
			console.log("All animators have switch to transitional animations, proceeding to modyfing a simulation state");
			simulation.state = SimState.UnsetChanging;
			progressSimByAct(simulation);
			simulation.state = SimState.Set;
			console.log("The simulation state has been changed, going back to dynamic animations");
			animEngine.reqSwitchToDynamicAnims();
			unlockButtons();
		};
		animEngine.reqSwitchToTransAnims(advanceSim);
	},
	reqSimProgressByMoment : () => {
		lockButtons();
		simulation.state = SimState.UnsetNotChanged;
		let advanceSim = () => {
			console.log("All animators have switch to transitional animations, proceeding to modyfing a simulation state");
			simulation.state = SimState.UnsetChanging;
			progressSimByMoment(simulation, 
				() => {
					console.log("The simulation state has been changed by started activities");
					simulation.state = SimState.UnsetNotChanged;
					animEngine.reqSwitchToDynamicAnims();
					console.log("Requested switching to dynamic animations, waiting before going back to transitional animations and finishing activities");
					return new Promise( resolve => {
						setTimeout( animEngine.reqSwitchToTransAnims, 1000, resolve); 
					});
				},
				() => {
					simulation.state = SimState.Set;
					console.log("The Simulation state has been changed by finishing activities, going back to dynamic animations");
					animEngine.reqSwitchToDynamicAnims();
					unlockButtons();
				}
			);
			//console.log("...Simulation state has been changed, going back to dynamic animations");
			animEngine.reqSwitchToDynamicAnims();
		};
		animEngine.reqSwitchToTransAnims(advanceSim);
	},
	reqSimReset : () => {},
	reqSimPlay : () => {},
};

const animEngine = {
	reqSwitchToTransAnims : (callMeWhenItsDone) => {
		let pendingTransitions = workingAnimators.map ( animator => {
			return new Promise( resolve => {
				animator.requestTransAnims( resolve );				
			});
		});
		
		return Promise.all( pendingTransitions ).then( () => { 
			callMeWhenItsDone();
		});
	},
	reqSwitchToDynamicAnims : () => {
		workingAnimators.forEach( animator => { animator.areTransAnimsRequested = false; } );
	},
	animate : () => {
		usedCanvas.forEach ( pair => {
			let wrapperDOMRect = pair.wrapper.getBoundingClientRect();
			pair.canvas.width = wrapperDOMRect.width-7; 
			pair.canvas.height = wrapperDOMRect.height-7; 
			
			let domRect = pair.canvas.getBoundingClientRect();
			let width = domRect.width;
			let height = domRect.height;
			pair.canvas.getContext('2d').clearRect(0, 0, width, height);
		});
		workingAnimators.forEach( animator => { animator.drawPartOfAFrame(); } );
		
		window.requestAnimationFrame(animEngine.animate);
	}
};

//animEngine.animate();
