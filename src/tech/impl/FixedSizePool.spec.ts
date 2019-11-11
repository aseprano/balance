import { FixedSizePool } from "./FixedSizePool";
import { Resource } from "../Pool";

class FakeResource implements Resource {

    constructor(private valid: boolean = true, private id: number = 0) { }

    isValid(): boolean {
        return this.valid;
    }

    getId(): number {
        return this.id;
    }

}

describe('FixedSizePool', () => {

    it('cannot have zero or negative size', () => {
        expect(() => new FixedSizePool(0, () => new FakeResource())).toThrow();
        expect(() => new FixedSizePool(-1, () => new FakeResource())).toThrow();
    });

    it('allocates all the resources in the constructor', () => {
        let numberOfAllocations = 0;
        
        const pool = new FixedSizePool<FakeResource>(5, () => {
            numberOfAllocations++;
            return new FakeResource();
        });

        expect(numberOfAllocations).toEqual(5);
        expect(pool.size()).toEqual(5);
    });

    it('returns all the allocated resources', async () => {
        let resourceId = 0;

        const pool = new FixedSizePool(3, () => {
            return new FakeResource(true, resourceId++);
        });

        const resourcesObtained = [
            (await pool.get()).getId(),
            (await pool.get()).getId(),
            (await pool.get()).getId()
        ];

        expect(resourcesObtained).toEqual([0, 1, 2]);
    });

    it('makes the client wait when no resources are available', async (done) => {
        let resourceId = 0;

        const pool = new FixedSizePool(3, () => {
            return new FakeResource(true, resourceId++);
        });

        const resources = [
            await pool.get(), // gets #0
            await pool.get(), // gets #1
            await pool.get(), // gets #2
        ];

        pool.get()
            .then((res) => {
                expect(res.getId()).toEqual(1);
                done();
            });

        pool.dispose(resources[1]);
    });

    it('returns the same size even when resources are in use', async () => {
        const pool = new FixedSizePool(3, () => {
            return new FakeResource();
        });
        
        expect(pool.size()).toEqual(3);

        await pool.get();
        expect(pool.size()).toEqual(3);
    });

});
