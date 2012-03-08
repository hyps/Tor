var ATTACK_SPRITE = new Image();

{
	ATTACK_SPRITE.src = "graphics/boom.gif";
}

sow.Attack = function(x, y) {
	this.coordX = x;
	this.coordY = y;
	
	this.id = x + "_" + y;
};

sow.Attack.prototype.id;

sow.Attack.prototype.coordX = 0;
sow.Attack.prototype.coordY = 0;

sow.Attack.prototype.frameNr = 18;
sow.Attack.prototype.frameTicker = 0;
sow.Attack.prototype.framePeriod = 40;
sow.Attack.prototype.frameCount = -1;

sow.Attack.prototype.draw = function(ctx, gametime) {
	if (gametime > this.frameTicker + this.framePeriod) {
		this.frameTicker = gametime;
		this.frameCount++;

		if (this.frameCount > this.frameNr) {
			render.attacks.unset(this.id);
			return;
		}
	}

	ctx.drawImage(ATTACK_SPRITE, (this.frameCount) * 128, 0, 128, 259, this.coordX - 50, this.coordY - 210, 128, 259);	
};
