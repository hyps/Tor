SceneTests = TestCase("SceneTests");

SceneTests.prototype.testCore = function() 
{
	var renderList = [];
	
	var testObject1 = 
	{
			name: "object1", 
			zOrder: function()
			{
				return 2;
			},
			render : function(){renderList.push(this.name);}
	};
	
	var testObject2 = 
	{
			name: "object2", 
			zOrder: function()
			{
			return 1;
			},
			render : function(){renderList.push(this.name);}
	};
	
	var scene = new Tor.Scene(testCanvas);
	
	scene.addObject(testObject1);
	scene.addObject(testObject2);
	  	
	assertEquals([testObject1, testObject2], scene.objects);
	
	scene.render();
	
	assertEquals(["object2", "object1"], renderList);
	
	scene.removeObject(testObject1);
	
	scene.render();
	
	assertEquals(["object2", "object1", "object2"], renderList);
};
