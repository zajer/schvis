function draw(context, objAttrs) {}

const AnimationStatus = {
	Finished: 0,
	Going: 1
}
function Drawer(transitionDrawFun,dynamicDrawFun){ //one for each activity type
	this.transAnim = transitionDrawFun; 
	//executed when simulation state is changing thus it should not rely on any attributes that values are volatile
	this.dynamicAnim = dynamicDrawFun; 
	//guaranteed to be executed at least until it returns AnimationStatus.Finished, then it is either still called from an animator or animator switches to transitional animation function
}
/*
const AnimationStatus = {
	Dynamic: 0,
	Transition: 1,
	RequestForTransition: 2
}
*/
function Animator(canvas,animatedObj,availDrawers){ //one for each object
	//Funkcja rysowania początkowego - zbędne bo ten "rysunek" będzie widoczny tylko jedną klatkę (tzn. przez 1/60 sekundy)
	//Funkcja będąca argumentem 'requestAnimationFrame' - zbędne bo funkcją tą będzie jakaś metoda silnika animacji, a nie animatora
	//Funkcja używana przez silnik do zgłoszenia, że zmieniany będzie stan symulacji. Jej celem jest wymuszenie na wszystkich animatorach aby dokończyli animacje dynamiczne. Po zakończeniu każdy animator zgłasza to silnikowi animacji i przechodzi na animację przejściową. Jak wszyscy przejdą na animacje przejściowe to stan symulacji może zostać zmieniony. - też zbędne bo silnik symulacji zgłaszać będzie do silnika animacji, a ten z kolei zgłosi wszystkim animatorom
	//Tutaj możnaby użyć asynchronicznej funkcji. Po przejściu wszystkich rysowników na animacje przejściowe można wywołać callback z funkcją przekazaną przez silnik animacji - callback animatora oznaczałby w silniku, że dany animator wykonuje już tylko animacje przejściowe. Kiedy wszyscy animatorzy dokonają takiego zgłoszenia to może nastąpić zgłoszenie silnikowi symulacji (!), że możliwa jest zmiana jej stanu.
	this.ctx = canvas;
	this.obj = animatedObj;
	this.drawers = availDrawers;
	this.drawersStat = ( () => { return new Array(availDrawers.length).fill(AnimationStatus.Going); }) ();
	this.areTransAnimsRequested = false;
	this.animate = function () {
		let objAttrs = obj.attributes;
		this.drawers.forEach( (drawer,idx) => {
			if (areTransAnimsRequested && drawersStat[idx] == AnimationStatus.Finished)
				drawers[idx].transAnim(ctx,objAttrs);
			else
				drawersStat[idx] = drawers[idx].dynamicAnim(ctx,objAttrs);
		});
	};
	this.requestTransAnims = function (callMeWhenAllDrawersAreInTrans) {
		let loopWithSleepFun = () => {
			let areDrawersInTrans = this.drawersStat.every ( (drawerStat) => { return drawerStat == AnimationStatus.Finished; } );
			if (areDrawersInTrans)
				callMeWhenAllDrawersAreInTrans();
			else
				setTimeout( loopWithSleepFun, 100);
		};
		this.areTransAnimsRequested = true;
		loopWithSleepFun();
		
	};
}
