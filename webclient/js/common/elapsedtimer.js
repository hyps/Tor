
(function(Tor)
{
	Tor.ElapsedTimer = Class.create({
		
		initialize: function(image)
		{
			this.reset();
		},
		
		elapsed: function()
		{
			return (new Date().getTime() - this.startTime.getTime())/1000;
		},
		
		reset: function()
		{
			this.startTime = new Date();
		}
	});
})(window.Tor = window.Tor || {});

