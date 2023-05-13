## Run multiple postman collections tests with itearations and environment data
### A command line tool to run multiple postman collections using newman

----

## Usage
```
newman-tests-runner -f <feed file path> (or) ntrun -f <feed file path>
```

----

Example of feed file:-
 ```
{
    "collections": [
        "./sample-files/test.postman_collection.json"
    ],
    "environment": "./sample-files/environment.json",
    "iterations": 1,
    "appName": "MyTestApp", //App Name To Be Reflected In Report
    "reporters": ["cli", "htmlextra"] // Currently only 2 reports cli and htmlextra are supported,
    "reportPath": "./newman-report/" //Path for the report to be generated (relative or complete path)
}
 ```

----

 ### Need help for running collections through multiple environment files and generate a single report