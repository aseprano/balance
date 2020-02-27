import { DomainEvent } from "./DomainEvent";
import { AccountID } from "../values/AccountID";
import { Money } from "../values/Money";

export class AccountDebitedEvent extends DomainEvent {
    public static get EventName(): string { return 'herrdoktor.microservices.balance.events.accountDebited' };

    constructor(accountId: AccountID, debit: Money) {
        super();
        
        this.setPayload({
            id: accountId.asString(),
            debit: {
                amount: debit.getAmount(),
                currency: debit.getCurrency()
            }
        });
    }

    public getName(): string {
        return AccountDebitedEvent.EventName;
    }

}