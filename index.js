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
const fs = require("fs");

class JDB {
    constructor(baseDir) {
        this.baseDir = baseDir;
    }

    // Private methods
    _getDirectoryPath(dirname) {
        return path.join(this.baseDir, dirname);
    }

    _getFilePath(dirname) {
        return path.join(this._getDirectoryPath(dirname), "jdb.json");
    }

    _checkDirectoryExists(dirname) {
        return fs.existsSync(this._getDirectoryPath(dirname));
    }

    _createDirectory(dirname) {
        if (!this._checkDirectoryExists(dirname)) {
            fs.mkdirSync(this._getDirectoryPath(dirname), { recursive: true });
        }
    }

    // Public methods
    create(input, dirname = "") {
        this._createDirectory(dirname);
        fs.writeFileSync(
            this._getFilePath(dirname),
            JSON.stringify(input, null, 4)
        );
    }

    read(dirname = "") {
        if (this._checkDirectoryExists(dirname)) {
            return JSON.parse(fs.readFileSync(this._getFilePath(dirname)));
        } else {
            return "Database not found";
        }
    }

    update(input, dirname = "") {
        if (this._checkDirectoryExists(dirname)) {
            const data = Object.assign({}, this.read(dirname), input);
            fs.writeFileSync(
                this._getFilePath(dirname),
                JSON.stringify(data, null, 4)
            );
        } else {
            return "Database not found";
        }
    }

    delete(dirname) {
        if (this._checkDirectoryExists(dirname)) {
            fs.rmSync(this._getDirectoryPath(dirname), { recursive: true });
        } else {
            return "Database not found";
        }
    }

    print(dirname = "") {
        if (this._checkDirectoryExists(dirname)) {
            console.log(this.read(dirname));
        } else {
            return "Database not found";
        }
    }

    // Shortened CRUD operations
    c(key, value, dirname = "") {
        this.create({ [key]: value }, dirname);
    }

    r(key, dirname = "") {
        const data = this.read(dirname);
        return data && data[key] ? data[key] : "Key not found";
    }

    u(key, value, dirname = "") {
        this.update({ [key]: value }, dirname);
    }

    d(key, dirname = "") {
        const data = this.read(dirname);
        if (data && data[key]) {
            delete data[key];
            this.create(data, dirname);
        } else {
            return "Key not found";
        }
    }

    p(key, dirname = "") {
        const data = this.read(dirname);
        if (data && data[key]) {
            console.log({ [key]: data[key] });
        } else {
            return "Key not found";
        }
    }

    // Special operations
    i(value, dirname = "") {
        const data = this.read(dirname);
        const highestKey = Math.max(...Object.keys(data).map(Number), -1);
        this.u(highestKey + 1, value, dirname);
    }

    l(desc, value = "", dirname = "") {
        this.i(`${desc} ${value}`, dirname);
    }

    f(key, value, dirname = "") {
        const data = this.read(dirname);
        if (!data || !data[key]) {
            this.u(key, value, dirname);
        }
    }
}

module.exports = JDB;
