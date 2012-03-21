(function(Tor)
{
	var   b2Vec2 = Box2D.Common.Math.b2Vec2
	,  b2AABB = Box2D.Collision.b2AABB
	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
	,	b2Body = Box2D.Dynamics.b2Body
	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	,	b2Fixture = Box2D.Dynamics.b2Fixture
	,	b2World = Box2D.Dynamics.b2World
	,	b2MassData = Box2D.Collision.Shapes.b2MassData
	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
	,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
	;
	
	Tor.PhysicBody = new Class.create({
		initialize: function(b2Body, world)
		{
			this.b2Body = b2Body;
			
			this.b2Body.SetUserData(this);
			
			this.world = world;
			
			this.views = [];
		},
	
		setPosition: function(position)
		{
			this.b2Body.SetPosition(position);
			
			this.updateViewsPosition();
		},
		
		addView: function(view)
		{
			this.views.push(view);
			
			this.updateViewsPosition();
		},
		
		physicUpdate: function()
		{
			this.updateViewsPosition();
		},
			
		updateViewsPosition: function()
		{
			this.views.each(function(view)
			{
				view.setPosition(this.world.toGraphicCoords(
						this.b2Body.GetWorldCenter()));
				
				view.setRotation(this.b2Body.GetAngle());
			}.bind(this));
		}
	});
	
	Tor.PhysicWorld = new Class.create({
	
		initialize: function(scaleFactor)
		{
			// scale from pixels to meters
			this.physicScale = scaleFactor; 
			
			this.world = new  Box2D.Dynamics.b2World(
					new Tor.Vec2d(0, 0)    //gravity
					,  true             //allow sleep
			);
		},
		
		toGraphicCoords: function(physicCoords)
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
					body.GetUserData().physicUpdate();
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
		},
		
		addStaticEdges: function()
		{
			for (var i = 1; i < arguments.length; ++i)
			{
				// create static body
				var bodyDef = new b2BodyDef;
				bodyDef.type = b2Body.b2_staticBody;
				bodyDef.position = new Tor.Vec2d(0, 0);

				var fixDef = new b2FixtureDef;
				fixDef.shape = new b2PolygonShape;

				fixDef.shape.SetAsEdge(arguments[i-1], arguments[i]);
				
				var body = this.world.CreateBody(bodyDef);
				
				body.CreateFixture(fixDef);
			}
		},
		
		addDynamicRect: function(size)
		{
			var bodyDef = new b2BodyDef;
			bodyDef.type = b2Body.b2_dynamicBody;
			
			var fixDef = new b2FixtureDef;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox(size.x, size.y);

			var body = this.world.CreateBody(bodyDef);
			
			body.CreateFixture(fixDef);
			
			return new Tor.PhysicBody(body, this);
		}
	});
})(window.Tor = window.Tor || {});
