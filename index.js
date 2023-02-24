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

    directDir = "";
    setDirectDir = (dirname) => {
        this.directDir = path.join(this.baseDir, dirname);
    };

    create = (input, dirname = "") => {
        this.setDirectDir(dirname);
        if (!fs.existsSync(this.directDir)) {
            fs.mkdirSync(this.directDir, { recursive: true });
        }
        fs.writeFileSync(
            path.join(this.directDir, "jdb.json"),
            JSON.stringify(input, null, 4)
        );
    };
    read = (dirname = "") => {
        this.setDirectDir(dirname);
        if (fs.existsSync(this.directDir)) {
            return JSON.parse(
                fs.readFileSync(path.join(this.directDir, "jdb.json"))
            );
        } else {
            return "Database not found";
        }
    };
    update = (input, dirname = "") => {
        this.setDirectDir(dirname);
        if (fs.existsSync(this.directDir)) {
            fs.writeFileSync(
                path.join(this.directDir, "jdb.json"),
                JSON.stringify(
                    Object.assign({}, this.read(dirname), input),
                    null,
                    4
                )
            );
        } else {
            return "Database not found";
        }
    };
    delete = (dirname) => {
        this.setDirectDir(dirname);
        if (fs.existsSync(this.directDir)) {
            fs.rmSync(this.directDir, { recursive: true });
        } else {
            return "Database not found";
        }
    };
    print = (dirname = "") => {
        this.setDirectDir(dirname);
        if (fs.existsSync(this.directDir)) {
            console.log(
                JSON.parse(
                    fs.readFileSync(path.join(this.directDir, "jdb.json"))
                )
            );
        } else {
            return "Database not found";
        }
    };
    c = (key, value, dirname = "") => {
        this.create({ [key]: value }, dirname);
    };
    r = (key, dirname = "") => {
        let prev = this.read(dirname);
        if (key in prev) {
            return prev[key];
        } else {
            return "Key not found";
        }
    };
    u = (key, value, dirname = "") => {
        this.update({ [key]: value }, dirname);
    };
    d = (key, dirname = "") => {
        let prev = this.read(dirname);
        if (key in prev) {
            delete prev[key];
            this.create(prev, dirname);
        } else {
            return "Key not found";
        }
    };
    p = (key, dirname = "") => {
        let prev = this.read(dirname);
        if (key in prev) {
            console.log({ [key]: prev[key] });
        } else {
            return "Key not found";
        }
    };
    // automatically increment
    i = (value, dirname = "") => {
        let prev = this.read(dirname);
        let highest = Object.keys(prev)
            .map(Number)
            .sort((a, b) => b - a)
            .shift();
        if (highest === undefined) {
            highest = -1;
        }
        this.u(Number(highest) + 1, value, dirname);
    };
    // automatically increment with description appended
    l = (desc, value = "", dirname = "") => {
        if (value) {
            value = " " + value;
        }
        this.i(desc + value, dirname);
    };
    // only update for the first instance, useful for loops
    f = (key, value, dirname = "") => {
        let prev = this.read(dirname);
        if (!(key in prev)) {
            this.u(key, value, dirname);
        }
    };
}

module.exports = JDB;
