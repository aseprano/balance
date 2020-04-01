import { CustomApiResponse } from "../tech/api/CustomApiResponse";

export class MicroserviceApiResponse extends CustomApiResponse {

    constructor(body?: any) {
        super(200, body);
    }

}