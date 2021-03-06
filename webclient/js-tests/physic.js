PhysicTests = TestCase("PhysicTests");

PhysicTests.prototype.testBasic = function() 
{
	var world = new Tor.PhysicWorld(20.0);
	
	world.addStaticEdges(
		new Tor.Vec2d(0, 0),
		new Tor.Vec2d(5, 0),
		new Tor.Vec2d(5, 5),
		new Tor.Vec2d(0, 5),
		new Tor.Vec2d(0, 0));
	
	var sceneNode1 = new Tor.SceneNode();
	
	var sceneNode2 = new Tor.SceneNode();
	
	var rect = world.addDynamicRect(new Tor.Vec2d(0.5, 0.5));
	
	rect.setPosition(new Tor.Vec2d(1, 1));
	
	rect.addView(sceneNode1);
	
	var rect2 = world.addDynamicRect(new Tor.Vec2d(0.5, 0.5));
	
	rect2.setPosition(new Tor.Vec2d(4, 4));
	
	rect2.addView(sceneNode2);
	
	// do some stepping (10 second), make sure world is not moving
	var step = function()
	{
		for (var i = 0; i < (60*10); ++i)
		{
			world.update();
		}
	};
	
	step();
	
	assertEquals(new Tor.Vec2d(20, 20), sceneNode1.position);
	assertEquals(new Tor.Vec2d(80, 80), sceneNode2.position);
	
	// do a just a little push
	rect.applyImpulse(new Tor.Vec2d(0, -1), rect.getPosition());
	
	step();

	// we see, that rect is moved to top, and rect2 stend still
	assertEquals(new Tor.Vec2d(20, 10.149999999999999), sceneNode1.position);
	assertEquals(new Tor.Vec2d(80, 80), sceneNode2.position);
};
