SpriteTests = TestCase("SpriteTests");

SpriteTests.prototype.testCore = function() 
{
	var sprite = new Tor.StripSprite();
	
	sprite.timer = 
	{
		elapsedValue : 0.0,
		elapsed: function()
		{
			return this.elapsedValue;
		},
		reset: function()
		{
		}
	};
	
	assertEquals((new Tor.Vec2d(10, 10)).Mul(3).x, 30);
	
	sprite.addAnimation({
			name: "anim1",
			image: 123,
			basePoint: new Tor.Vec2d(10, 10),
			size: new Tor.Vec2d(20, 20),
			shift: new Tor.Vec2d(40, 0),
			framesCount: 6,
			frameDuration: 0.2,
			});
		
	
	var testCanvas =
	{
		drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh)
		{
			assertEquals(image, 123);
			assertEquals(sx, 10);
			assertEquals(sy, 10);
			assertEquals(sw, 20);
			assertEquals(sh, 20);
			assertEquals(dx, -10);
			assertEquals(dy, -10);
			assertEquals(dw, 20);
			assertEquals(dh, 20);
		}
	}
	
	sprite.render(testCanvas);
	
	sprite.timer.elapsedValue = 1.3;
	
	sprite.render(testCanvas);
	
	var testCanvas =
	{
		drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh)
		{
			assertEquals(sx, 50);
		}
	}
	
	sprite.timer.elapsedValue = 1.5;
	
	sprite.render(testCanvas);
};
