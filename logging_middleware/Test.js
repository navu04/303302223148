import Log from "./logger.js";

(async () => {

  await Log(
    "backend",
    "info",
    "service",
    "application started"
  );

  await Log(
    "backend",
    "error",
    "handler",
    "received string, expected bool"
  );

})();