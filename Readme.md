## Run multiple postman collections tests with itearations and environment data

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
        "./test.postman_collection.json"
    ],
    "environment": "./environment.json",
    "iterations": 9
}
 ```