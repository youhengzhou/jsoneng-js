import * as path from "path";
import jsoneng from "../index.js";

const dirname = path.join(process.cwd());
const jdb = new jsoneng.JDB(path.join(dirname, "jdb"));

export function runTests() {
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
    try {
      try {
        await jdb.delete("db1");
      } catch (error) {
        if (error.code === "EPERM") {
          // Try again
          console.log("EPERM error encountered, retrying...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await jdb.delete("db1");
        } else {
          throw error;
        }
      }

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

  async function testPatch() {
    try {
      // Creating an initial object with two keys
      await jdb.create({ key1: "value1", key2: "value2" }, "db1");
      // Updating key1 only
      await jdb.patch({ key1: "updatedValue" }, "db1");
      const data = await jdb.read("db1");
      // Checking if key1 has been updated and key2 is still the same
      if (deepEqual(data, { key1: "updatedValue", key2: "value2" })) {
        console.log("patch: Passed");
      } else {
        console.error("patch: Failed");
      }
    } catch (error) {
      console.error("patch: Failed with error:", error.message);
    }
  }

  async function runAllTests() {
    try {
      await testCreate();
      await testRead();
      await testUpdate();
      await testDelete();
      await testPatch();
    } catch (error) {
      console.error("Test failed with error:", error.message);
    }
  }
  runAllTests();
}

runTests();
