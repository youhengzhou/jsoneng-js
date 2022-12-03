const fs = require("fs");
const path = require("path");

export default class JDB {
    dbName = "jdb/";
    create = (input, name = "") => {
        if (!fs.existsSync(this.dbName + name)) {
            fs.mkdirSync(this.dbName + name, { recursive: true });
        }
        fs.writeFileSync(
            path.join(__dirname, this.dbName + name + "/jdb.json"),
            JSON.stringify(input, null, 4)
        );
    };
    read = (name = "") => {
        if (fs.existsSync(this.dbName + name)) {
            return JSON.parse(
                fs.readFileSync(
                    path.join(__dirname, this.dbName + name + "/jdb.json")
                )
            );
        } else {
            return "Database not found";
        }
    };
    update = (input, name = "") => {
        if (fs.existsSync(this.dbName + name)) {
            fs.writeFileSync(
                path.join(__dirname, this.dbName + name + "/jdb.json"),
                JSON.stringify(input, null, 4)
            );
        } else {
            return "Database not found";
        }
    };
    delete = (name = "") => {
        if (fs.existsSync(this.dbName + name)) {
            fs.rmSync(this.dbName + name, { recursive: true });
        } else {
            return "Database not found";
        }
    };
    print = (name = "") => {
        if (fs.existsSync(this.dbName + name)) {
            console.log(
                JSON.parse(
                    fs.readFileSync(
                        path.join(__dirname, this.dbName + name + "/jdb.json")
                    )
                )
            );
        } else {
            return "Database not found";
        }
    };
}
