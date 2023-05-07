#!/usr/bin/env node

import _ from "lodash";
import { createRequire } from "module";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import NewmanConfig from "../lib/newmanconfig.js";

const fileErrorMessage = "Please provide the relative path for feed file\n";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json");

const argumentOptions = yargs(hideBin(process.argv))
  .scriptName("newman-tests-runner")
  .scriptName("ntrun")
  .usage("Usage: newman-tests-runner [args] or ntrun [args]")
  .option("f", { alias: "feed", describe: "Feed file path", type: "string" })
  .version('v', "Current version for the newman-tests-runner package", packageJson.version)
  .check((argv) => {
    if (_.isEmpty(argv.f)) {
      console.log(fileErrorMessage);
      return false;
    } else {
      return true;
    }
  }).argv;

const NC = new NewmanConfig();

if (!_.isEmpty(argumentOptions["f"])) {
  NC.runFeedFile(argumentOptions["f"]);
}
