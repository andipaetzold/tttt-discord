import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { access, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import ffmpegPath from "ffmpeg-static";

export class OpusAudioCache {
    readonly #directory: string;
    readonly #pending = new Map<string, Promise<string>>();

    constructor(directory = process.env.AUDIO_CACHE_DIR ?? path.join(tmpdir(), "tttt-discord-audio")) {
        this.#directory = directory;
    }

    async get(url: string): Promise<string> {
        const pending = this.#pending.get(url);
        if (pending) {
            return await pending;
        }

        const task = this.#create(url);
        this.#pending.set(url, task);
        try {
            return await task;
        } finally {
            this.#pending.delete(url);
        }
    }

    async #create(url: string): Promise<string> {
        // Bump the version if the encoding settings change.
        const key = createHash("sha256").update(`opus-v1\0${url}`).digest("hex");
        const filename = path.join(this.#directory, `${key}.ogg`);
        try {
            await access(filename);
            return filename;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                throw error;
            }
        }

        await mkdir(this.#directory, { recursive: true });
        const temporaryDirectory = await mkdtemp(path.join(this.#directory, ".tmp-"));
        try {
            const response = await fetch(url);
            if (!response.ok || !response.body) {
                throw new Error(`Error fetching audio: HTTP ${response.status}`);
            }

            const input = path.join(temporaryDirectory, "input.mp3");
            const output = path.join(temporaryDirectory, "output.ogg");
            await pipeline(Readable.fromWeb(response.body), createWriteStream(input));
            await this.#transcode(input, output);

            // Only expose complete files; the temporary directory is on the same filesystem.
            await rename(output, filename);
            return filename;
        } finally {
            await rm(temporaryDirectory, { recursive: true, force: true });
        }
    }

    async #transcode(input: string, output: string): Promise<void> {
        const command = ffmpegPath;
        if (!command) {
            throw new Error("FFmpeg is unavailable on this platform");
        }

        await new Promise<void>((resolve, reject) => {
            execFile(
                command,
                [
                    "-loglevel",
                    "error",
                    "-nostdin",
                    "-i",
                    input,
                    "-vn",
                    "-c:a",
                    "libopus",
                    "-ar",
                    "48000",
                    "-ac",
                    "2",
                    "-frame_duration",
                    "20",
                    "-f",
                    "ogg",
                    output,
                ],
                (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
}

export const opusAudioCache = new OpusAudioCache();
