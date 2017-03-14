
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.util.Collections;

import org.java_websocket.WebSocket;
import org.java_websocket.WebSocketImpl;
import org.java_websocket.drafts.Draft;
import org.java_websocket.drafts.Draft_17;
import org.java_websocket.framing.FrameBuilder;
import org.java_websocket.framing.Framedata;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;
/**
 * Created by victor on 2/24/17.
 */
public class Server extends  WebSocketServer{

    public Server( int port , Draft d ) throws UnknownHostException {
        super( new InetSocketAddress( port ));
    }

    @Override
    public void onOpen(WebSocket webSocket, ClientHandshake clientHandshake) {
        System.out.println( "Connection Opened");
    }

    @Override
    public void onClose(WebSocket webSocket, int i, String s, boolean b) {
        System.out.println( "closed" );
    }

    @Override
    public void onMessage(WebSocket conn, String s) {
        //System.out.println("Message from client:" + s);
        /* this is a ECHO */
        conn.send( s );
    }

    @Override
    public void onError(WebSocket webSocket, Exception e) {
        System.out.println( "Error:" );
        e.printStackTrace();
    }

    public static void main(String args[]) throws UnknownHostException{

        new Server( 8008, null).start();

    }//main

}//Class
