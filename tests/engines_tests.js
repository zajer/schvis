if (chai == undefined){
	const chai = window.chai
}


describe('animEngine', () => {
	let clock;
	let spy;
	before ( () => {
		clock = sinon.useFakeTimers({toFake: ["setTimeout"]});
	});
	afterEach ( () => { 
		clock.restore();
		spy = null;
	});	
	it('.reqSwitchToTransAnims - single animator - should not call the provided callback', () => {
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
		await resultPromise;
		chai.assert.isTrue(spy.called);
	});
	it('.reqSwitchToTransAnims - single animator - should call the provided callback - alternative testing method', (done) => {
		let animator = new Animator(null, null, []);
		animator.drawersStat = [AnimationStatus.Finished,AnimationStatus.Going,AnimationStatus.Finished];
		workingAnimators = [animator];
		
		let resultPromise = animEngine.reqSwitchToTransAnims(done);
		animator.drawersStat = [AnimationStatus.Finished,AnimationStatus.Finished,AnimationStatus.Finished];
		
	});
	it('.reqSwitchToTransAnims - multiple animators - should not call the provided callback', () => {
		spy = sinon.spy();
		
		let animator1 = new Animator(null, null, []);
		let animator2 = new Animator(null, null, []);
		animator1.drawersStat = [AnimationStatus.Finished,AnimationStatus.Finished,AnimationStatus.Finished];
		animator2.drawersStat = [AnimationStatus.Finished,AnimationStatus.Going,AnimationStatus.Finished];
		workingAnimators = [animator1,animator2];
		
		animEngine.reqSwitchToTransAnims(spy);
		chai.assert.isFalse(spy.called);
		
		clock.tick(2000);
		
		chai.assert.isFalse(spy.called);
	});
	it('.reqSwitchToTransAnims - multiple animators - should call the provided callback', async () => {
		spy = sinon.spy();
		
		let animator1 = new Animator(null, null, []);
		let animator2 = new Animator(null, null, []);
		animator1.drawersStat = [AnimationStatus.Going,AnimationStatus.Finished,AnimationStatus.Finished];
		animator2.drawersStat = [AnimationStatus.Finished,AnimationStatus.Going,AnimationStatus.Finished];
		workingAnimators = [animator1,animator2];
		
		let resultPromise = animEngine.reqSwitchToTransAnims(spy);
		chai.assert.isFalse(spy.called);
		
		animator1.drawersStat = [AnimationStatus.Finished,AnimationStatus.Finished,AnimationStatus.Finished];
		clock.tick(2000);
		chai.assert.isFalse(spy.called);
		
		animator2.drawersStat = [AnimationStatus.Finished,AnimationStatus.Finished,AnimationStatus.Finished];
		clock.tick(2000);
		await resultPromise;
		chai.assert.isTrue(spy.called);
	});
	it('.reqSwitchToTransAnims - multiple animators - should call the provided callback - alternative testing method', (done) => {
		
		let animator1 = new Animator(null, null, []);
		let animator2 = new Animator(null, null, []);
		animator1.drawersStat = [AnimationStatus.Going,AnimationStatus.Finished,AnimationStatus.Finished];
		animator2.drawersStat = [AnimationStatus.Finished,AnimationStatus.Going,AnimationStatus.Finished];
		workingAnimators = [animator1,animator2];
		
		let resultPromise = animEngine.reqSwitchToTransAnims(done);
		
		animator1.drawersStat = [AnimationStatus.Finished,AnimationStatus.Finished,AnimationStatus.Finished];
		clock.tick(2000);
		
		animator2.drawersStat = [AnimationStatus.Finished,AnimationStatus.Finished,AnimationStatus.Finished];
	});
});
