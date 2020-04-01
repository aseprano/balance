import { CustomApiResponse } from "../tech/api/CustomApiResponse";

export class MicroserviceApiError extends CustomApiResponse {
    constructor(statusCode: number, errorCode: number, errorDescription?: any) {
        super(statusCode, {
            code: errorCode,
            description: errorDescription,
        });
    }
}