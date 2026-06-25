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
        var server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/", Server::handleGet);
        server.createContext("/dir", Server::handleDir);
        server.createContext("/file", Server::handleFile);
        server.start();
    }

    private static void handleGet(HttpExchange e) throws IOException {
        var path = e.getRequestURI().toString().substring(1);
        if (path.equals("")) path = "index.html";
        IO.println(path);
        respond(e, Files.readAllBytes(Path.of(path)), 
            switch(path.substring(path.lastIndexOf("."))) {
                case ".js" -> "text/javascript";
                case ".html" -> "text/html";
                case ".jpg", ".ico" -> "image/jpeg";
                default -> null;
            });
    }

    private static void handleDir(HttpExchange e) throws IOException {
        IO.println(e.getRequestHeaders().toString()+"\n");
        IO.println();
        respond(e, Util.formatDir(dir), "text/html");
    }

    private static void handleFile(HttpExchange e) throws IOException {

    }

    private static void respond(HttpExchange e, byte[] response, String contentType) throws IOException {
        e.getResponseHeaders().add("content-type", contentType);
        e.sendResponseHeaders(200, response.length);
        e.getResponseBody().write(response);
        e.close();
    }

}