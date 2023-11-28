import fs from "fs";
import crypto from "crypto";
import os from "os";
import path from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";

export async function download(url: string): Promise<string> {
    const hash = crypto.createHash("md5").update(url).digest("hex");
    const filename = path.resolve(os.tmpdir(), hash);

    if (!fs.existsSync(filename)) {
        const response = await fetch(url);
        if (!response.ok || !response.body) {
            throw new Error(`Error fetching url "${url}"`);
        }
        const stream = Readable.fromWeb(response.body).pipe(fs.createWriteStream(filename));
        await finished(stream);
    }

    return filename;
}
