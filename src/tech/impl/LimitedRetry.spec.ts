import { LimitedRetry } from "./LimitedRetry";

describe('LimitedRetry', () => {

    it('returns the value of f() if no error is thrown', (done) => {
        const f: () => Promise<number> = () => Promise.resolve(10);

        const retry = new LimitedRetry<number>(3);

        retry.applyTo(f)
            .then(v => {
                expect(v).toBe(10);
                done();
            });
    });

    it('invokes f() the specified max number of times before returning the error', (done) => {
        let numberOfInvocations = 0;

        const f = () => {
            numberOfInvocations++;
            return Promise.reject(new Error('some generic error'));
        }

        const retry = new LimitedRetry(5);

        retry.applyTo(f)
            .catch(error => {
                expect(numberOfInvocations).toBe(5);
                expect(error.message).toBe('some generic error');
                done();
            });
    });

    it('invokes f() a number of times lower than the max if it gets a valid value', (done) => {
        let numberOfInvocations = 0;

        const f = () => new Promise<number>((resolve, reject) => {
                if (++numberOfInvocations === 1) {
                    resolve(10);
                } else {
                    reject(new Error('Dummy error'));
                }
            });

        const retry = new LimitedRetry<number>(5);

        retry.applyTo(f)
            .then(v => {
                expect(v).toBe(10);
                expect(numberOfInvocations).toBe(1);
                done();
            });
    });

});
