import chalk from "chalk";
import fs from "fs";
import _ from "lodash";
import { createRequire } from "module";
import newman from "newman";
import path from "path";
import { ItemGroupDefinition } from "postman-collection";
import { rimrafSync } from "rimraf";
import { FeedType } from "./types/feed.type.ts";

const require = createRequire(import.meta.url);

export default class NewmanConfig {
  public currentPath: string;
  public reportersList: string[];
  public htmlReportPath: string;

  constructor() {
    this.currentPath = process.cwd();
    this.reportersList = ["cli"];
  }

  public runFeedFile = (feedFilePath: string) => {
    const feedFile = path.join(process.cwd(), feedFilePath);
    console.log("Feed File taken to run: " + feedFile);
    if (!_.isEmpty(feedFile) && fs.existsSync(feedFile)) {
      const feedFileDetails: FeedType = require(feedFile);
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

  private async runNewmanTests(feedFileDetails: FeedType) {
    const environmentFilePath: string = path.join(
      process.cwd(),
      feedFileDetails.environment as string
    );
    const items = feedFileDetails.collections.map((collectionRelativePath) => {
      const collectionPath = path.join(process.cwd(), collectionRelativePath);
      const collection: ItemGroupDefinition = require(collectionPath);
      return collection.item;
    });
    newman.run(
      {
        collection: {
          item: _.flatten(items),
        },
        environment: require(environmentFilePath),
        reporters: this.reportersList,
        reporter: {
          html: {
            export: this.htmlReportPath.concat(`${new Date().getTime()}`).concat(".html"),
          },
        },
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
