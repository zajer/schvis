if (chai == undefined){
	const chai = window.chai
}


describe('animEngine', () => {
	let clock; //= sinon.useFakeTimers({toFake: ["setTimeout"]});
	let spy;
	before ( () => {
		clock = sinon.useFakeTimers({toFake: ["setTimeout"]});
	});
	afterEach ( () => { 
		clock.restore();
		spy = null;
	});	
	it('.reqSwitchToTransAnims - single animator - should not call the provided callback', () => {
		//let clock = sinon.useFakeTimers({toFake: ["setTimeout"]});
		spy = sinon.spy();
		
		let animator = new Animator(null, null, []);
		animator.drawersStat = [AnimationStatus.Finished,AnimationStatus.Going,AnimationStatus.Finished];
		workingAnimators = [animator];
		
		animEngine.reqSwitchToTransAnims(spy);
		chai.assert.isFalse(spy.called);
		
		clock.tick(2000);
		
		chai.assert.isFalse(spy.called);
	});
	it('.reqSwitchToTransAnims - single animator - should call the provided callback', async () => {
		spy = sinon.spy();
		
		let animator = new Animator(null, null, []);
		animator.drawersStat = [AnimationStatus.Finished,AnimationStatus.Going,AnimationStatus.Finished];
		workingAnimators = [animator];
		
		let resultPromise = animEngine.reqSwitchToTransAnims(spy);
		chai.assert.isFalse(spy.called);
		
		animator.drawersStat = [AnimationStatus.Finished,AnimationStatus.Finished,AnimationStatus.Finished];
		clock.tick(2000);
		//await resultPromise;
		chai.assert.isTrue(spy.called);
	});	
});
