
var InputController = Class.create({
	
	initialize: function(body)
	{
		this.body = body;
		
		this.inputMonitor = new DocumentInput();
	},
	
	update: function()
	{
		var vec = Box2D.Common.Math.b2Vec2;
		
		if (this.inputMonitor.topLock > 0)
		{
			this.body.ApplyImpulse(new vec(0, -30), this.body.GetWorldCenter());
		}
		if (this.inputMonitor.leftLock > 0)
		{
			this.body.ApplyImpulse(new vec(-30, 0), this.body.GetFixtureList().GetAABB().lowerBound);
		}
		if (this.inputMonitor.rightLock > 0)
		{
			this.body.ApplyImpulse(new vec(30, 0), this.body.GetFixtureList().GetAABB().lowerBound);
		}
	}
	
});