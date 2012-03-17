(function(Tor)
{
	Tor.Vec2d = function (x, y)
	{
		this.x = x;
		this.y = y;
	};

	Tor.Vec2d.prototype = new Box2D.Common.Math.b2Vec2();
	
	Tor.Vec2d.prototype.Mul = function(value)
				{
					var result = new Tor.Vec2d(this.x, this.y);
					
					result.Multiply(value);
					
					return result;
				};
			
})(window.Tor = window.Tor || {});
