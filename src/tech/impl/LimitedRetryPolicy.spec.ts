import { LimitedRetryPolicy } from "./LimitedRetryPolicy";

function RetryAlways(): boolean {
    return true;
}

describe('LimitedRetryPolicy', () => {

    it('cannot be built with a 0 limit', () => {
        expect(() => {
            new LimitedRetryPolicy(0, RetryAlways);
        }).toThrow();
    });

    it('cannot be built with a negative limit', () => {
        expect(() => {
            new LimitedRetryPolicy(-1, RetryAlways);
        }).toThrow();
    });

    it('returns the value of f() if no error is thrown', (done) => {
        const f: () => Promise<number> = () => Promise.resolve(10);

        const retry = new LimitedRetryPolicy<number>(3, RetryAlways);

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

        const retry = new LimitedRetryPolicy(5, RetryAlways);

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

        const retry = new LimitedRetryPolicy<number>(5, RetryAlways);

        retry.applyTo(f)
            .then(v => {
                expect(v).toBe(10);
                expect(numberOfInvocations).toBe(1);
                done();
            });
    });

    it('will not retry if the errorcheck returns false', (done) => {
        let attemptsCount = 0;

        const policy = new LimitedRetryPolicy(
            5,
            (error) => error instanceof RangeError, // retry only if error is RangeError
        );

        policy.applyTo(() => {
            attemptsCount++;
            return Promise.reject(new Error('Dummy Error'));
        }).catch(e => {
            expect(attemptsCount).toBe(1);
            done();
        });

    });

});
