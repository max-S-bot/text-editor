package io.github.mxz_schwarz.text_editor;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;

class Server {

    private Server() {}

    private static Path dir = Path.of("/home/mxz-schwarz");
    private static boolean loading = true;
    private static Path file = null;

    static void main(String... args) throws IOException {
        var server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/", Server::handleGet);
        server.createContext("/dir", Server::handleDir);
        server.createContext("/file", Server::handleFile);
        server.start();
    }

    private static void handleGet(HttpExchange e) throws IOException {
        var path = e.getRequestURI().toString().substring(1);
        if (path.equals("")) {
            path = "index.html";
            loading = true;
        }
        respond(e, Files.readAllBytes(Path.of(path)), 
            switch(path.substring(path.lastIndexOf("."))) {
                case ".js" -> "text/javascript";
                case ".html" -> "text/html";
                case ".jpg", ".ico" -> "image/jpeg";
                default -> null;
            });
    }

    private static void handleDir(HttpExchange e) throws IOException {
        if (loading) loading = false;
        else 
            dir = Path.of("/").resolve(Path.of("/dir").relativize(Path.of(e.getRequestURI().toString())));
        respond(e, Util.formatDir(dir), "text/html");
    }

    private static void handleFile(HttpExchange e) throws IOException {
        if (e.getRequestMethod().equals("GET"))
            respond(e, Files.readAllBytes(file = Path.of("/").resolve(Path.of("/file").relativize(Path.of(e.getRequestURI().toString())))), "text/plain");
        else if (file != null) {
            Files.write(file, e.getRequestBody().readAllBytes());
            e.sendResponseHeaders(204, -1);
        }
    }

    private static void respond(HttpExchange e, byte[] response, String contentType) throws IOException {
        e.getResponseHeaders().add("content-type", contentType);
        e.sendResponseHeaders(200, response.length);
        e.getResponseBody().write(response);
        e.close();
    }

}