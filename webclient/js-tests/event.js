EventTests = TestCase("EventTests");

EventTests.prototype.testCore = function() 
{
	var s1 = new Tor.Event();
	
	var object = {bla: 0}; 
	
	var eventMonitor = s1.subscribe(
			function()
			{
				this.bla += arguments[0];
			}.bind(object));
	
	s1.fire(1);
	
	s1.fire(3);
	
	assertEquals(4, object.bla);
	
	eventMonitor.unsubscribe();
	
	s1.fire(2);
	
	assertEquals(4, object.bla);
};
