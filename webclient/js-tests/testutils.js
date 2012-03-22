var testDocumentCanvas =
{
	translate: function(x, y)
	{
		this.x = x;
		this.y = y;
	},

	rotate: function(angle)
	{
		this.angle = angle;
	},
	
	drawImage : function()
	{
		
	},

	save : function(){},
	
	restore : function() {},
	
	getContext: function()
	{
		return this;
	}
};

var testCanvas = new Tor.Canvas(testDocumentCanvas, testDocumentCanvas);