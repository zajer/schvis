const SimStateStatus = {
	Set: 0,
	UnsetNotChanged:1,
	UnsetChanging: 2
}

function Simulation(){
	this.state = SimStateStatus.UnsetChanging;
	this.time = 0;
	this.scheduledActivities = []; //sorted by start time ascending
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
	//simulation.state = SimStateStatus.UnsetChanging;
	let activityToStart = simulation.scheduledActivities.shift();
	if (activityToStart == undefined) {
		//no more scheduled activities
		finishAllActsEndingAtTime(simulation);
		simulation.time++;
	}
	else if (activityToStart.start > simulation.time) {
		//first scheduled activity starts after the current moment
		simulation.scheduled.unshift(activityToStart);
		finishAllActsEndingAtTime(simulation);
		simulation.time++;
	}
	else {
		//first scheduled activity start at the current moment
		startActivity(activityToStart);
		simulation.ongoingActivities.push(activityToStart);
	}
	//simulation.state = SimStateStatus.Set;
}

async function progressSimByMoment(simulation, callMeAndWaitBeforeFinishingActs){
	let firstFutureActivity = simulation.scheduledActivities.findIndex ( (act) => { return act.start > simulation.time; });
	
	if (firstFutureActivity == -1) // no activities scheduled for neither now nor later = no more activities
		return;
	else  if (  firstFutureActivity == 0) // all activities are scheduled for lated = no activities scheduled for now
		finishAllActsEndingAtCurrentTime(simulation);
	else { // activities scheduled for now
		let currentActivities = simulation.scheduledActivities.slice( 0, firstFutureActivity );
		simulation.scheduledActivities.splice (0, firstFutureActivity);
		currentActivities.forEach( (act) => { startActivity(act); } );
		simulation.ongoingActivities = simulation.ongoingActivities.concat(currentActivities);
		simulation.state = SimStateStatus.Set; //przeniesc zmiane statusu symulacji do funkcji wyższego rzędu
		
		await callMeAndWaitBeforeFinishingActs();
		
		finishAllActsEndingAtCurrentTime(simulation);
	}
	
	//rozpocznij wszystkie czynności zaplanowane na aktualny moment czasu
	//przenies rozpoczete czynnosci do odpowiedniej tablicy
	//ustaw stany symulacji na ustalony
	//poczekaj na sygnał rozpoczęcia procesu kończenia czynności
	//zakoncz czynnosci
}
