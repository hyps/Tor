import java.util.Random;

import net.tootallnate.websocket.WebSocket;

public class Player {

	public int id;
	
	public int x, y;
	
	public boolean die;

	public transient WebSocket ws;
	
	public Player(int id, WebSocket ws) {
		this.id = id;
		this.ws = ws;
		
		randomCoords();
	}
	
	public void randomCoords() {
		x = new Random().nextInt(700) + 50;
		y = new Random().nextInt(500) + 50;		
	}
}
