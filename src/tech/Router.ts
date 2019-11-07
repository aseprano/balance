export interface Router {
    
    get(path: string, serviceName: string, serviceMethod?: string): Router;
    post(path: string, serviceName: string, serviceMethod?: string): Router;
    put(path: string, serviceName: string, serviceMethod?: string): Router;
    delete(path: string, serviceName: string, serviceMethod?: string): Router;
    
}