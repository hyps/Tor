sow.Input = function() {
	render.screenEl.ontouchstart = function(e) {
		this.touch = this.getCoords(e.touches[0]);
	}.bind(this);

	document.observe("keydown", function(e) {
		switch(e.keyCode) {
			case 87:
				this.topLock++;
				break;
				
			case 83:
				this.bottomLock++;
				break;
				
			case 65:
				this.leftLock++;
				break;
			
			case 68:
				this.rightLock++;
				break;
		}		
	}.bind(this));
	
	document.observe("keyup", function(e) {
		switch(e.keyCode) {
			case 87:
				this.topLock = 0;
				break;
				
			case 83:
				this.bottomLock = 0;
				break;
				
			case 65:
				this.leftLock = 0;
				break;
			
			case 68:
				this.rightLock = 0;
				break;
		}
	}.bind(this));

	$("restore").observe("click", function() {
		if (player.die) {
			player.ws.send(Object.toJSON({type:"RESTORE", id:player.id}));
		}
	});

	$("screen").observe("click", function(e) {
		if (player.die) {
			return;
		}

		var offset = render.screenEl.positionedOffset();

		var obj = {
			type: "PLAYER_ATTACK",
			x: e.pointerX() - offset[0],
			y: e.pointerY() - offset[1]
		};

		player.ws.send(Object.toJSON(obj));

		var attack = new sow.Attack(obj.x, obj.y);
		render.attacks.set(attack.id, attack);

		render.players.each(function(pair) {
			var p = pair.value;

			if (Math.abs(p.coordX - obj.x) < 20 && Math.abs(p.coordY - obj.y) < 20) {
				p.die = true;
			}
		}.bind(this));
	});
};

sow.Input.prototype.getCoords = function(e) {
	if (e.offsetX) {
		return { x: e.offsetX, y: e.offsetY };
	}
	else if (e.layerX) {
		return { x: e.layerX, y: e.layerY };
	}
	else {
		return { x: e.pageX, y: e.pageY };
	}
};

sow.Input.prototype.touch = null;
sow.Input.prototype.leftLock = 0;
sow.Input.prototype.topLock = 0;
sow.Input.prototype.bottomLock = 0;
sow.Input.prototype.rightLock = 0;

