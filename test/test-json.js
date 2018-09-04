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
        for (let i = 0; i < 100; i++) {
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
        assert.ok(failed_count > 0);
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
});