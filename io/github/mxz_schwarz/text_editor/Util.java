package io.github.mxz_schwarz.text_editor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;

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

}