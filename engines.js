
//silnik symulacji musi posidać funkcje:
//- zgłaszającą chęć postępu symulacji o moment czasu
//- zgłaszającą chęć postępu symulacji o jedną czynność
//- zgłaszającą chęć resetu symulacji
//- zgłaszającą chęć automatycznego postępu o kolejne momenty
//- funkcję, która będą służyła jako callback oznaczający, że można dokonać postępu symulacji
const simEngine = {
	sim : undefined,
	reqSimProgressByActivity : () => {},
	reqSimProgressByMoment : () => {},
	reqSimReset : () => {},
	reqSimPlay : () => {},
};

var workingAnimators = [];

function switchToTransitionalAnimationsInAllAnimators (callMeWhenItsDone) {
	let pendingTransitions = workingAnimators.map ( animator => {
		return new Promise( resolve => {
			animator.requestTransAnims( resolve );				
		});
	});
	
	return Promise.all( pendingTransitions ).then( () => { 
			callMeWhenItsDone();
		});
	
	//await Promise.all( pendingTransitions );
	//return callMeWhenItsDone();
}

var animEngine = {
	reqSwitchToTransAnims : switchToTransitionalAnimationsInAllAnimators
};


