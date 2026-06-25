package io.github.mxz_schwarz.text_editor;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;

class Server {

    private Server() {}

    // likely to change exactly how this is initially set later
    private static Path dir = Path.of("/home/mxz-schwarz"); 
    private static String file = null;

    static void main(String... args) throws IOException{
        var server = HttpServer.create(new InetSocketAddress(6000), 0);
        server.createContext("/", Server::handleExchange);
        server.start();
    }

    private static void handleExchange(HttpExchange e) {
        var headers = e.getRequestHeaders();
    } 



}