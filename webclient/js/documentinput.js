
var DocumentInput = Class.create({
	
	initialize: function()
	{
		this.topLock = 0;
		
		document.observe("keydown", function(e) {
			switch(e.keyCode) {
			case 38:
				this.topLock++;
				break;

			case 83:
				this.bottomLock++;
				break;

			case 37:
				this.leftLock++;
				break;

			case 39:
				this.rightLock++;
				break;
			}		
		}.bind(this));

		document.observe("keyup", function(e) {
			switch(e.keyCode) {
			case 38:
				this.topLock = 0;
				break;

			case 83:
				this.bottomLock = 0;
				break;

			case 37:
				this.leftLock = 0;
				break;

			case 39:
				this.rightLock = 0;
				break;
			}
		}.bind(this));
	}

});