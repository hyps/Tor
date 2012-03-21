
(function(Tor)
{
	Tor.SceneNode = Class.create({
		
		initialize: function(sprite)
		{
			this.position = new Tor.Vec2d(0, 0);
			this.angle = 0;
			this.sprite = sprite;
		},
		
		setPosition: function(position)
		{
			this.position = position;
		},
		
		setRotation: function(angle)
		{
			this.angle = angle;
		},
		
		render: function(canvas)
		{
			canvas.translate(this.position.x, this.position.y);
			
			canvas.rotate(this.angle);
			
			this.sprite.render(canvas);
		}
	});
})(window.Tor = window.Tor || {});