import { Function } from "../Function";
import { Provider } from "../Provider";

export class ServiceContainer {
    private singletons: Map<string, any> = new Map();
    private providers: Map<string, Provider<any>> = new Map();

    private getSingleton(name: string): any {
        return this.singletons.get(name);
    }

    private registerSingleton(service: any, name: string) {
        this.singletons.set(name, service);
    }

    private buildService(provider: Function<ServiceContainer, any>, name: string, shared: boolean): any {
        const newService = provider(this);

        if (shared) {
            this.registerSingleton(newService, name);
        }

        return newService;
    }

    declare(serviceName: string, provider: Function<ServiceContainer, any>, shared?: boolean): ServiceContainer {
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