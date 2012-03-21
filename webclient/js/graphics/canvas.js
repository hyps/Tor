(function(Tor)
{
	Tor.Canvas = new Class.create({
		initialize: function()
		{
			this.width = 0;
			
			this.height = 0;
			
			this.resizeEvent = new Tor.Event();
		},

		resize: function(width, height)
		{
			this.width = width;
			
			this.height = height;
			
			this.resizeEvent.fire(width, height);
		}
	});
})(window.Tor = window.Tor || {});
