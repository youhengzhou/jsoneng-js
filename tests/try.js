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
 * jdb.read("db")
 *  .then(data => console.log(data))
 *  .catch(err => console.error(err.message));
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

    // create(input, dirname = "") {
    //     return this._createDirectory(dirname).then(() => {
    //         return fs.writeFile(
    //             this._getFilePath(dirname),
    //             JSON.stringify(input, null, this.indent)
    //         );
    //     });
    // }

    async create(input, dirname = "") {
        try {
            await this._createDirectory(dirname);
            await fs.writeFile(
                this._getFilePath(dirname),
                JSON.stringify(input, null, this.indent)
            );
        } catch (error) {
            throw new Error("Failed to create: " + error.message);
        }
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
            throw new Error("Database not found");
        }
    }

    async update(input, dirname = "") {
        if (await this._checkDirectoryExists(dirname)) {
            await fs.writeFile(
                this._getFilePath(dirname),
                JSON.stringify(input, null, this.indent)
            );
        } else {
            throw new Error("Database not found");
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
            throw new Error("Database not found");
        }
    }

    // async patchKV(key, value, dirname = "") {
    //     try {
    //         await this.patch({ [key]: value }, dirname);
    //     } catch (error) {
    //         throw new Error("Failed to patch key-value: " + error.message);
    //     }
    // }

    async delete(dirname) {
        if (await this._checkDirectoryExists(dirname)) {
            await fs.rm(this._getDirectoryPath(dirname), { recursive: true });
        } else {
            throw new Error("Database not found");
        }
    }

    async print(dirname = "") {
        if (await this._checkDirectoryExists(dirname)) {
            console.log(await this.read(dirname));
        } else {
            throw new Error("Database not found");
        }
    }

    // Shortened CRUD operations
    async c(key, value, dirname = "") {
        try {
            await this.create({ [key]: value }, dirname);
        } catch (error) {
            throw new Error("Failed to create: " + error.message);
        }
    }

    async r(key, dirname = "") {
        try {
            const data = await this.read(dirname);
            if (data && data[key]) {
                return data[key];
            } else {
                throw new Error("Key not found");
            }
        } catch (error) {
            throw new Error("Failed to retrieve data: " + error.message);
        }
    }

    async u(key, value, dirname = "") {
        try {
            await this.update({ [key]: value }, dirname);
        } catch (error) {
            throw new Error("Failed to update: " + error.message);
        }
    }

    async d(key, dirname = "") {
        try {
            const data = await this.read(dirname);
            if (data && data[key]) {
                delete data[key];
                await this.create(data, dirname);
            } else {
                throw new Error("Key not found");
            }
        } catch (error) {
            throw new Error("Failed to delete data: " + error.message);
        }
    }

    // Special operations
    async p(key, dirname = "") {
        try {
            const data = await this.read(dirname);
            if (data && data[key]) {
                console.log({ [key]: data[key] });
            } else {
                throw new Error("Key not found");
            }
        } catch (error) {
            throw new Error("Failed to retrieve data: " + error.message);
        }
    }

    async i(value, dirname = "") {
        try {
            const data = await this.read(dirname);
            const highestKey = Math.max(...Object.keys(data).map(Number), -1);
            await this.u(highestKey + 1, value, dirname);
        } catch (error) {
            throw new Error("Failed to insert: " + error.message);
        }
    }

    async l(desc, value = "", dirname = "") {
        try {
            await this.i(`${desc} ${value}`, dirname);
        } catch (error) {
            throw new Error("Failed to list: " + error.message);
        }
    }

    async f(key, value, dirname = "") {
        try {
            const data = await this.read(dirname);
            if (!data || !data[key]) {
                await this.u(key, value, dirname);
            }
        } catch (error) {
            throw new Error("Failed to find: " + error.message);
        }
    }
}

module.exports = JDB;
