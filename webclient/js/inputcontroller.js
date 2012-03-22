
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
			this.body.applyImpulse(new vec(0, -1), this.body.getPosition());
		}
		if (this.inputMonitor.leftLock > 0)
		{
			this.body.applyImpulse(new vec(-1, 0), this.body.getAABB().lowerBound);
		}
		if (this.inputMonitor.rightLock > 0)
		{
			this.body.applyImpulse(new vec(1, 0), this.body.getAABB().lowerBound);
		}
		if (this.inputMonitor.bottomLock > 0)
		{
			this.body.applyImpulse(new vec(0, 1), this.body.getPosition());
		}
	}
	
});