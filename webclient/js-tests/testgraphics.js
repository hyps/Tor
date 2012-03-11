GraphicsTests = TestCase("GraphicsTests");

GraphicsTests.prototype.testGreet = function() 
{
	var testObject1 = 
	{
			name: "object1", 
			zOrder: function()
			{
				return 1;
			}
	};
	
	var testObject2 = 
	{
			name: "object2", 
			zOrder: function()
			{
				return 2;
			}
	}
	
	var scene = new Tor.GraphicScene;
	
	scene.addObject(testObject1);
	scene.addObject(testObject2);
	  	
	assertEquals([testObject1, testObject2], scene.objects);
};
