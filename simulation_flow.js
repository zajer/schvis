const SimState = {
	Set: 0,
	UnsetNotChanged:1,
	UnsetChanging: 2
}

function Simulation(scheduledActivities){
	this.state = SimState.UnsetChanging;
	this.time = 0;
	this.scheduledActivities = scheduledActivities; //sorted by start time ascending
	this.ongoingActivities = []; //unsorted or in order they were started (might be some gaps since finshed activites are removed)
	this.finishedActivities = []; //in order they were added
}

function finishAllActsEndingAtCurrentTime(simulation){
	let splittingFun = (split, act) => { 
		if (act.end == simulation.time)
			split.finish.push(act);
		else
			split.keep.push(act);
		return split;
	};
	
	let split = simulation.ongoingActivities.reduce( splittingFun,{finish:[],keep:[]} );
	split.finish.forEach( act => finishActivity(act) );
	simulation.finishedActivities = simulation.finishedActivities.concat(split.finish);
	simulation.ongoingActivities = split.keep;
}

function progressSimByAct(simulation){
	//simulation.state = SimState.UnsetChanging;
	let activityToStart = simulation.scheduledActivities.shift();
	if (activityToStart == undefined) {
		//no more scheduled activities
		finishAllActsEndingAtCurrentTime(simulation);
		simulation.time++;
	}
	else if (activityToStart.start > simulation.time) {
		//first scheduled activity starts after the current moment
		simulation.scheduledActivities.unshift(activityToStart);
		finishAllActsEndingAtCurrentTime(simulation);
		simulation.time++;
	}
	else {
		//first scheduled activity start at the current moment
		startActivity(activityToStart);
		simulation.ongoingActivities.push(activityToStart);
	}
	//simulation.state = SimState.Set;
}

async function progressSimByMoment(simulation, callMeAndWaitBeforeFinishingActs, callMeAfterFinishingActs){
	if (simulation.scheduledActivities.length == 0) {
		finishAllActsEndingAtCurrentTime(simulation);
		simulation.time++;
		callMeAfterFinishingActs();
	}
	else {
		let firstFutureActivity = simulation.scheduledActivities.findIndex ( act => { return act.start > simulation.time; });
		
		if (firstFutureActivity == -1) {// no activities scheduled for later = first activity is scheduled for now
			let currentActivities = simulation.scheduledActivities;
			simulation.scheduledActivities = [];
			currentActivities.forEach( (act) => { startActivity(act); } );
			simulation.ongoingActivities = simulation.ongoingActivities.concat(currentActivities);
			
			await callMeAndWaitBeforeFinishingActs();
			
			finishAllActsEndingAtCurrentTime(simulation);
		}
		else  if (  firstFutureActivity == 0) { // all activities are scheduled for later = no activities scheduled for now
			finishAllActsEndingAtCurrentTime(simulation);
		}
		else { // some activities scheduled for now
			let currentActivities = simulation.scheduledActivities.slice( 0, firstFutureActivity );
			simulation.scheduledActivities.splice (0, firstFutureActivity);
			currentActivities.forEach( (act) => { startActivity(act); } );
			simulation.ongoingActivities = simulation.ongoingActivities.concat(currentActivities);
			//simulation.state = SimState.Set; //przeniesc zmiane statusu symulacji do funkcji wyższego rzędu
			
			await callMeAndWaitBeforeFinishingActs();
			
			finishAllActsEndingAtCurrentTime(simulation);
			//simulation.time++;
			//callMeAfterFinishingActs();
		}
		simulation.time++;
		callMeAfterFinishingActs();
	}
	//rozpocznij wszystkie czynności zaplanowane na aktualny moment czasu
	//przenies rozpoczete czynnosci do odpowiedniej tablicy
	//ustaw stany symulacji na ustalony
	//poczekaj na sygnał rozpoczęcia procesu kończenia czynności
	//zakoncz czynnosci
}
