package io.github.mxz_schwarz.text_editor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

class Util {

    private Util() {}

    static byte[] formatDir(Path dir) throws IOException {
        var parent = dir.getParent() == null ? dir : dir.getParent();
        var sb = new StringBuilder("<button " +"hx-get=\"/dir/" + parent.toString() + "\" hx-target=\"closest #dir\""+ ">" + ".." + "</button><br>");
        for (var p : Files.list(dir).toList())
            sb.append("<button " +
            (Files.isDirectory(p) 
                ? "hx-get=\"/dir/" + p.toString() + "\" hx-target=\"closest #dir\"" 
                : "hx-get=\"/file/" + p.toString() + "\" hx-target=\"next #file\"")
            + ">" + dir.relativize(p).toString() + "</button><br>");
        return sb.toString().getBytes();
    }

    static byte[] formatFile(Path file) throws IOException {
        return Files.readAllBytes(file);
    }

    static Map<String, String> objify(byte[] bytes) {
        var map = new HashMap<String, String>();
        var entries = new String(bytes).split("&");
        for (var e : entries) {
            var parts = e.split("=");
            map.put(parseURI(parts[0]), parseURI(parts[1]));
        }
        return Map.copyOf(map);
    }


    static String parseURI(String str) {
        var sb = new StringBuilder();
        for (var i = 0; i < str.length(); i++)
            if (str.charAt(i) == '%')
                sb.append(switch (str.substring(++i, 1 + ++i)) {
                    case "20" -> " ";
                    case "21" -> "!";
                    case "23" -> "#";
                    case "24" -> "$";
                    case "26" -> "&";
                    case "27" -> "'";
                    case "28" -> "(";
                    case "29" -> ")";
                    case "2A" -> "*";
                    case "2B" -> "+";
                    case "2C" -> ",";
                    case "2F" -> "/";
                    case "3A" -> ":";
                    case "3B" -> ";";
                    case "3D" -> "=";
                    case "3F" -> "?";
                    case "40" -> "@";
                    case "5B" -> "[";
                    case "5D" -> "]";
                    default -> "";
                });
            else if (str.charAt(i) == '+') sb.append(' ');
            else sb.append(str.charAt(i));
        return sb.toString();
    }

}