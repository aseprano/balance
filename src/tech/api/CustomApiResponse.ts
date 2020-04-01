import { ApiResponse } from "./ApiResponse";

export class CustomApiResponse implements ApiResponse {

    constructor(
        private statusCode: number,
        private body?: any,
        private statusMessage = ""
    ) {
        this.statusCode = Math.min(500, Math.max(statusCode, 100));
    }

    public getStatusCode(): number { return this.statusCode; }
    public getStatusMessage(): string { return this.statusMessage; }
    public getBody(): string|undefined { return this.body; }

}