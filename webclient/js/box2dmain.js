
/*
 * logic coordinates would have (0,0) at the LEFT BOTTOM of the canvas 
 * and (100, 100) at the RIGHT TOP (just like simple human readable graphics)
 * 
 * so there is toWorld to convert from logic coords to physic measures
 * and fromWorld for opposite
 * */
var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
var PHYSIC_SCALE = 20;
var SCALE = PHYSIC_SCALE;

var LOGIC_X_MAX = 100;
var LOGIC_Y_MAX = 100;

function toWorldX(logicX)
{
	return (CANVAS_WIDTH*(logicX)/LOGIC_X_MAX)/PHYSIC_SCALE;
}

function toWorldY(logicY)
{
	return (CANVAS_HEIGHT*(LOGIC_Y_MAX - logicY)/LOGIC_Y_MAX)/PHYSIC_SCALE;
}

function toWorldWidth(logicWidth)
{
	return toWorldX(logicWidth);
}

function toWorldHeight(logicHeight)
{
	return (CANVAS_HEIGHT*logicHeight/LOGIC_Y_MAX)/PHYSIC_SCALE;
}

function testBox2d()
{
	//	http://blog.sethladd.com/2011/09/box2d-javascript-example-walkthrough.html

	var requestAnimFrame = (function(){
		return  window.requestAnimationFrame       || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 60);
		};
	})();

	var   b2Vec2 = Box2D.Common.Math.b2Vec2
	,  b2AABB = Box2D.Collision.b2AABB
	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
	,	b2Body = Box2D.Dynamics.b2Body
	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	,	b2Fixture = Box2D.Dynamics.b2Fixture
	,	b2World = Box2D.Dynamics.b2World
	,	b2MassData = Box2D.Collision.Shapes.b2MassData
	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
	,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
	;

	var world = new b2World(
			new b2Vec2(0, 40)    //gravity
			,  true                 //allow sleep
	);

	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_staticBody;
	
	//	positions the center of the object (not upper left!)
	bodyDef.position.x = toWorldX(50);
	bodyDef.position.y = toWorldY(2);

	fixDef.shape = new b2PolygonShape;

	//	half width, half height.
	fixDef.shape.SetAsBox(toWorldWidth(49), toWorldHeight(2));
	
	bodyDef.position.x = 0;
	bodyDef.position.y = 0;
	
/*	fixDef.shape.SetAsArray([new b2Vec2(0, 0),
	                         new b2Vec2(10, 0),
	                         new b2Vec2(20, 20),
	                         new b2Vec2(0, 10)]);*/
	
	fixDef.shape.SetAsEdge(new b2Vec2(0, 20), new b2Vec2(50, 20));
		
	var worldBody = world.CreateBody(bodyDef);
	
	worldBody.CreateFixture(fixDef);
	
	bodyDef.type = b2Body.b2_dynamicBody;

	//	debug drawing
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(
			toWorldWidth(5),
			toWorldHeight(5)
	);
	
	bodyDef.position.x = Math.random() * 25;
	bodyDef.position.y = Math.random() * 10;
	
	var objectBody = world.CreateBody(bodyDef);
	
	objectBody.CreateFixture(fixDef);
	
	objectBody.SetUserData(new InputController(objectBody));
	
	//	setup debug draw
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(document.getElementById("screen").getContext("2d"));
	debugDraw.SetDrawScale(SCALE);
	debugDraw.SetFillAlpha(0.3);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	world.SetDebugDraw(debugDraw);

	function update() {
		
		var body = world.GetBodyList();
		
		while (body != null)
		{
			if (body.GetUserData() != null)
			{
				body.GetUserData().update();
			}
			
			body = body.GetNext();
		}
		
		world.Step(
				1 / 60   //frame-rate
				,  10       //velocity iterations
				,  10       //position iterations
		);
		world.DrawDebugData();
		world.ClearForces();

		requestAnimFrame(update);
	}; // update()

	requestAnimFrame(update);
}

document.observe("dom:loaded", function() {
	testBox2d();
});



	