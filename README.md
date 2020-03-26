# benchmark-mock-server

A simple mock server written with nodejs, aimed for better performance.

## Install
1. git clone this repository
2. Run:
```bash
npm install
```

## Quick start

1. Prepare mapping config
Put **test.cfg** file into **mappings** folder
```json
{
    "request": {
        "urlPath": "/test",
        "method": "GET"
    },
    "response": {
        "status": 200,
        "headers": {
            "content-type": "application/json;charset=UTF-8"
        },
        "body": "{\"code\":0}"
    }
}
```

2. Start the server
```bash
./benchmark-mock-server
```

3. Test url
```bash
curl http://localhost:3000/test
```

4. Change config files
5. Reload config
```bash
curl http://localhost:3001/reload
```
No need to restart server!

6. Test url again

## Mapping config

### Request mapping
```json
{
    "request": {
        "method": "POST",
		"urlPath": "/test"
    },
    ...
}
```
| Request attributes| Description|
| ---------------------------------- | ------------------------------------------------------------ |
|  method | Match http method |
| urlPath | Match url |
| urlPathPattern | Match url with regex |
| bodyJsonPath | Match json body, find the value to be matched with path |
| bodyJsonValuePattern | Match json body, use regex to test value located by bodyJsonPath |

#### Example for bodyJsonPath and bodyJsonValuePattern
Config: 
```json
{
    "request": {
        "urlPath": "/t/body",
        "method": "POST",
        "bodyJsonPath": "$.data.id",
        "bodyJsonValuePattern": "a|b"
    },
    "response": {
        "status": 200,
        "headers": {
            "content-type": "application/json;charset=UTF-8"
        },
        "body": "{\"code\":0,\"msg\":\"id=a or b\"}"
    }
}
```

### Response config
```json
{
	...,
    "response": {
        "status": 200,
        "headers": {
            "content-type": "application/json;charset=UTF-8"
        },
        "body": "{\"code\":0,\"msg\":\"id=a or b\"}"
    }
}
```

| Request attributes| Description|
| ---------------------------------- | ------------------------------------------------------------ |
| status | http response status code|
| headers | http response header. you should always specify content-type |
| body | http response body |
| probabilities | probabilities to return another response. see below |
| fixedDelayMilliseconds | delay given milliseconds to return this response |

#### externel body
You can place body into a separated json file and reference it, to avoid escape.
config file:
```json
{
    ...,
    "response": {
        "status": 200,
        "headers": {
            "content-type": "application/json;charset=UTF-8"
        },
        "body": "@body.json"
    }
}
```
body.json:
```json
{
    "code": 0,
    "msg": "return ok"
}
```

#### probabilities
This example will return failed response with 10% probability, and return ok with 90% probability.
```json
{
    "request": {
        "urlPath": "/t/probability",
        "method": "GET"
    },
    "response": {
        "status": 200,
        "headers": {
            "content-type": "application/json;charset=UTF-8"
        },
        "body": "{\"code\":0,\"msg\":\"return ok\"}",
        "probabilities": [{
            "probability": 0.1,
            "status": 200,
            "fixedDelayMilliseconds": 100,
            "headers": {
                "content-type": "application/json;charset=UTF-8"
            },
            "body": "{\"code\":1,\"msg\":\"return failed\"}"
        }]
    }
}
```

#### Response template replace
benchmark-mock-server used *handlebars* to replace template in response.
body.json:
```json
{
    "code": 1,
    "msg": "normal return",
    "request_method": "{{request.requestLine.method}}",
    "request_path": "{{request.requestLine.path}}",
    "request_url": "{{request.url}}",
    "request_path_0": "{{request.requestLine.pathSegments.[0]}}",
    "request_path_1": "{{request.requestLine.pathSegments.[1]}}",
    "request_path_2": "{{request.requestLine.pathSegments.[2]}}",
    "request_body_0": "{{jsonPath request.body '$.req_id'}}",
    "request_body_1": "{{jsonPath request.body '$.req_name'}}",
    "request_body_2": "{{jsonPath request.body '$.data.[1].id'}}",
    "request_body_3": "{{jsonPath request.body '$.data[1].id'}}",
    "uuid": "{{uuid}}"
}
```
Request:
http://localhost:3000/t/request/json

```json
{
    "req_id": "id",
    "req_name": "name",
    "data": [
        {
            "id": 1
        },
        {
            "id": 2
        }
    ]
}
```
Response:
```json
{
    "code": 1,
    "msg": "normal return",
    "request_method": "POST",
    "request_path": "/t/request/json",
    "request_url": "/t/request/json",
    "request_path_0": "t",
    "request_path_1": "request",
    "request_path_2": "json",
    "request_body_0": "id",
    "request_body_1": "name",
    "request_body_2": "2",
    "request_body_3": "2",
    "uuid": "544a6c13-5431-4806-9836-5dbe376585f7"
}
```

## Command line options
Change listening port:
```bash
./benchmark-mock-server [port]
```

Then reload port will be port+1
If you use 8080 as server port, then 8081 will be used for reload.