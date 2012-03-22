CommonTests = TestCase("CommonTests");

CommonTests.prototype.testCore = function() 
{
	function bla()
	{
	}
	
	Tor.requestAnimationFrame(bla);
};
