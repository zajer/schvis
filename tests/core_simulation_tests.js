const chai = window.chai
const expect = chai.expect

describe('SimActAbstRole', () => {
	it('should detect that certain parameters required for construction of an object of SimActAbstRole are invalid', () => {
		expect( () => {new SimActAbstRole( 3, [3], [] ); } ).to.throw(TypeError);
		expect( () => {new SimActAbstRole( 3, [], [3] ); } ).to.throw(TypeError);
	});
	it("should construct an abstract activity's role with no participation functions", () => {
		let x = new SimActAbstRole( 7, [], [] ); 
		//expect( () => {let x = new SimActAbstRole( 7, [], [] ); return x; } ).to.be.an("object");
		expect( x.id ).to.be.equal(7);
		//chai.should(x.ongoingMod).have.property('length').equal(0);
		chai.assert.lengthOf(x.ongoingMod, 0);
		chai.assert.lengthOf(x.finishedMod, 0);
		
	});
})

describe('applyRoleFun', () => {
	before( () => {
		//this.obj1 = new SimObject(1,new Map());
		//this.obj2 = new SimObject(2,new Map());
		this.impactfulRoleId = 1;
		this.outputAttribute = "yolo";
		this.impactfulAttributeName = "impactfulAttribute";
		let funIfOutAttrExists_singleInput = ( modifiedObj, currentValue, impactfulAttribute) => { modifiedObj.attributes.set(outputAttribute, (currentValue+impactfulAttribute)); };
		let funIfOutAttrNotExists_singleInput = ( modifiedObj, impactfulAttribute) => { modifiedObj.attributes.set(outputAttribute, impactfulAttribute); };
		this.appliedFun = new SimRoleFun (outputAttribute, impactfulRoleId, [impactfulAttributeName], funIfOutAttrExists_singleInput, funIfOutAttrNotExists_singleInput );
		
		this.impactfulAttribute2Name = "another important attribute";
		let funIfOutAttrExists_twoInputs = ( modifiedObj, currentValue, impactfulAttribute, anotherImportantAttribute) => { modifiedObj.attributes.set(outputAttribute, (currentValue-(impactfulAttribute+anotherImportantAttribute))); };
		let funIfOutAttrNotExists_twoInputs = ( modifiedObj, impactfulAttribute, anotherImportantAttribute) => { modifiedObj.attributes.set(outputAttribute, impactfulAttribute-anotherImportantAttribute); };
		this.appliedFun2 = new SimRoleFun (outputAttribute, impactfulRoleId, [impactfulAttributeName,impactfulAttribute2Name], funIfOutAttrExists_twoInputs, funIfOutAttrNotExists_twoInputs);
	});
	beforeEach( () => {
		this.obj1 = new SimObject(1,new Map());
		this.obj2 = new SimObject(2,new Map());
	});
	it('should add an attribute to an object based on a single attribute of another object', () => {
		let abstRole1 = new SimActAbstRole(1,[this.appliedFun],[]);
		let abstRole2 = new SimActAbstRole(2,[],[]);
		
		let role1 = new SimActRole(abstRole1, this.obj1);
		let role2 = new SimActRole(abstRole2, this.obj2);
		
		this.obj2.attributes.set(this.impactfulAttributeName, 777);
		
		applyRoleFun(this.obj1, this.appliedFun, [role1,role2]);
		
		expect( this.obj1.attributes.has(this.outputAttribute) ).equal(true);
		expect( this.obj1.attributes.get(this.outputAttribute) ).equal(777);
	});
	it('should update an attribute of an object based on a single attribute of another object', () => {
		let abstRole1 = new SimActAbstRole(1,[this.appliedFun],[]);
		let abstRole2 = new SimActAbstRole(2,[],[]);
		
		let role1 = new SimActRole(abstRole1, this.obj1);
		let role2 = new SimActRole(abstRole2, this.obj2);
		
		this.obj1.attributes.set(this.outputAttribute, 333);
		this.obj2.attributes.set(this.impactfulAttributeName, 444);
		
		applyRoleFun(this.obj1, this.appliedFun, [role1,role2]);
		
		expect( this.obj1.attributes.has(this.outputAttribute) ).equal(true);
		expect( this.obj1.attributes.get(this.outputAttribute) ).equal(777);
	});
	it('should add an attribute to an object based on multiple attributes of another object', () => {
		let abstRole1 = new SimActAbstRole(1,[this.appliedFun2],[]);
		let abstRole2 = new SimActAbstRole(2,[],[]);
		
		let role1 = new SimActRole(abstRole1, this.obj1);
		let role2 = new SimActRole(abstRole2, this.obj2);
		
		this.obj2.attributes.set(this.impactfulAttributeName, 456);
		this.obj2.attributes.set(this.impactfulAttribute2Name, 111);
		
		applyRoleFun(this.obj1, this.appliedFun2, [role1,role2]);
		
		expect( this.obj1.attributes.has(this.outputAttribute) ).equal(true);
		expect( this.obj1.attributes.get(this.outputAttribute) ).equal(345);
	});
	it('should update an attribute of an object based on multiple attributes of another object', () => {
		let abstRole1 = new SimActAbstRole(1,[this.appliedFun2],[]);
		let abstRole2 = new SimActAbstRole(2,[],[]);
		
		let role1 = new SimActRole(abstRole1, this.obj1);
		let role2 = new SimActRole(abstRole2, this.obj2);
		
		this.obj1.attributes.set(this.outputAttribute, 777);
		this.obj2.attributes.set(this.impactfulAttributeName, 456);
		this.obj2.attributes.set(this.impactfulAttribute2Name, 111);
		
		applyRoleFun(this.obj1, this.appliedFun2, [role1,role2]);
		
		expect( this.obj1.attributes.has(this.outputAttribute) ).equal(true);
		expect( this.obj1.attributes.get(this.outputAttribute) ).equal(210);
	});
})
