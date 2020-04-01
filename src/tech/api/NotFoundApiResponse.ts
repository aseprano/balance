import { CustomApiResponse } from "./CustomApiResponse";

export class NotFoundApiResponse extends CustomApiResponse {

    constructor(statusMessage?: string, body?: any) {
        super(404, body);
    }
    
}