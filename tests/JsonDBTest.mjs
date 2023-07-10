// Since we're dealing with synchronous versions now, we don't need to use async/await.
// Methods should throw errors on failure, which we catch with a try/catch block.

import * as path from "path";
import jsoneng from "../index.js";

const dirname = path.join(process.cwd());
const jsonDB = new jsoneng.JsonDB(path.join(dirname, "jsonDB"));

export function runTests() {
  // Helper function to check if two objects are deeply equal
  function deepEqual(actual, expected) {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  function testCreate() {
    try {
      jsonDB.create({ key1: "value1" }, "db1");
      const data = jsonDB.read("db1");
      if (deepEqual(data, { key1: "value1" })) {
        console.log("create: Passed");
      } else {
        console.error("create: Failed");
      }
    } catch (error) {
      console.error("create: Failed with error:", error.message);
    }
  }

  function testRead() {
    try {
      const data = jsonDB.read("db1");
      if (deepEqual(data, { key1: "value1" })) {
        console.log("read: Passed");
      } else {
        console.error("read: Failed");
      }
    } catch (error) {
      console.error("read: Failed with error:", error.message);
    }
  }

  function testUpdate() {
    try {
      jsonDB.update({ key1: "updatedValue" }, "db1");
      const data = jsonDB.read("db1");
      if (deepEqual(data, { key1: "updatedValue" })) {
        console.log("update: Passed");
      } else {
        console.error("update: Failed");
      }
    } catch (error) {
      console.error("update: Failed with error:", error.message);
    }
  }

  function testDelete() {
    try {
      jsonDB.delete("db1");
      jsonDB.read("db1");
      console.error("delete: Failed");
    } catch (error) {
      if (error.message === "Database not found") {
        console.log("delete: Passed");
      } else {
        console.error("delete: Failed");
      }
    }
  }

  function testPatch() {
    try {
      jsonDB.create({ key1: "value1", key2: "value2" }, "db1"); // Initial data
      jsonDB.patch({ key1: "updatedValue" }, "db1"); // Updating key1
      const data = jsonDB.read("db1");
      if (deepEqual(data, { key1: "updatedValue", key2: "value2" })) {
        // key2 should still exist
        console.log("patch: Passed");
      } else {
        console.error("patch: Failed");
      }
    } catch (error) {
      console.error("patch: Failed with error:", error.message);
    }
  }

  function runAllTests() {
    try {
      testCreate();
      testRead();
      testUpdate();
      testDelete();
      testPatch();
    } catch (error) {
      console.error("Test failed with error:", error.message);
    }
  }

  runAllTests();
}

runTests();
