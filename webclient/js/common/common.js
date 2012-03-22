
(function(Tor)
{
	Tor.requestAnimationFrame = function(func)
	{
		// some crazy javascript issue Tor.rq not working just crazy crazy crazy
		var rq = function(){
			return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
		}();
		
		rq(func);
	};
	
	Tor.getImage = function(path)
	{
		var image = new Image();
		
		image.src = path;
		
		return image;
	};
})(window.Tor = window.Tor || {});
