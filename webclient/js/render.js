//sow.Render = function() {
//	this.screenEl = document.getElementById("screen");
//	this.bufferEl = document.createElement('canvas');
//	
//	this.resize();
//	document.observe("resize", this.resize.bind(this));
//
//	this.screenEl.style.cursor = "url(attack.png),auto";
//	
//	if (this.screenEl.getContext) {
//		this.screen = this.screenEl.getContext("2d");
//		this.buffer = this.bufferEl.getContext("2d");
//
//		this.screenEl.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
//	} else {
//		alert("Не удалось запустить игру. Вы используете устаревший браузер. Обновите его или установите другой браузер: Firefox, Chrome или Opera.");
//		return;
//	}
//	
//	this.period        = 1000 / this.DEFAULT_FPS;
//	this.gameStartTime = new Date().getTime();
//    this.beforeTime    = this.gameStartTime;
//
//	this.background = new Image();
//	this.background.src = "graphics/background.png";
//
//	setTimeout(this.loop.bind(this), 2000); 
//};
//
//sow.Render.prototype.DEFAULT_FPS = 33;
//
//sow.Render.prototype.width = 800;
//sow.Render.prototype.height = 600;
//
//sow.Render.prototype.screenEl;
//sow.Render.prototype.bufferEl;
//
//sow.Render.prototype.screen;
//sow.Render.prototype.buffer;
//
//sow.Render.prototype.gameStartTime;
//
//sow.Render.prototype.period;
//sow.Render.prototype.beforeTime;
//sow.Render.prototype.afterTime;
//sow.Render.prototype.timeDiff;
//sow.Render.prototype.overSleepTime = 0;
//sow.Render.prototype.sleepTime;
//sow.Render.prototype.fps = 0;
//
//sow.Render.prototype.background;
//sow.Render.prototype.players = $H();
//sow.Render.prototype.attacks = $H();
//
//sow.Render.prototype.loop = function(fl) {
//    this.actions(new Date().getTime());
//    this.draw();
//    this.swap();
//    
//    this.afterTime = new Date().getTime();
//    
//    this.timeDiff = this.afterTime - this.beforeTime;
//    this.sleepTime = (this.period - this.timeDiff) - this.overSleepTime;
//    
//    if (this.sleepTime > 0) {
//    	setTimeout(function() {
//    		this.overSleepTime = (new Date().getTime() - this.afterTime) - this.sleepTime;
//    		this.beforeTime = new Date().getTime();
//    		
//    		this.loop();
//    	}.bind(this), this.sleepTime);
//    } else {
//    	this.beforeTime = new Date().getTime();
//    	this.overSleepTime = 0;
//		
//		setTimeout(this.loop.bind(this), 0);    	
//    }  
//};
//
//sow.Render.prototype.actions = function() {
//	player.actions();
//};
//
//sow.Render.prototype.draw = function() {
//	//player.draw(this.screen, new Date().getTime());
//
//	this.buffer.drawImage(this.background, 0, 0, this.width, this.height);
//
//	this.players.each(function(pair) {
//		pair.value.draw(this.buffer, new Date().getTime());
//	}.bind(this));
//
//	this.attacks.each(function(pair) {
//		pair.value.draw(this.buffer, new Date().getTime());
//	}.bind(this));
//};
//
//sow.Render.prototype.swap = function() {
//	this.screen.clearRect(0, 0, this.width, this.height);
//	this.screen.drawImage(this.bufferEl, 0, 0);
//};
//
//sow.Render.prototype.resize = function() {
//	//this.width = 480;//window.innerWidth;
//	//this.height = 240;//window.innerHeight;
//
//	this.screenEl.width = this.width;
//	this.screenEl.height = this.height;
//	
//	this.bufferEl.width = this.width;
//	this.bufferEl.height = this.height;
//};
//
