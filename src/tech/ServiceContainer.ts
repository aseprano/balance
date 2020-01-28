import { Function } from "../Function";

type Service = any;

export class ServiceContainer {
    private singletons: Map<string, Service> = new Map();
    private providers: Map<string, Service> = new Map();

    private getSingleton(name: string): Service {
        return this.singletons.get(name);
    }

    private registerSingleton(service: Service, name: string) {
        this.singletons.set(name, service);
    }

    private buildService(provider: Function<ServiceContainer, Service>, name: string, shared: boolean): Promise<any> {
        const service = provider(this);

        if (shared) {
            this.registerSingleton(service, name);
        }

        return service;
    }

    declare(serviceName: string, provider: Function<ServiceContainer, Service>, shared?: boolean): ServiceContainer {
        this.singletons.delete(serviceName);

        this.providers.set(
            serviceName,
            () => {
                return this.getSingleton(serviceName) || this.buildService(provider, serviceName, shared === undefined ? true : shared);
            }
        );

        return this;
    }

    get(serviceName: string): any {
        const provider = this.providers.get(serviceName);

        if (!provider) {
            throw new Error('Unknown service: ' + serviceName);
        }

        return provider();
    }
    
}