const fs = require("fs");
const path = require("path");

class JsonDB {
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

  _checkDirectoryExists(dirname) {
    return fs.existsSync(this._getDirectoryPath(dirname));
  }

  _createDirectory(dirname) {
    if (!this._checkDirectoryExists(dirname)) {
      fs.mkdirSync(this._getDirectoryPath(dirname), { recursive: true });
    }
  }

  setIndent(indent) {
    this.indent = indent;
  }

  create(input, dirname = "") {
    this._createDirectory(dirname);
    fs.writeFileSync(
      this._getFilePath(dirname),
      JSON.stringify(input, null, this.indent)
    );
  }

  read(dirname = "") {
    if (this._checkDirectoryExists(dirname)) {
      const data = fs.readFileSync(this._getFilePath(dirname), "utf-8");
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    } else {
      throw new Error("Database not found");
    }
  }

  update(input, dirname = "") {
    if (this._checkDirectoryExists(dirname)) {
      fs.writeFileSync(
        this._getFilePath(dirname),
        JSON.stringify(input, null, this.indent)
      );
    } else {
      throw new Error("Database not found");
    }
  }

  patch(input, dirname = "") {
    if (this._checkDirectoryExists(dirname)) {
      const data = this.read(dirname);
      if (data) {
        const updatedData = { ...data, ...input };
        fs.writeFileSync(
          this._getFilePath(dirname),
          JSON.stringify(updatedData, null, this.indent)
        );
      }
    } else {
      throw new Error("Database not found");
    }
  }

  delete(dirname) {
    if (this._checkDirectoryExists(dirname)) {
      fs.rmSync(this._getDirectoryPath(dirname), { recursive: true });
    } else {
      throw new Error("Database not found");
    }
  }

  print(dirname = "") {
    if (this._checkDirectoryExists(dirname)) {
      console.log(this.read(dirname));
    } else {
      throw new Error("Database not found");
    }
  }

  // The shortened methods are synchronous
  c(key, value, dirname = "") {
    this.create({ [key]: value }, dirname);
  }

  r(key, dirname = "") {
    const data = this.read(dirname);
    if (data && data[key]) {
      return data[key];
    } else {
      throw new Error("Key not found");
    }
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
      throw new Error("Key not found");
    }
  }

  p(key, value, dirname = "") {
    this.patch({ [key]: value }, dirname);
  }

  prt(key, dirname = "") {
    const data = this.read(dirname);
    if (data && data[key]) {
      console.log({ [key]: data[key] });
    } else {
      throw new Error("Key not found");
    }
  }

  i(value, dirname = "") {
    const data = this.read(dirname);
    const highestKey = Math.max(...Object.keys(data).map(Number), -1);
    this.p(highestKey + 1, value, dirname);
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

module.exports = JsonDB;
