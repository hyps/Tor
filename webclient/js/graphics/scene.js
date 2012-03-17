
(function(Tor)
{
	Tor.GraphicScene = Class.create({
		
		initialize: function(canvas, backbuffer, background)
		{
			this.canvas = canvas;
			this.backbuffer = backbuffer;
			this.background = background;
			this.objects = [];
			this.zOrderDirty = false;
			this.width = canvas.width;
			this.height = canvas.height;
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
			
			this.backbuffer.drawImage(this.background, 0, 0, this.width, this.height);
				
			this.objects.each(function(item)
			{
			    this.backbuffer.save();
				
				item.render(this.backbuffer);
				
				this.backbuffer.restore();
			}.bind(this));
			
			this.canvas.drawImage(this.backbuffer, 0, 0);
		}
	});
})(window.Tor = window.Tor || {});

