import { readFile } from "fs";
var request = require('request-promise-native');
var sha256 = require("sha256");
import * as decompress from "decompress";
import { extname } from "path";
import * as SharpModule from "sharp";

// const EXTENSION_REPOSITORIES = [
//     {
//         local: __dirname + "/../extensions",
//         remote: "https://github.com/eez-open/studio/raw/master/extensions"
//     },
//     {
//         local: __dirname + "/../instruments",
//         remote: "https://github.com/eez-open/studio/raw/master/instruments"
//     },
//     {
//         local: __dirname + "/../../psu-firmware/build/extensions",
//         remote: "https://github.com/eez-open/psu-firmware/raw/stm32/build/extensions"
//     }
// ];

async function getExtensionsList() {
    return new Promise<string[]>((resolve, reject) => {
        readFile(__dirname + "/../extensions-list.txt", "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.split("\n").map(line => line.trim()).filter(line => 
                    line !== '' && !line.startsWith('#')
                ));
            }
        });
    });
}

async function getRepositoryCatalogs() {
    const extensions = await getExtensionsList();

    const repositoryCatalogs = [];

    for (const extension of extensions) {
        let downloadUrl;
        let extensionZipFileData;
        if (extension.startsWith('.')) {
            // local
            downloadUrl = "https://github.com/eez-open/studio-extensions/raw/master" + extension.substr(1);
            extensionZipFileData = await new Promise<string>((resolve, reject) => {
                readFile(__dirname + "/../" + extension, "binary", (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        } else {
            // remote
            downloadUrl = extension;
            extensionZipFileData = await request({
                method: 'GET',
                url: downloadUrl,
                encoding: null
            });
        }

        const files = await decompress(Buffer.from(extensionZipFileData, "binary"));

        const packageJsonFile = files.find(file => file.path === "package.json");
        if (!packageJsonFile) {
            return undefined;
        }

        const packageJson = JSON.parse(packageJsonFile.data.toString());

        if (!packageJson["eez-studio"]) {
            return undefined;
        }

        const imagePath = packageJson.image || "image.png";
        const imageFile = files.find(file => file.path === imagePath);
        if (imageFile) {
            const ext = extname(imagePath).substr(1);
            const sharp = require("sharp") as typeof SharpModule;
            const imageData = await sharp(imageFile.data)
                .resize(256)
                .toBuffer();
            const base64 = imageData.toString("base64");
            packageJson.image = `data:image/${ext};base64,${base64}`;
        }

        packageJson.download =
            downloadUrl;

        packageJson.sha256 = sha256(extensionZipFileData);

        repositoryCatalogs.push(packageJson);
    }

    return repositoryCatalogs;
}

export async function getCatalog() {
    const repositoryCatalogs = await getRepositoryCatalogs();

    let catalog = [].concat.apply([], repositoryCatalogs);

    catalog = catalog.sort((a: any, b: any) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        if (a.version < b.version) {
            return -1;
        }
        if (a.version > b.version) {
            return 1;
        }
        return 0;
    });

    return catalog;
}
