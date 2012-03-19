(function(Tor)
{
	Tor.PhysicWorld = new Class.create({
	
		initialize: function(logicWidth, logicHeight, canvas)
		{
			// scale from pixels to meters
			this.physicScale = 20.0; 
			
			this.world = new  Box2D.Dynamics.b2World(
					new Tor.Vec2d(0, 0)    //gravity
					,  true             //allow sleep
			);
		},
		
		toGrapicCoords: function(physicCoords)
		{
			return new Tor.Vec2d(
			    physicCoords.x*this.physicScale,
				physicCoords.y*this.physicScale);
		},

		update: function()
		{
			var body = this.world.GetBodyList();
			
			while (body != null)
			{
				if (body.GetUserData() != null)
				{
					body.GetUserData().update(this, body);
				}
				
				body = body.GetNext();
			}
			
			this.world.Step(
					1 / 60   //frame-rate
					,  10    //velocity iterations
					,  10    //position iterations
			);
			
			this.world.DrawDebugData();
			
			this.world.ClearForces();
		}
	});
})(window.Tor = window.Tor || {});
