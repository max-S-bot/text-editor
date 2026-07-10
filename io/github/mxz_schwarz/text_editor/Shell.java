package io.github.mxz_schwarz.text_editor; //vibecoded (I'm sorry): https://claude.ai/share/76d8a6e8-4d04-4fcb-a8a1-c003d16235ea

import java.io.*;
import java.util.concurrent.atomic.AtomicLong;

public class Shell implements Closeable {
    private final Process process;
    private final BufferedWriter stdin;
    private final BufferedReader stdout;
    private final AtomicLong counter = new AtomicLong();

    public Shell() throws IOException {
        ProcessBuilder pb = new ProcessBuilder("bash");
        pb.redirectErrorStream(true); // merge stderr into stdout
        process = pb.start();
        stdin = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
        stdout = new BufferedReader(new InputStreamReader(process.getInputStream()));
    }

    public String run(String command) throws IOException {
        String marker = "__END_" + counter.incrementAndGet() + "__";
        stdin.write(command + "\n");
        stdin.write("echo " + marker + "$?\n");
        stdin.flush();
        StringBuilder output = new StringBuilder();
        for (String line; (line = stdout.readLine()) != null;)
            if (line.startsWith(marker)) break;
            else output.append(line).append("\n");
        return output.toString();
    }

    @Override
    public void close() throws IOException {
        stdin.write("exit\n");
        stdin.flush();
        stdin.close();
        stdout.close();
        process.destroy();
    }
}