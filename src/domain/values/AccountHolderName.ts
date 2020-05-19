import { InvalidAccountHolderNameException } from "../exceptions/InvalidAccountHolderNameException";

export class AccountHolderName {

    constructor(private name?: string) {
        if (typeof name !== "string" || !name.match(/^[A-Z][A-Za-z]*(?:(?:[ ]|['\-]|[,.][ ])[A-Z][A-Za-z]*)*$/)) {
            throw new InvalidAccountHolderNameException();
        }
    }

    public asString(): string {
        return this.name as string;
    }

}