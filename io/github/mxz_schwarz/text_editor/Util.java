package io.github.mxz_schwarz.text_editor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;
import java.util.HashMap;
import java.util.stream.Stream;
import io.github.mxz_schwarz.parser.*;

class Util {

    private Util() {}

    static byte[] formatDir(Path dir) throws IOException {
        var parent = dir.getParent() == null ? dir : dir.getParent();
        var sb = new StringBuilder("<button " +"value=\"/dir" + parent.toString() + "\""+ ">..</button><br>");
        for (var p : Files.list(dir).toList())
            sb.append("<button " +
            (Files.isDirectory(p) 
                ? "value=\"/dir" + p.toString() + "\""
                : "value=\"/file" + p.toString() + "\"")
            + ">" + dir.relativize(p).toString() + "</button><br>");
        return sb.toString().getBytes();
    }

    static byte[] formatFile(Path file) throws IOException {
        return ("<textarea id=\"file\" name=\"file\" hx-swap=\"none\" hx-post=\"/file\">" + Files.readString(file) + "</textarea>").getBytes();
    }

    static java.util.Map<String, String> objify(byte[] bytes) {
        var map = new HashMap<String, String>();
        var entries = new String(bytes).split("&");
        for (var e : entries) {
            var parts = e.split("=");
            map.put(parseURI(parts[0]), parseURI(parts[1]));
        }
        return java.util.Map.copyOf(map);
    }


    static String parseURI(String str) {
        var sb = new StringBuilder();
        for (var i = 0; i < str.length(); i++)
            if (str.charAt(i) == '%')
                sb.append(switch (str.substring(++i, 1 + ++i)) {
                    case "09" -> "\t";
                    case "0A", "0D" -> "\n";
                    case "20" -> " ";
                    case "21" -> "!";
                    case "22" -> "\"";
                    case "23" -> "#";
                    case "24" -> "$";
                    case "25" -> "%";
                    case "26" -> "&";
                    case "27" -> "'";
                    case "28" -> "(";
                    case "29" -> ")";
                    case "2A" -> "*";
                    case "2B" -> "+";
                    case "2C" -> ",";
                    case "2D" -> "-";
                    case "2E" -> ".";
                    case "2F" -> "/";
                    case "3A" -> ":";
                    case "3B" -> ";";
                    case "3C" -> "<";
                    case "3D" -> "=";
                    case "3E" -> ">";
                    case "3F" -> "?";
                    case "40" -> "@";
                    case "5B" -> "[";
                    case "5C" -> "/";
                    case "5D" -> "]";
                    case "5E" -> "^";
                    case "5F" -> "_";
                    case "60" -> "`";
                    case "7B" -> "{";
                    case "7C" -> "|";
                    case "7D" -> "}";
                    case "7E" -> "~";
                    default -> "";
                });
            else if (str.charAt(i) == '+') sb.append(' ');
            else sb.append(str.charAt(i));
        return sb.toString();
    }

}