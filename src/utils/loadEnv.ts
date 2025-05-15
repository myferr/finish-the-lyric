const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const envPath = path.join(__dirname, "../../env.yml");

function getEnvConfig() {
  if (!fs.existsSync(envPath)) {
    throw new Error("env.yml not found");
  }

  const file = fs.readFileSync(envPath, "utf8");
  const config = yaml.load(file);

  if (!Array.isArray(config.admins)) {
    throw new Error("Invalid format: 'admins' should be an array");
  }

  return config;
}

export { getEnvConfig };
