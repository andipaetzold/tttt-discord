import https from "https";
import fs from "fs";

export function download(url: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                var file = fs.createWriteStream(path);
                response.pipe(file);
                resolve();
            } else {
                reject();
            }
        });
    });
}
