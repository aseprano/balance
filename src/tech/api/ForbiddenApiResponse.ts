import { CustomApiResponse } from "./CustomApiResponse";

export class ForbiddenApiResponse extends CustomApiResponse {

    constructor(body?: any) {
        super(403, body);
    }

}
