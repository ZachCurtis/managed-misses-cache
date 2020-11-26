import Cache from '../index'
import assert = require('assert')

describe('cache', function () {

    beforeEach(function () {
        Cache.unbindMissHandler('name')
        Cache.unbindMissHandler('job')
    })

    it('should save and load a value', async function () {
        await Cache.bindMissHandler('name', 15000, async function () {
            return 'sam'
        })

        assert.strictEqual(await Cache.get('name'), 'sam')
    })

    it('should use a generic miss handler', async function () {
        async function getData(key: string): Promise<string> {

            switch (key) {
                case 'name':
                    return 'sam'

                case 'job':
                    return 'driver'
            }

            return ''
        }

        await Cache.bindMissHandler('name', 15000, getData)
        await Cache.bindMissHandler('job', 15000, getData)

        setTimeout(async function () {
            let name = await Cache.get('name')
            let job = await Cache.get('job')

            assert.strictEqual(name, 'sam')
            assert.strictEqual(job, 'driver')
        }, 200)

    })

    it('should delete the data after it expires', async function () {
        let lastSaved = 0

        await Cache.bindMissHandler('name', 2000, async function (key: string) {
            lastSaved = Date.now()

            return 'sam'
        })

        let lastSaved0 = lastSaved
        await Cache.get('name')
        let lastSaved1 = Date.now()

        assert.strictEqual((lastSaved1 - lastSaved0) > 2000, true)

        setTimeout(async () => {
            let lastSavedCache = lastSaved

            await Cache.get('name')

            assert.strictEqual((lastSaved - lastSavedCache) > 2000, true)
        }, 3000);
    })

    it('should allow for manual misses', async function() {
        let name = 'sam'
        await Cache.bindMissHandler('name', 15000, async function () {
            return name
        })

        assert.strictEqual(await Cache.get('name'), 'sam')
       
        name = 'joe'
        await Cache.miss('name')

        assert.strictEqual(await Cache.get('name'), 'joe')
    })

    it('should unbind miss handlers', async function () {
        await Cache.bindMissHandler('name', 2, async function (key: string) {
            return 'sam'
        })

        assert.strictEqual(await Cache.get('name'), 'sam')

        await Cache.unbindMissHandler('name')

        setTimeout(async () => {
            
            await Cache.bindMissHandler('name', 2000, async function (key: string) {
                return 'john'
            })
    
            assert.strictEqual(await Cache.get('name'), 'john')
        }, 150);
    })
})
