export class ControllerResult {
    
    static error(statusCode: number, message: string, errorCode: number): ControllerResult {
        const data: {
            [key: string]: any
        } = {
            message
        };

        if (errorCode) {
            data['code'] = errorCode;
        }

        return new ControllerResult(statusCode, data);
    }

    static success(data: any = '', statusCode: number = 200): ControllerResult {
        return new ControllerResult(statusCode, data);
    }

    private constructor(private statusCode: number, private data: any) {

    }

    getStatusCode(): number {
        return this.statusCode;
    }
    
    getData(): any {
        return this.data;
    }

}

export function success(data: any = '', statusCode: number = 200): ControllerResult {
    return ControllerResult.success(data, statusCode);
}

export function error(statusCode: number, message: string, errorCode: number = 0): ControllerResult {
    return ControllerResult.error(statusCode, message, errorCode);
}
