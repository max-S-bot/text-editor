package io.github.mxz_schwarz.text_editor;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

class Server {

    private Server() {}

    private static final Map<String, Shell> shells = new HashMap<>();

    private static int port = 8080;
    private static boolean loading = true;

    static void main(String... args) throws IOException {
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> IO.println(e));
        var list = java.util.Arrays.asList(args);
        var portIdx = list.indexOf("--port");
        if (portIdx != -1) port = Integer.parseInt(args[portIdx + 1]);
        var server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", Server::handleGet);
        server.createContext("/dir", Server::handleDir);
        server.createContext("/file", Server::handleFile);
        server.createContext("/term", Server::handleTerm);
        server.start();
    }

    private static void handleGet(HttpExchange e) throws IOException {
        var path = e.getRequestURI().toString().substring(1);
        if (path.equals("") || path.startsWith("?")) {
            path = "./frontend/index.html";
            loading = true;
        }
        respond(e, Files.readAllBytes(Path.of(path)), 
            switch(path.substring(path.lastIndexOf("."))) {
                case ".js" -> "text/javascript; charset=utf-8";
                case ".html" -> "text/html";
                case ".jpg", ".ico" -> "image/jpeg";
                case ".css" -> "text/css";
                default -> "text/plain";
            });
    }

    private static void handleDir(HttpExchange e) throws IOException {
        Path dir = Path.of(e.getRequestHeaders().getFirst("path"));
        if (loading) {
            loading = false;
            var id = e.getRequestHeaders().getFirst("id");
            if (!shells.containsKey(id))
                shells.put(id, new Shell());
        }
        respond(e, formatDir(dir), "text/html");
    }

    private static void handleFile(HttpExchange e) throws IOException {
        var file = e.getRequestHeaders().getFirst("path");
        if (e.getRequestMethod().equals("GET"))
            respond(e, Files.readAllBytes(Path.of(file)), "text/plain");
        else if (file != null) {
            Files.write(Path.of(file), e.getRequestBody().readAllBytes());
            e.sendResponseHeaders(204, -1);
        }
    }

    private static void handleTerm(HttpExchange e) throws IOException {
        respond(e, shells.get(e.getRequestHeaders().getFirst("id")).run(new String(e.getRequestBody().readAllBytes())).getBytes(), "text/plain");
    }

    private static void respond(HttpExchange e, byte[] response, String contentType) throws IOException {
        e.getResponseHeaders().add("content-type", contentType);
        e.sendResponseHeaders(200, response.length);
        e.getResponseBody().write(response);
        e.close();
    }

    private static byte[] formatDir(Path dir) throws IOException {
        var parent = dir.getParent() == null ? dir : dir.getParent();
        var sb = new StringBuilder("<button " +"data-uri=\"/dir\" data-path=\"" + parent.toString() + "\">..</button><br>");
        for (var p : Files.list(dir).toList())
            sb.append("<button data-uri=\"/" +
            (Files.isDirectory(p) ? "dir" : "file") + 
            "\" data-path=\"" + p.toString() + "\">" + 
            dir.relativize(p).toString() + "</button><br>");
        return sb.toString().getBytes();
    }

}
