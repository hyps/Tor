var PLAYER_SPRITE_1 = new Image();

{
	PLAYER_SPRITE_1.src = "graphics/piratebeard.png";
}

sow.Player = function(iam) {
	this.lastTime = new Date().getTime();
	this.iam = iam;
	
	if (this.iam) {
		if (window.WebSocket) {
			this.ws = new WebSocket("ws://localhost:8887");
		} else if (window.MozWebSocket) {
			this.ws = new MozWebSocket("ws://localhost:8887");
		} else {
			alert("WebSocket не поддерживается в вашем браузере");
			return;
		}

		this.ws.onopen = function() {};
		this.ws.onclose = function() {};
		this.ws.onmessage = this.recv.bind(this);
	}
};

sow.Player.prototype.id = 0;
sow.Player.prototype.iam = true;
sow.Player.prototype.coordX = 0;
sow.Player.prototype.coordY = 0;
sow.Player.prototype.lastTime;
sow.Player.prototype.die = false;

sow.Player.prototype.right = true;
sow.Player.prototype.bottom = false;
sow.Player.prototype.left = false;
sow.Player.prototype.top = false;
sow.Player.prototype.first = 0;
sow.Player.prototype.ws = null;
sow.Player.prototype.speed = 30;

sow.Player.prototype.recv = function(e) {
	var data = e.data.evalJSON(false);

	switch (data.type) {
		case "REG":
			this.init(data);
			break;
		case "REMOVE_PLAYER":
			render.players.unset(data.id);
			break;
		case "UPDATE": 
			this.update(data);
			break;
		case "DEAD":
			this.dead(data);
			break;
		case "ALIVE": 
			this.alive(data);
			break;
		case "PLAYER_ATTACK":
			var attack = new sow.Attack(data.x, data.y);
			render.attacks.set(attack.id, attack);
			break;
	}
};

sow.Player.prototype.init = function(data) {
	this.id = data.id;
	this.coordX = data.x;
	this.coordY = data.y;
	render.players.set(this.id, this);
};

sow.Player.prototype.dead = function(data) {
	render.players.get(data.id).die = true;

	if (this.id == data.id) {
		var offset = render.screenEl.positionedOffset();
		$("restore").style.top = offset.top + "px";
		$("restore").style.left = offset.left + "px";
		$("restore").show();
	}
};

sow.Player.prototype.alive = function(data) {
	if (this.id == data.id) {
		$("restore").hide();
	}

	var p = render.players.get(data.id);
	
	p.coordX = data.x;
	p.coordY = data.y;
	p.frameCount = 0;
	p.die = false;
};

sow.Player.prototype.update = function(data) {
	if (this.id == 0) {
		return;
	}

	data.players.each(function(val) {
		var p =	render.players.get(val.id);
		
		if (!p) {
			var newplayer= new sow.Player(false);
			newplayer.id = val.id;
			render.players.set(newplayer.id, newplayer);			
			p = newplayer;
		} else if (p.id == this.id) {
			return;
		}

		p.coordX = val.x;
		p.coordY = val.y;
	}.bind(this));
};

sow.Player.prototype.actions = function(gametime) {
	if (this.die) {
		return;
	}

	var step = 10;

	if (input.touch != null) {
		if (!this.top)
			this.coordX += input.touch.x > this.coordX ? step : step * -1;

		if (!this.left)
			this.coordY += input.touch.y > this.coordY ? step : step * -1;

		if (Math.abs(this.coordX - input.touch.x) <= step) {
			this.top = true;
		}

		if (Math.abs(this.coordY - input.touch.y) <= step) {
			this.left = true;
		}

		if (this.top && this.left) {
			this.top = false;
			this.left = false;
			input.touch = null;		
		}
	} else {
		if (input.leftLock) this.coordX -= step;
		if (input.rightLock) this.coordX += step;
		if (input.topLock) this.coordY -= step;
		if (input.bottomLock) this.coordY += step;
	
		if (this.right && this.coordX > 580) {
			this.right = false;
			this.bottom = true;
		}
	
		if (this.bottom && this.coordY > 250) {
			this.bottom = false;
			this.left = true;
		}
	
		if (this.left && this.coordX < 50) {
			this.left = false;
			this.top = true;
		}
	
		if (this.top && this.coordY < 50) {
			this.top = false;
			this.right = true;
		}
	}	
	
	this.ws.send(Object.toJSON({
		type:'PLAYER_STATE', 
		id: this.id, 
		x: this.coordX,
		y: this.coordY
	}));
};

sow.Player.prototype.frameNr = 7;
sow.Player.prototype.frameTicker = 0;
sow.Player.prototype.framePeriod = 50;
sow.Player.prototype.frameCount = -1;

sow.Player.prototype.draw = function(ctx, gametime) {
	if (this.die) {
		return;
	}

	if (gametime > this.frameTicker + this.framePeriod) {
		this.frameTicker = gametime;
		this.frameCount++;

		if (this.frameCount > this.frameNr) {
			this.frameCount = 0;
		}
	}
	
	//ctx.font = "12pt Verdana";
	//ctx.fillStyle = "#000000";
	//ctx.fillText(this.frameCount, 200, 100);

	var offset = 9 * (this.frameCount + 1);

	if (this.frameCount == 0 ) {
		offset = 9;
	}

	ctx.drawImage(PLAYER_SPRITE_1, (this.frameCount) * 24 + offset, 192, 24, 32, this.coordX, this.coordY, 24, 32);
};
