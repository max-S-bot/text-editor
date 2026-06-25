package io.github.mxz_schwarz.text_editor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;

class Util {

    private Util() {}

    static byte[] formatDir(Path dir) throws IOException {
        var sb = new StringBuilder();
        for (var p : Files.list(dir).toList())
            sb.append("<button " +
            (Files.isDirectory(p) 
                ? "hx-get=\"/dir\" hx-target=\"find #dir\"" 
                : "hx-get\"/file\" hx-target=\"find #file\"")
            + ">" + dir.relativize(p).toString() + "</button><br>");
        return sb.toString().getBytes();
    }

    static byte[] formatFile(Path file) throws IOException {
        return Files.readAllBytes(file);
    }

}