
function test()
{
	var canvas = new Tor.Canvas(
			document.getElementById("screen"),
			document.createElement("canvas"), 
			Tor.getImage("graphics/background.png"));
	var scene = new Tor.Scene(canvas);

	var world = new Tor.PhysicWorld(20.0);
	world.setupDebugDrawing(document.getElementById("screen").getContext("2d"));
	world.addStaticEdges(
			new Tor.Vec2d(0, 0),
			new Tor.Vec2d(40, 0),
			new Tor.Vec2d(40, 30),
			new Tor.Vec2d(0, 30),
			new Tor.Vec2d(0, 0));
	
	world.addStaticEdges(
			new Tor.Vec2d(20, 7),
			new Tor.Vec2d(30, 15),
			new Tor.Vec2d(20, 23),
			new Tor.Vec2d(10, 15),
			new Tor.Vec2d(15, 7));
	
	var player = function()
	{
		var player = {};
		
		player.body = world.addDynamicRect(new Tor.Vec2d(0.7, 0.8));
		player.body.setPosition(new Tor.Vec2d(20, 10));
		
		player.sprite = new Tor.StripSprite();
		player.sprite.addAnimation({
			name: "anim1",
			image: Tor.getImage("graphics/piratebeard.png"),
			basePoint: new Tor.Vec2d(9, 150),
			size: new Tor.Vec2d(25, 30),
			shift: new Tor.Vec2d(33, 0),
			framesCount: 8,
			frameDuration: 0.1,
		});
		
		player.sceneNode = new Tor.SceneNode(player.sprite);
		scene.addObject(player.sceneNode);
		
		player.body.addView(player.sceneNode);
		
		player.inputController = new InputController(player.body);
		
		return player;
	}();
		
	function update() {
		
		world.update();
		
		scene.render();
		
		world.drawDebugData();
		
		player.inputController.update();
		
		Tor.requestAnimationFrame(update);
	};

	Tor.requestAnimationFrame(update);
}

document.observe("dom:loaded", function() {
	test();
});



	