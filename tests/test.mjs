import * as path from "path";
import jsoneng from "../index.js";

const dirname = path.join(process.cwd());
const jdb = new jsoneng.JDB(path.join(dirname, "jdb"));

function runTests() {
  // Helper function to check if two objects are deeply equal
  function deepEqual(actual, expected) {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  async function testCreate() {
    await jdb.create({ key1: "value1" }, "db1");
    const data = await jdb.read("db1");
    if (deepEqual(data, { key1: "value1" })) {
      console.log("create: Passed");
    } else {
      console.error("create: Failed");
    }
  }

  async function testRead() {
    const data = await jdb.read("db1");
    if (deepEqual(data, { key1: "value1" })) {
      console.log("read: Passed");
    } else {
      console.error("read: Failed");
    }
  }

  async function testUpdate() {
    await jdb.update({ key1: "updatedValue" }, "db1");
    const data = await jdb.read("db1");
    if (deepEqual(data, { key1: "updatedValue" })) {
      console.log("update: Passed");
    } else {
      console.error("update: Failed");
    }
  }

  async function testDelete() {
    await jdb.delete("db1");
    try {
      await jdb.read("db1");
      console.error("delete: Failed");
    } catch (error) {
      if (error.message === "Database not found") {
        console.log("delete: Passed");
      } else {
        console.error("delete: Failed");
      }
    }
  }

  async function runAllTests() {
    try {
      await testCreate();
      await testRead();
      await testUpdate();
      await testDelete();
    } catch (error) {
      console.error("Test failed with error:", error.message);
    }
  }
  runAllTests();
}

runTests();
