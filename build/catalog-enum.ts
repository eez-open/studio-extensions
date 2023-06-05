import { readFile, writeFile } from "fs";
var request = require("request-promise-native");
var sha256 = require("sha256");
import * as decompress from "decompress";
import * as Jimp from "jimp";

async function getExtensionsList() {
    return new Promise<string[]>((resolve, reject) => {
        readFile(__dirname + "/../extensions-list.txt", "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(
                    data
                        .split("\n")
                        .map((line) => line.trim())
                        .filter((line) => line !== "" && !line.startsWith("#"))
                );
            }
        });
    });
}

async function getExtensionHashes() {
    return new Promise<any>((resolve, reject) => {
        readFile(__dirname + "/extension-hashes.json", "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

async function getRepositoryCatalogs() {
    const extensions = await getExtensionsList();
    const extensionHashes = await getExtensionHashes();

    const repositoryCatalogs = [];

    for (const extension of extensions) {
        if (extension.startsWith("pext:")) {
            const name = extension.substring("pext:".length);

            const url = `https://registry.npmjs.org/${name}`;

            const jsonStr = await request({
                method: "GET",
                url,
                encoding: "utf-8",
            });

            const json = JSON.parse(jsonStr);

            for (const versionKey of Object.keys(json.versions)) {
                const version = json.versions[versionKey];
                const packageDownloadUrl = version.dist.tarball;
                if (packageDownloadUrl) {
                    let extensionHash = extensionHashes.find(
                        (extensionHash: any) =>
                            extensionHash.downloadUrl === packageDownloadUrl
                    );
                    if (!extensionHash) {
                        console.log(
                            "New SHA256 hash stored for package download url: ",
                            packageDownloadUrl
                        );
                        extensionHash = {
                            downloadUrl: packageDownloadUrl,
                            sha256: version.dist.shasum,
                        };
                        extensionHashes.push(extensionHash);
                    } else {
                        if (extensionHash.sha256 !== version.dist.shasum) {
                            console.log(
                                `SHA256 hash changed for extension ${extension}-${versionKey} from ${extensionHash.sha256} to ${version.dist.shasum}`
                            );
                        }
                    }

                    const tarball = await request({
                        method: "GET",
                        url: packageDownloadUrl,
                        encoding: null,
                    });
                    const files = await decompress(tarball);

                    let image;
                    const imagePath = "package/" + version.image || "image.png";
                    const imageFile = files.find(
                        (file) => file.path === imagePath
                    );

                    if (imageFile) {
                        const imageData = await Jimp.read(imageFile.data);
                        image = await imageData
                            .resize(
                                256,
                                (imageData.getHeight() * 256) /
                                    imageData.getWidth()
                            )
                            .getBase64Async(imageData.getMIME());
                    }

                    repositoryCatalogs.push({
                        id: name,
                        name,
                        description: version.description,
                        version: version.version,
                        image,
                        "eez-studio": {
                            minVersion: "0.10.1",
                        },
                        sha256: version.dist.shasum,
                    });
                } else {
                    console.log(`extension ${extension} has no tarball`);
                }
            }
        } else {
            let downloadUrl: string;
            let extensionZipFileData;
            if (extension.startsWith(".")) {
                // local
                downloadUrl =
                    "https://github.com/eez-open/studio-extensions/raw/master" +
                    extension.substr(1);
                extensionZipFileData = await new Promise<string>(
                    (resolve, reject) => {
                        readFile(
                            __dirname + "/../" + extension,
                            "binary",
                            (err, data) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(data);
                                }
                            }
                        );
                    }
                );
            } else {
                // remote
                downloadUrl = extension;
                extensionZipFileData = await request({
                    method: "GET",
                    url: downloadUrl,
                    encoding: null,
                });
            }

            const files = await decompress(
                Buffer.from(extensionZipFileData, "binary")
            );

            const packageJsonFile = files.find(
                (file) => file.path === "package.json"
            );
            if (!packageJsonFile) {
                return undefined;
            }

            const packageJson = JSON.parse(packageJsonFile.data.toString());

            if (!packageJson["eez-studio"]) {
                return undefined;
            }

            const imagePath = packageJson.image || "image.png";
            const imageFile = files.find((file) => file.path === imagePath);
            if (imageFile) {
                const image = await Jimp.read(imageFile.data);
                packageJson.image = await image
                    .resize(256, (image.getHeight() * 256) / image.getWidth())
                    .getBase64Async(image.getMIME());
            }

            packageJson.download = downloadUrl;

            let extensionSha256 = sha256(extensionZipFileData);

            let extensionHash = extensionHashes.find(
                (extensionHash: any) =>
                    extensionHash.downloadUrl === downloadUrl
            );
            if (!extensionHash) {
                console.log(
                    "New SHA256 hash generated for download url: ",
                    downloadUrl
                );
                extensionHash = {
                    downloadUrl,
                    sha256: extensionSha256,
                };
                extensionHashes.push(extensionHash);
            } else {
                if (extensionHash.sha256 !== extensionSha256) {
                    console.log(
                        `SHA256 hash changed for "${downloadUrl}" from ${extensionHash.sha256} to ${extensionSha256}`
                    );
                }
            }
            packageJson.sha256 = extensionHash.sha256;

            repositoryCatalogs.push(packageJson);
        }
    }

    await new Promise<void>((resolve, reject) => {
        writeFile(
            __dirname + "/extension-hashes.json",
            JSON.stringify(extensionHashes, undefined, 4),
            "utf8",
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });

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
