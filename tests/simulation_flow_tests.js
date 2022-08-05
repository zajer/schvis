if (chai == undefined){
	const chai = window.chai
	}

const originalPerformActRolesFun = performActRoles;
describe('progressSimByMoment', () => {
	before( () => {
        //fakes
		performActRoles = (act) => {return;};
    });
    after( () => {
        performActivityRoles = originalPerformActRolesFun;
    });
	it('should start some activities and not finish any', async () => {
		let launchedAct1 = { id:1, status: SimActivityStatus.NotStarted, start: 7, end:9};
		let launchedAct2 = { id:2, status: SimActivityStatus.NotStarted, start: 7, end:10};
		let keptNotLaunchedAct = { id:3, status: SimActivityStatus.NotStarted, start: 8, end:9};
		let alreadyLaunchedAct = { id:4, status: SimActivityStatus.Started, start: 3, end:9};
		
		let sim = new Simulation();
		sim.time = 7;
		sim.scheduledActivities = [launchedAct1,launchedAct2,keptNotLaunchedAct];
		sim.ongoingActivities = [alreadyLaunchedAct];
		
		await progressSimByMoment(sim, () => { return; }, () => { return; });  
		
		chai.assert.lengthOf(sim.scheduledActivities, 1);
		chai.assert.lengthOf(sim.ongoingActivities, 3);
		chai.assert.lengthOf(sim.finishedActivities, 0);
	});
	it('should finish some activities but not start any', async () => {
		let keptNotLaunchedAct = { id:1, status: SimActivityStatus.NotStarted, start: 7, end:9 };
		let finishedAct1 = { id:2, status: SimActivityStatus.Started, start: 2, end:5 };
		let finishedAct2 = { id:3, status: SimActivityStatus.Started, start: 4, end:5 };
		let keptGoingAct = { id:4, status: SimActivityStatus.Started, start: 1, end:6 };
		
		let sim = new Simulation();
		sim.time = 5;
		sim.scheduledActivities = [keptNotLaunchedAct];
		sim.ongoingActivities = [finishedAct1,finishedAct2,keptGoingAct];
		

		await progressSimByMoment(sim, () => { return;}, () => { return; });  
		
		chai.assert.lengthOf(sim.scheduledActivities, 1);
		chai.assert.lengthOf(sim.ongoingActivities, 1);
		chai.assert.lengthOf(sim.finishedActivities, 2);
	});
	it('should start and finish some activities', async () => {
		let launchedAct1 = { id:1, status: SimActivityStatus.NotStarted, start: 3, end:3};
		let launchedAct2 = { id:2, status: SimActivityStatus.NotStarted, start: 3, end:5};
		let keptNotLaunchedAct = { id:3, status: SimActivityStatus.NotStarted, start: 4, end:9 };
		let finishedAct1 = { id:4, status: SimActivityStatus.Started, start: 2, end:3 };
		let finishedAct2 = { id:5, status: SimActivityStatus.Started, start: 0, end:3 };
		let keptGoingAct = { id:6, status: SimActivityStatus.Started, start: 1, end:6 };
		
		let sim = new Simulation();
		sim.time = 3;
		sim.scheduledActivities = [launchedAct1,launchedAct2,keptNotLaunchedAct];
		sim.ongoingActivities = [finishedAct1,finishedAct2,keptGoingAct];

		await progressSimByMoment(sim, () => { return; }, () => { return; });  
		
		chai.assert.lengthOf(sim.scheduledActivities, 1);
		chai.assert.lengthOf(sim.ongoingActivities, 2);
		chai.assert.lengthOf(sim.finishedActivities, 3); 
		
	});
});
