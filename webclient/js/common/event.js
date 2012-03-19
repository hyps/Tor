(function(Tor)
{
	Tor.Event = new Class.create({
		initialize: function()
		{
			this.listeners = [];
		},

		subscribe: function(func)
		{
			this.listeners.push(func);
			
			var eventThis = this;
			
			return {
				unsubscribe: function()
				{
					eventThis.listeners = eventThis.listeners.without(func);
				}
			};
		},
		
		fire: function()
		{
			var eventArgs = arguments;
			
			this.listeners.each(function(func)
			{
				func.apply(this, eventArgs);
			});
		}
	});
})(window.Tor = window.Tor || {});
