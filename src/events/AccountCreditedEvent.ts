import { DomainEvent } from "./DomainEvent";
import { AccountID } from "../values/AccountID";
import { Money } from "../values/Money";

export class AccountCreditedEvent extends DomainEvent {
    public static get EventName(): string { return 'herrdoktor.microservices.balance.events.accountCredited' };

    constructor(accountId: AccountID, amount: Money) {
        super();

        this.setPayload({
            id: accountId.asString(),
            credit: {
                amount: amount.getAmount(),
                currency: amount.getCurrency()
            }
        });
    }

    public getName(): string {
        return AccountCreditedEvent.EventName;
    }

}