import { FixedSizePool } from "./FixedSizePool";

describe('FixedSizePool', () => {

    it('cannot have zero or negative size', () => {
        expect(() => new FixedSizePool(0, () => null)).toThrow();
        expect(() => new FixedSizePool(-1, () => null)).toThrow();
    });

    it('allocates all the resources in the constructor', () => {
        let numberOfAllocations = 0;
        
        const pool = new FixedSizePool<Object>(5, () => {
            numberOfAllocations++;
            return new Object();
        });

        expect(numberOfAllocations).toEqual(5);
        expect(pool.size()).toEqual(5);
    });

    it('returns all the allocated resources', async () => {
        let resourceId = 0;

        const pool = new FixedSizePool(3, () => {
            return {
                id: resourceId++
            };
        });

        const resourcesObtained = [
            (await pool.get())['id'],
            (await pool.get())['id'],
            (await pool.get())['id']
        ];

        expect(resourcesObtained).toEqual([0, 1, 2]);
    });

    it('makes the client wait when no resources are available', async (done) => {
        let resourceId = 0;

        const pool = new FixedSizePool(3, () => {
            return {
                id: resourceId++
            }
        });

        const resources = [
            await pool.get(), // gets #0
            await pool.get(), // gets #1
            await pool.get(), // gets #2
        ];

        pool.get()
            .then((res) => {
                expect(res['id']).toEqual(1);
                done();
            });

        pool.dispose(resources[1]);
    });

    it('returns the same size even when resources are in use', async () => {
        const pool = new FixedSizePool(3, () => {
            return {foo: 'bar'}
        });
        
        expect(pool.size()).toEqual(3);

        await pool.get();
        expect(pool.size()).toEqual(3);
    });

});
