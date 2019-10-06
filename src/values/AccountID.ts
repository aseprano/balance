import { InvalidAccountIDException } from "../exceptions/InvalidAccountIDException";

export class AccountID {

    constructor(private id: string) {
        if (!id.match(/^\d{11}$/)) {
            throw new InvalidAccountIDException();
        }
    }

    asString(): string {
        return this.id;
    }

}