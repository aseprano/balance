import { DomainEvent } from "./DomainEvent";
import { AccountID } from "../values/AccountID";
import { AccountHolderName } from "../values/AccountHolderName";

export class AccountCreatedEvent extends DomainEvent {
    public static get EventName(): string { return 'herrdoktor.microservices.balance.events.accountCreated' };

    constructor(id: AccountID, owner: AccountHolderName) {
        super();

        this.setPayload({
            id: id.asString(),
            owner: owner.asString(),
        });
    }

    public getName(): string {
        return AccountCreatedEvent.EventName;
    }

}