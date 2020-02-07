import { Function } from "../Function";

type Service = any;
type ServiceProvider = Function<ServiceContainer, Promise<Service>>;

export class ServiceContainer {
    private singletons: Map<string, Service> = new Map();
    private providers: Map<string, ServiceProvider> = new Map();

    declare(serviceName: string, provider: ServiceProvider, shared?: boolean): ServiceContainer {
        this.singletons.delete(serviceName);

        this.providers.set(
            serviceName,
            async () => {
                const service = await provider(this);

                if (shared === undefined || shared === true) {
                    this.singletons.set(serviceName, service);
                }

                return service;
            }
        );

        return this;
    }

    get(serviceName: string): Promise<Service> {
        let service: Service = this.singletons.get(serviceName);

        if (!service) {
            const provider = this.providers.get(serviceName);

            if (provider !== undefined) {
                service = provider(this);
            } else {
                return Promise.reject(new Error('Unknown service: ' + serviceName));
            }
        }

        return Promise.resolve(service);
    }
    
}