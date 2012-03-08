sow = {};

var input;
var player;
var render;

document.observe("dom:loaded", function() {
	render = new sow.Render();
	input  = new sow.Input();
	player = new sow.Player(true);
});
