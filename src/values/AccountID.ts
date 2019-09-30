export class AccountID {

    constructor(private id: string) {
        if (!id.match(/^\d{11}$/)) {
            throw new Error('Invalid AccountID');
        }
    }

    asString(): string {
        return this.id;
    }

}