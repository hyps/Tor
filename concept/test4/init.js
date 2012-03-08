		var initTimer = setInterval(function()
		{
			var scale = 3;
			var width = Math.ceil(640 / scale);
			var height = Math.floor(300 / scale);
			try
			{
				ig.main('#canvas-bitdungeon', BitDungeon, 60, width, height, scale);
				clearInterval(initTimer);
			}
			catch(error) {}
		}, 5);	
