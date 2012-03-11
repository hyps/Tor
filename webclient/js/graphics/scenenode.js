
(function(Tor)
{
	Tor.SceneNode = Class.create({
		
		initialize: function(sprite)
		{
			this.x = 0;
			this.y = 0;
			this.angle = 0;
			this.sprite = sprite;
		},
		
		setPosition: function(x, y)
		{
			this.x = x;
			
			this.y = y;
		},
		
		setRotation: function(angle)
		{
			this.angle = angle;
		},
		
		render: function(canvas)
		{
			canvas.translate(this.x, this.y);
			
			canvas.rotate(this.angle);
			
			this.sprite.render(canvas);
		}
	});
})(window.Tor = window.Tor || {});