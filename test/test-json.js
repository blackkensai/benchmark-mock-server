const assert = require('assert');
const rp = require('request-promise-native');

describe('Json', () => {
    it('should return a json with 200 response', async () => {
        let data = await rp({
            uri: 'http://localhost:3000/t/200',
            headers: {
                "content-type": "application/json;charset=UTF-8"
            }
        });
        data = JSON.parse(data);
        assert.equal(data.code, 1);
        assert.equal(data.msg, 'normal return');
    });
    it('should return a json with 500 response', async () => {
        try {
            let data = await rp({
                method: 'POST',
                uri: 'http://localhost:3000/t/500',
                headers: {
                    "content-type": "application/json;charset=UTF-8"
                }
            });
            assert.fail('should have an exception.');
        } catch (e) {
            assert.equal(e.statusCode, 500);
            data = JSON.parse(e.error);
            assert.equal(data.code, 2);
            assert.equal(data.msg, 'return failed');
        }
    });
    it('should return a json with 1s delay', async () => {
        let start = new Date().getTime();
        let data = await rp({
            uri: 'http://localhost:3000/t/delay',
            headers: {
                "content-type": "application/json;charset=UTF-8"
            }
        });
        assert.ok((new Date().getTime() - start) > 1000, 'delay 1s');
        data = JSON.parse(data);
        assert.equal(data.code, 1);
        assert.equal(data.msg, 'normal return');
    });
    it('should failed with 10% probability', async () => {
        let failed_count = 0;
        for (let i = 0; i < 50; i++) {
            let data = await rp({
                uri: 'http://localhost:3000/t/probability',
                headers: {
                    "content-type": "application/json;charset=UTF-8"
                }
            });
            data = JSON.parse(data);
            assert.ok((data.code == 1 || data.code == 2), data.code + '');
            if (data.code == 2) {
                failed_count++;
            }
        }
        assert.ok(failed_count > 0 && failed_count < 50);
    });
    it('should return a json with external response', async () => {
        let data = await rp({
            uri: 'http://localhost:3000/t/body',
            headers: {
                "content-type": "application/json;charset=UTF-8"
            }
        });
        data = JSON.parse(data);
        assert.equal(data.code, 1);
        assert.equal(data.msg, 'normal return');
    });
    it('should return a json with response template', async () => {
        let data = await rp({
            method: 'POST',
            uri: 'http://localhost:3000/t/request/json',
            headers: {
                "content-type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify({
                req_id: 123,
                req_name: 'foo',
                data: [{
                    id: 0
                }, {
                    id: 456
                }]
            })
        });
        console.log(data);
        data = JSON.parse(data);
        assert.equal(data.code, 1);
        assert.equal(data.msg, 'normal return');
        assert.equal(data.request_method, 'POST');
        assert.equal(data.request_path, '/t/request/json');
        assert.equal(data.request_url, '/t/request/json');
        assert.equal(data.request_path_0, 't');
        assert.equal(data.request_path_1, 'request');
        assert.equal(data.request_path_2, 'json');
        assert.equal(data.request_body_0, 123);
        assert.equal(data.request_body_1, 'foo');
        assert.equal(data.request_body_2, 456);
        assert.equal(data.request_body_3, 456);
    });
});