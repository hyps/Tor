import java.io.IOException;
import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import net.tootallnate.websocket.WebSocket;
import net.tootallnate.websocket.WebSocketServer;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Server extends WebSocketServer {

	private AtomicInteger idseq = new AtomicInteger();
	
	private ConcurrentHashMap<Integer, Player> players = new ConcurrentHashMap<Integer, Player>();
	
	private ConcurrentHashMap<WebSocket, Player> websockets = new ConcurrentHashMap<WebSocket, Player>();
	
    public Server(int port) {
        super(port);
    }

    public void onClientOpen(WebSocket conn) {
        try {
            Player player = new Player(idseq.incrementAndGet(), conn);
            players.put(player.id, player);
            websockets.put(conn, player);
            
            JSONObject json = new JSONObject();
            
            json.put("type", "REG");
            json.put("id", player.id);
            json.put("x", player.x);
            json.put("y", player.y);
            
            conn.send(json.toString());
            
            System.out.println(player.id + " entered the room!");
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public void onClientClose(WebSocket conn) {
        try {
        	Player p = websockets.get(conn);
        	JSONObject json = new JSONObject();
        	
        	json.put("type", "REMOVE_PLAYER");
        	json.put("id", p.id);
        	players.remove(p.id);
        	websockets.remove(conn);
        	
            this.sendToAllExcept(conn, json.toString());
            
            System.out.println(p.id + " has left the room!");
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public void onClientMessage(WebSocket conn, String message) {
    	try {
			JSONObject json = new JSONObject(message);
			
			if (json.get("type").equals("PLAYER_STATE")) {
				Player player = players.get(json.getInt("id"));
				
				if (player.die) return;
				
				player.x = json.getInt("x");
				player.y = json.getInt("y");
			} else if (json.get("type").equals("PLAYER_ATTACK")) {
				this.sendToAllExcept(conn, json.toString());
				
				Collection<Player> all = players.values();
				int x = json.getInt("x");
				int y = json.getInt("y");
				
				for (Player player : all) {
					if (Math.abs(player.x - x) < 20 && Math.abs(player.y - y) < 20) {
						player.die = true;
						
						JSONObject die = new JSONObject();
						die.put("type", "DEAD");
						die.put("id", player.id);
						this.sendToAll(die.toString());
					}
				}
			} else if (json.get("type").equals("RESTORE")) {
				Player p = players.get(json.getInt("id"));
				p.randomCoords();
				
				JSONObject alive = new JSONObject();
				alive.put("type", "ALIVE");
				alive.put("id", p.id);
				alive.put("x", p.x);
				alive.put("y", p.y);
				
				p.die = false;
				this.sendToAll(alive.toString());				
			} else if (json.get("type").equals("PLAYER_ATTACK")) {
				
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
    }

    public void onError(Throwable ex) {
      ex.printStackTrace();
    }

    public static void main(String[] args) throws InterruptedException, JSONException, IOException {
        int port = 8887;
        try {
            port = Integer.parseInt(args[0]);
        } catch(Exception ex) {}
        Server s = new Server(port);
        s.start();
        System.out.println("Server started on port: " + s.getPort());
        
        while (true) {
        	long start = System.currentTimeMillis();
        	
        	Collection<Player> players = s.getPlayers().values();
        	JSONObject json = new JSONObject();
        	JSONArray jsonPlayers = new JSONArray();
        	json.put("type", "UPDATE");
        	json.put("players", jsonPlayers);
        	
        	for (Player player : players) {
        		if (player.die) continue;
        		
        		JSONObject jsonPlayer = new JSONObject();
				jsonPlayers.put(jsonPlayer);
				
				jsonPlayer.put("id", player.id);
				jsonPlayer.put("x", player.x);
				jsonPlayer.put("y", player.y);
			}
        	
        	s.sendToAll(json.toString());
        	long time = System.currentTimeMillis() - start;
        	
        	if (time < 20) {
        		Thread.sleep(20 - time);
        	}
        }
    }

	public ConcurrentHashMap<Integer, Player> getPlayers() {
		return players;
	}
}
