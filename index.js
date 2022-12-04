const fs = require("fs");

class JDB {
    create = (input, location) => {
        if (!fs.existsSync(location)) {
            fs.mkdirSync(location, { recursive: true });
        }
        fs.writeFileSync(
            location + "/jdb.json",
            JSON.stringify(input, null, 4)
        );
    };
    read = (location) => {
        if (fs.existsSync(location)) {
            return JSON.parse(fs.readFileSync(location + "/jdb.json"));
        } else {
            return "Database not found";
        }
    };
    update = (input, location) => {
        if (fs.existsSync(location)) {
            fs.writeFileSync(
                location + "/jdb.json",
                JSON.stringify(input, null, 4)
            );
        } else {
            return "Database not found";
        }
    };
    delete = (location) => {
        if (fs.existsSync(location)) {
            fs.rmSync(location, { recursive: true });
        } else {
            return "Database not found";
        }
    };
    print = (location) => {
        if (fs.existsSync(location)) {
            console.log(JSON.parse(fs.readFileSync(location + "/jdb.json")));
        } else {
            return "Database not found";
        }
    };
}

module.exports = JDB;
