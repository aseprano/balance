import { ServiceContainer } from "./ServiceContainer";

describe('ServiceContainer', () => {

    it('throws an error when the client asks for a service that has not been declared', (done) => {
        const container = new ServiceContainer();
        container.get('foo1')
            .catch(() => done());
    });

    it('builds the service once if declared shared', async () => {
        let providerInvocations = 0;

        const provider = async () => {
            providerInvocations++;
            return 10;
        }

        const container = new ServiceContainer();
        container.declare('foo', provider);

        const result1 = await container.get('foo');
        const result2 = await container.get('foo');

        expect(result1).toEqual(10);
        expect(result2).toEqual(10);
        expect(providerInvocations).toEqual(1);
    });

    it('builds the service everytime it is required if it has not been declared as shared', async () => {
        let providerIvocations = 0;

        const provider = async () => {
            providerIvocations++;
            return 7;
        };

        const container = new ServiceContainer();
        container.declare('foobar', provider, false);

        expect(await container.get('foobar')).toEqual(7);
        expect(await container.get('foobar')).toEqual(7);
        expect(providerIvocations).toEqual(2);
    });

    it('replaces the existing instance of singleton if the provider is redeclared', async () => {
        const provider1 = async () => {
            return 10;
        };

        const provider2 = async () => {
            return 7;
        };

        const container = new ServiceContainer();
        container.declare('foo', provider1);
        container.get('foo'); // forces the provider1 to be invoked and its result value to be stored

        container.declare('foo', provider2);
        expect(await container.get('foo')).toEqual(7);
        expect(await container.get('foo')).toEqual(7);
    });

})
