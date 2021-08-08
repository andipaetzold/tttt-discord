import https from "https";
import fs from "fs";
import crypto from "crypto";
import os from "os";
import path from "path";

export async function download(url: string): Promise<string> {
    const hash = crypto.createHash("md5").update(url).digest("hex");
    const filename = path.resolve(os.tmpdir(), hash);

    if (!fs.existsSync(filename)) {
        await new Promise<void>((resolve, reject) => {
            https.get(url, (response) => {
                if (response.statusCode === 200) {
                    var file = fs.createWriteStream(filename);
                    response.pipe(file);
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    return filename;
}
