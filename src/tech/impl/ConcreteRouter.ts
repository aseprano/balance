import { Router } from "../Router";
import { Express, Request, Response } from "express";
import { ServiceContainer } from "./ServiceContainer";
import { NextFunction } from "connect";
import { ControllerResult } from "../ControllerResult";
import { ApiResponse } from "../api/ApiResponse";

interface RouterMapping {
    serviceName: string;
    serviceMethod?: string;
}

export class ConcreteRouter implements Router {

    constructor(
        private expressRouter: Express,
        private serviceContainer: ServiceContainer
    ) { }
    
    private async handle(req: Request, res: Response, next: NextFunction, mapping: RouterMapping) {
        const methodName = mapping.serviceMethod || 'run';

        try {
            const service: any = await this.serviceContainer.get(mapping.serviceName);
            const ret: ApiResponse = await service[methodName](req);
            res.status(ret.getStatusCode());

            if (ret.getStatusMessage()) {
                res.statusMessage = ret.getStatusMessage();
            }
            
            const responseBody = ret.getBody();

            if (typeof responseBody === "object") {
                res.json(responseBody);
            } else {
                res.end();
            }
        } catch (e) {
            console.log('*** Exception caught: ' + e.message);
            res.status(500).send('Internal server error');
        }
    }

    get(path: string, serviceName: string, serviceMethod?: string): Router {
        this.expressRouter.get(path, (req, res, next) => {
            this.handle(req, res, next, {serviceName, serviceMethod});
        });

        return this;
    }

    post(path: string, serviceName: string, serviceMethod?: string | undefined): Router {
        this.expressRouter.post(path, async (req, res, next) => {
            await this.handle(req, res, next, {serviceName, serviceMethod});
        });

        return this;
    }

    put(path: string, serviceName: string, serviceMethod?: string | undefined): Router {
        this.expressRouter.put(path, async (req, res, next) => {
            await this.handle(req, res, next, {serviceName, serviceMethod});
        });

        return this;
    }

    delete(path: string, serviceName: string, serviceMethod?: string | undefined): Router {
        this.expressRouter.delete(path, async (req, res, next) => {
            await this.handle(req, res, next, {serviceName, serviceMethod});
        });

        return this;
    }
    
}