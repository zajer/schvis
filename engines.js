
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

const simEngine = {
	reqSimProgressByActivity : () => {
		console.log("Begining the simulation progress opertation");
		simulation.state = SimState.UnsetNotChanged;
		let advanceSim = () => {
			console.log("Animations are switched to transitional, modyfing the the simulation state");
			simulation.state = SimState.UnsetChanging;
			progressSimByAct(simulation);
			simulation.state = SimState.Set;
			console.log("Simulation objects modyfied going back to dynamic animations");
			animEngine.reqSwitchToDynamicAnims();
		};
		animEngine.reqSwitchToTransAnims(advanceSim);
	},
	reqSimProgressByMoment : () => {},
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

animEngine.animate();
