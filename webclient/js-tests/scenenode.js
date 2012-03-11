SceneNodeTests = TestCase("SceneNodeTests");

SceneNodeTests.prototype.testCore = function() 
{
	var testSprite = {render: function(canvas)
	{
		assertEquals(canvas.x, 10);
		assertEquals(canvas.y, 20);
		assertEquals(canvas.angle, 1.0);
	}};
	
	var testNode = new Tor.SceneNode(testSprite);
	
	testNode.setPosition(10, 20);
	testNode.setRotation(1.0);
	
	var scene = new Tor.GraphicScene(testCanvas, testCanvas);
	
	scene.addObject(testNode);
		  	
	scene.render();
};
