import { Config } from "@darkbyte/ts-config";

export class ConfigLogger implements Config
{

    constructor(private innerConfig: Config, private logPrefix: string) {
        this.logPrefix = logPrefix || '[ConfigLogger]';
    }

    private logMessage(message: string) {
        console.log(this.logPrefix + message);
    }

    has(param: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
    get(param: string, default_value?: any): Promise<any> {
        this.logMessage(`» Getting param '${param}' with default=${default_value}`);

        return this.innerConfig.get(param, default_value)
            .then((value) => {
                this.logMessage(`« Returning ${value} for param '${param}'`);
                return value;
            });
    }

    
}