import chalk from "chalk";
import fs from "fs";
import _ from "lodash";
import { createRequire } from "module";
import newman from "newman";
import path from "path";

const require = createRequire(import.meta.url);

export default class NewmanConfig {
  currentPath = "";
  reportersList = [];

  constructor() {
    this.currentPath = process.cwd();
    this.reportersList = ["cli"];
  }

  runFeedFile = (feedFilePath) => {
    const feedFile = path.join(process.cwd(), feedFilePath);
    console.log("Feed File taken to run: " + feedFile);
    if (!_.isEmpty(feedFile) && fs.existsSync(feedFile)) {
      const feedFileDetails = require(feedFile);
      if (
        !_.isEmpty(feedFileDetails.collections) &&
        !_.isEmpty(feedFileDetails.environment) &&
        feedFileDetails.iterations > 0
      ) {
        this.runNewmanTests(feedFileDetails);
      } else {
        console.log(chalk.red("Collections/Environment/IterationCount is invalid"));
      }
    }
  };

  async runNewmanTests(feedFileDetails) {
    const environmentFilePath = path.join(process.cwd(), feedFileDetails.environment);
    const items = feedFileDetails.collections.map((collectionRelativePath) => {
      const collectionPath = path.join(process.cwd(), collectionRelativePath);
      const collection = require(collectionPath);
      return collection.item;
    });
    newman.run(
      {
        collection: {
          item: _.flatten(items),
        },
        environment: require(environmentFilePath),
        reporters: this.reportersList,
        iterationCount: feedFileDetails.iterations,
        insecure: true,
      },
      function (err, summary) {
        if (err || summary.run.failures.length) {
          console.log("collection run complete!");
          process.exit(1);
        }
      }
    );
  }
}
