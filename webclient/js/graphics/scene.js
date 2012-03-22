
(function(Tor)
{
	Tor.Scene = Class.create({
		
		initialize: function(canvas)
		{
			this.canvas = canvas;
			
			this.objects = [];
			
			this.zOrderDirty = false;
		},
		
		addObject: function(object)
		{
			this.objects.push(object);
			
			this.zOrderDirty = true;
		},
		
		removeObject: function(object)
		{
			this.objects = this.objects.without(object);
		},
		
		render: function()
		{
			if (this.zOrderDirty)
			{
				this.objects.sort(function(left, right)
					{
						return left.zOrder() > right.zOrder();
					});
				
				this.zOrderDirty = false;
			}
			
			this.canvas.beginScene();
				
			this.objects.each(function(item)
			{
			    this.canvas.getBuffer().save();
				
				item.render(this.canvas.getBuffer());
				
				this.canvas.getBuffer().restore();
			}.bind(this));
			
			this.canvas.endScene();
		}
	});
})(window.Tor = window.Tor || {});

