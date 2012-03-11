
(function(Tor)
{
	Tor.GraphicScene = Class.create({
		initialize: function(canvas)
		{
			this.canvas = canvas;
			
			this.objects = [];
			
			this.zOrderDirty = false;
		},
		addObject: function(object)
		{
			this.objects.push(object);
		},
		removeObject: function(object)
		{
			
		}
	});
})(window.Tor = window.Tor || {});
