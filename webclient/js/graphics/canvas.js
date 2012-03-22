(function(Tor)
{
	Tor.Canvas = new Class.create({
		initialize: function(canvas, backbuffer, background)
		{
			this.canvas = canvas;
			
			this.background = background;
			
			this.resizeEvent = new Tor.Event();
			
			this.backbuffer = backbuffer;
			
			this.backbuffercontext = backbuffer.getContext("2d");
			
			this.resize(this.canvas.width, this.canvas.height);
		},

		resize: function(width, height)
		{
			this.canvas.width = width;
			
			this.canvas.height = height;
			
			this.backbuffer.width = width;
			
			this.backbuffer.height = height;
			
			this.resizeEvent.fire(width, height);
		},
		
		beginScene: function()
		{
			this.backbuffercontext.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
		},
		
		getBuffer: function()
		{
			return this.backbuffercontext;
		},
		
		endScene: function()
		{
			this.canvas.getContext("2d").drawImage(this.backbuffer, 0, 0);
		}
	});
})(window.Tor = window.Tor || {});
