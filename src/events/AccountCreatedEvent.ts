import { DomainEvent } from "./DomainEvent";
import { AccountID } from "../values/AccountID";

export class AccountCreatedEvent extends DomainEvent {
    public static get EventName(): string { return 'herrdoktor.microservices.balance.events.accountCreated' };

    constructor(id: AccountID) {
        super();

        this.setPayload({
            id: id.asString()
        });
    }

    public getName(): string {
        return AccountCreatedEvent.EventName;
    }

}