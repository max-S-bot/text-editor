package io.github.mxz_schwarz.text_editor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;

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


}