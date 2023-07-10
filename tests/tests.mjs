import { runTests as runSyncTests } from "./JDBTest.mjs";
import { runTests as runAsyncTests } from "./JsonDBTest.mjs";

console.log("Starting synchronous tests...");
runSyncTests();
console.log("Synchronous tests completed.");

console.log("Starting asynchronous tests...");
runAsyncTests();
console.log("Asynchronous tests completed.");
