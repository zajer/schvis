if (chai == undefined){
	const chai = window.chai
	}


describe('Animator', () => {
	let clock;
	let spy;
	beforeEach( () => {
		clock = sinon.useFakeTimers({toFake: ["setTimeout"]});
		spy = sinon.spy();
	});
	afterEach ( () => { 
		clock.restore();
		spy = null;
	});
	it('Animator.requestTransAnims should not use provided callback function', () => {
		//let mockedFn = ()  => { return; }
		//const spy = chai.spy(mockedFn);
		let animator = new Animator(null, null, []);
		animator.drawersStat = [AnimationStatus.Finished,AnimationStatus.Going,AnimationStatus.Finished];
		animator.requestTransAnims(spy);
		//chai.expect( spy ).not.to.have.been.called();
		chai.assert.isFalse(spy.called);
		clock.tick(2000);
		chai.assert.isFalse(spy.called);
	});
	it('Animator.requestTransAnims should use provided callback function right away', () => {
		let animator = new Animator(null, null, []);
		animator.drawersStat = [AnimationStatus.Finished,AnimationStatus.Finished,AnimationStatus.Finished];
		animator.requestTransAnims(spy);
		clock.tick(2000);
		chai.assert.isTrue(spy.called);
	});
	it('Animator.requestTransAnims should eventually use provided callback function', (done) => {

		let animator = new Animator(null, null, []);
		animator.drawersStat = [AnimationStatus.Finished,AnimationStatus.Finished,AnimationStatus.Finished];
		animator.requestTransAnims(done);
	});
	it('Animator.requestTransAnims should eventually use provided callback function - alternative testing method', function () {
		let animator = new Animator(null, null, []);
		animator.drawersStat = [AnimationStatus.Finished,AnimationStatus.Going,AnimationStatus.Finished];
		animator.requestTransAnims(spy);
		chai.assert.isFalse(spy.called);
		animator.drawersStat = [AnimationStatus.Finished,AnimationStatus.Finished,AnimationStatus.Finished];
		clock.tick(2000);
		chai.assert.isTrue(spy.called);
	});
});

