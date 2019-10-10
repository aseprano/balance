import { LimitedRetry } from "./LimitedRetry";

function RetryAlways(): boolean {
    return true;
}

describe('LimitedRetry', () => {

    it('cannot be built with a 0 limit', () => {
        expect(() => {
            new LimitedRetry(0, RetryAlways);
        }).toThrow();
    });

    it('cannot be built with a negative limit', () => {
        expect(() => {
            new LimitedRetry(-1, RetryAlways);
        }).toThrow();
    });

    it('returns the value of f() if no error is thrown', (done) => {
        const f: () => Promise<number> = () => Promise.resolve(10);

        const retry = new LimitedRetry<number>(3, RetryAlways);

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

        const retry = new LimitedRetry(5, RetryAlways);

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

        const retry = new LimitedRetry<number>(5, RetryAlways);

        retry.applyTo(f)
            .then(v => {
                expect(v).toBe(10);
                expect(numberOfInvocations).toBe(1);
                done();
            });
    });

    it('will not retry if the errorcheck returns false', (done) => {
        let attemptsCount = 0;

        const policy = new LimitedRetry(
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
