import { color } from "console-log-colors";
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
    this.reportersList = ["cli", "htmlextra"];
  }

  runFeedFile = (feedFilePath) => {
    const feedFile = path.join(process.cwd(), feedFilePath);
    console.log(color.greenBright("Feed File taken to run: " + feedFile));
    if (!_.isEmpty(feedFile) && fs.existsSync(feedFile)) {
      const feedFileDetails = require(feedFile);
      if (
        !_.isEmpty(feedFileDetails.collections) &&
        !_.isEmpty(feedFileDetails.environment) &&
        feedFileDetails.iterations > 0
      ) {
        this.runNewmanTests(feedFileDetails);
      } else {
        console.log(color.redBright("Collections/Environment/IterationCount is invalid"));
      }
    } else {
      console.log(color.redBright("Feed File doesn't exist or Path is invalid"));
    }
  };

  checkReporters(reporters) {
    return (
      !_.isEmpty(reporters) &&
      _.isEmpty(_.filter(reporters, (r) => !["cli", "htmlextra"].includes(r)))
    );
  }

  getReportPath(reportPath) {
    if (_.startsWith(reportPath, ".")) {
      return path.join(process.cwd(), reportPath);
    }
    return reportPath;
  }

  async runNewmanTests(feedFileDetails) {
    if(!this.checkReporters(feedFileDetails.reporters)){
      console.log(color.redBright("Only reporters cli and htmlextra are supported"));
      process.exit(1);
    }
    this.reportersList = feedFileDetails.reporters
    const appName = feedFileDetails.appName || "MyApp";
    const environmentFilePath = path.join(process.cwd(), feedFileDetails.environment);
    const auth = [];
    const variables = [];
    const items = feedFileDetails.collections.map((collectionRelativePath) => {
      const collectionPath = path.join(process.cwd(), collectionRelativePath);
      const collection = require(collectionPath);
      if (collection?.auth?.length) {
        auth.push(collection.auth);
      }
      if (collection?.variables?.length) {
        variables.push(collection.variables);
      }
      return collection.item;
    });
    newman.run(
      {
        collection: {
          name: `${appName}-${new Date()
            .toISOString()
            .split(/[-:.Z]/)
            .join("")}`,
          item: _.flatten(items),
          ...(!_.isEmpty(auth) && { auth: _.flatten(auth) }),
          ...(!_.isEmpty(variables) && { variables: _.flatten(variables) }),
        },
        environment: require(environmentFilePath),
        reporters: this.reportersList,
        reporter: {
          htmlextra: {
            export: `${this.getReportPath(feedFileDetails.reportPath)}${appName}-${new Date()
              .toISOString()
              .split(/[-:.Z]/)
              .join("")}.html`,
            skipHeaders: "Authorization",
            browserTitle: `${appName}Newman Report${new Date()
              .toISOString()
              .split(/[-:.Z]/)
              .join("")}`,
            browserTitle: `${appName}Newman Report${new Date()
              .toISOString()
              .split(/[-:.Z]/)
              .join("")}`,
          },
        },
        iterationCount: feedFileDetails.iterations,
        insecure: true,
      },
      function (err, summary) {
        if (err || summary.run.failures.length) {
          console.log(color.redBright(err.message));
          console.log(color.redBright(summary.run.failures.map((f) => f.error)));
          process.exit(1);
        }
      }
    );
  }
}
