#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import yargs from "yargs";
import _ from "lodash";
import NewmanConfig from "../lib/newmanconfig";
import packageJson from "../package.json";

clear();
console.log(
  chalk.rgb(
    220,
    120,
    60
  )(
    figlet.textSync("Newman-Tests-Runner", {
      font: "Doom",
      horizontalLayout: "full",
      whitespaceBreak: true,
    })
  )
);

const fileErrorMessage = chalk.red.bold("Please provide the relative path for feed file\n");

const argumentOptions = yargs
  .scriptName("newman-tests-runner")
  .scriptName("ntrun")
  .usage("Usage: newman-tests-runner [args] or ntrun [args]")
  .option("f", { alias: "feed", describe: "Feed file path", type: "string" })
  .option("v", {
    alias: "version",
    describe: "Current version for the newman-run package",
  })
  .check((argv) => {
    if (_.isEmpty(argv.f)) {
      console.log(fileErrorMessage);
      return false;
    } else {
      return true;
    }
  }).argv;

const NC = new NewmanConfig();

if (argumentOptions["v"]) {
  console.log(packageJson.version);
}

if (!_.isEmpty(argumentOptions["f"])) {
  NC.runFeedFile(argumentOptions["f"]);
}
