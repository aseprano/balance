import { ServiceContainer } from "./ServiceContainer";

describe('ServiceContainer', () => {

    it('throws an error when the client asks for a service that has not been declared', () => {
        const container = new ServiceContainer();
        expect(() => container.get('Foo')).toThrow();
    });

    it('builds the service once if declared shared', () => {
        let providerInvocations = 0;

        const provider = () => {
            providerInvocations++;
            return 10;
        }

        const container = new ServiceContainer();
        container.declare('foo', provider);

        const result1 = container.get('foo');
        const result2 = container.get('foo');

        expect(result1).toEqual(10);
        expect(result2).toEqual(10);
        expect(providerInvocations).toEqual(1);
    });

    it('builds the service everytime it is required if it has not been declared as shared', () => {
        let providerIvocations = 0;

        const provider = () => {
            providerIvocations++;
            return 7;
        };

        const container = new ServiceContainer();
        container.declare('foobar', provider, false);

        expect(container.get('foobar')).toEqual(7);
        expect(container.get('foobar')).toEqual(7);
        expect(providerIvocations).toEqual(2);
    });

    it('replaces the existing singleton instance of a service if the provider is redeclared', () => {
        const provider1 = () => {
            return 10;
        };

        const provider2 = () => {
            return 7;
        };

        const container = new ServiceContainer();
        container.declare('foo', provider1);
        container.get('foo'); // forces the provider1 to be invoked and its result value to be stored

        container.declare('foo', provider2);
        expect(container.get('foo')).toEqual(7);
        expect(container.get('foo')).toEqual(7);
    });

})