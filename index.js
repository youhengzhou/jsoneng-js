/*
 * jsoneng
 * Copyright(c) YouHeng Zhou
 * MIT Licensed
 */

/*
 * Current way of using jsoneng
 *
 * import path from "path";
 * import jsoneng from "jsoneng";
 *
 * const dirname = path.join(process.cwd());
 * let jdb = new jsoneng(path.join(dirname, "jdb"));
 *
 * jdb.create({key: value}, "db");
 * jdb.read("db");
 * jdb.update({newKey: newValue}, "db");
 * jdb.delete("db");
 * jdb.print("db");
 */

const path = require("path");
const fs = require("fs/promises");

class JDB {
    constructor(baseDir, indent = 4) {
        this.baseDir = baseDir;
        this.indent = indent;
    }

    _getDirectoryPath(dirname) {
        return path.join(this.baseDir, dirname);
    }

    _getFilePath(dirname) {
        return path.join(this._getDirectoryPath(dirname), "jdb.json");
    }

    async _checkDirectoryExists(dirname) {
        try {
            await fs.access(this._getDirectoryPath(dirname));
            return true;
        } catch {
            return false;
        }
    }

    async _createDirectory(dirname) {
        if (!(await this._checkDirectoryExists(dirname))) {
            await fs.mkdir(this._getDirectoryPath(dirname), {
                recursive: true,
            });
        }
    }

    setIndent(indent) {
        this.indent = indent;
    }

    async create(input, dirname = "") {
        await this._createDirectory(dirname);
        await fs.writeFile(
            this._getFilePath(dirname),
            JSON.stringify(input, null, this.indent)
        );
    }

    async read(dirname = "") {
        if (await this._checkDirectoryExists(dirname)) {
            const data = await fs.readFile(this._getFilePath(dirname), "utf-8");
            try {
                return JSON.parse(data);
            } catch (e) {
                return null;
            }
        } else {
            return "Database not found";
        }
    }

    async update(input, dirname = "") {
        if (await this._checkDirectoryExists(dirname)) {
            await fs.writeFile(
                this._getFilePath(dirname),
                JSON.stringify(input, null, this.indent)
            );
        } else {
            return "Database not found";
        }
    }

    async patch(input, dirname = "") {
        if (await this._checkDirectoryExists(dirname)) {
            const data = await this.read(dirname);
            if (data) {
                const updatedData = { ...data, ...input };
                await fs.writeFile(
                    this._getFilePath(dirname),
                    JSON.stringify(updatedData, null, this.indent)
                );
            }
        } else {
            return "Database not found";
        }
    }

    async patchKV(key, value, dirname = "") {
        await this.patch({ [key]: value }, dirname);
    }

    async delete(dirname) {
        if (await this._checkDirectoryExists(dirname)) {
            await fs.rm(this._getDirectoryPath(dirname), { recursive: true });
        } else {
            return "Database not found";
        }
    }

    async print(dirname = "") {
        if (await this._checkDirectoryExists(dirname)) {
            console.log(await this.read(dirname));
        } else {
            return "Database not found";
        }
    }

    // Shortened CRUD operations
    async c(key, value, dirname = "") {
        await this.create({ [key]: value }, dirname);
    }

    async r(key, dirname = "") {
        const data = await this.read(dirname);
        return data && data[key] ? data[key] : "Key not found";
    }

    async u(key, value, dirname = "") {
        await this.update({ [key]: value }, dirname);
    }

    async d(key, dirname = "") {
        const data = await this.read(dirname);
        if (data && data[key]) {
            delete data[key];
            await this.create(data, dirname);
        } else {
            return "Key not found";
        }
    }

    // Special operations
    async p(key, dirname = "") {
        const data = await this.read(dirname);
        if (data && data[key]) {
            console.log({ [key]: data[key] });
        } else {
            return "Key not found";
        }
    }

    async i(value, dirname = "") {
        const data = await this.read(dirname);
        const highestKey = Math.max(...Object.keys(data).map(Number), -1);
        await this.u(highestKey + 1, value, dirname);
    }

    async l(desc, value = "", dirname = "") {
        await this.i(`${desc} ${value}`, dirname);
    }

    async f(key, value, dirname = "") {
        const data = await this.read(dirname);
        if (!data || !data[key]) {
            await this.u(key, value, dirname);
        }
    }
}

module.exports = JDB;
