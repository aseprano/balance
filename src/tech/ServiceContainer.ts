import { Function } from "../Function";
import { Provider } from "../Provider";

type Service = Promise<any>;

export class ServiceContainer {
    private singletons: Map<string, any> = new Map();
    private providers: Map<string, Provider<any>> = new Map();

    private getSingleton(name: string): any {
        return this.singletons.get(name);
    }

    private registerSingleton(service: any, name: string) {
        this.singletons.set(name, service);
    }

    private async buildService(provider: Function<ServiceContainer, Service>, name: string, shared: boolean): Promise<any> {
        return provider(this)
            .then((service) => {
                if (shared) {
                    this.registerSingleton(service, name);
                }

                return service;
            });
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