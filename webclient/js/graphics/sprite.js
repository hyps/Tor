
(function(Tor)
{
	Tor.StripSprite = Class.create({
		
		initialize: function()
		{
			this.animations = new Hash();
			
			this.timer = new Tor.ElapsedTimer();
		},
		
		addAnimation: function(description)
		{
			this.animations.set(description.name, description);
			
			if (this.currentAnimation == null)
			{
				this.currentAnimation = description.name;
			}
		},
		
		setCurrentAnimation: function(name)
		{
			this.currentAnimation = name;
			
			this.timer.reset();
		},
		
		render: function(canvas)
		{
			var animation = this.animations.get(this.currentAnimation);
			
			var elapsed = this.timer.elapsed();
			
			var frameNumber = Math.floor(elapsed/animation.frameDuration);
			
			var currentFrame = frameNumber % animation.framesCount;
			
			var resultPoint = animation.basePoint.Copy();
			
			resultPoint.Add(animation.shift.Mul(currentFrame));
			
			var destPoint = new Tor.Vec2d(0, 0);
			
			destPoint.Subtract(animation.size.Mul(0.5));
			
			canvas.drawImage(animation.image,
					resultPoint.x,
					resultPoint.y,
					animation.size.x,
					animation.size.y,
					destPoint.x,
					destPoint.y,
					animation.size.x,
					animation.size.y);
		}
	});
})(window.Tor = window.Tor || {});

