import { AbstractEntity } from "./AbstractEntity";
import { BankAccount } from "../BankAccount";
import { AccountID } from "../../values/AccountID";
import { Money } from "../../values/Money";
import { Event } from "../../tech/Event";
import { AccountCreatedEvent } from "../../events/AccountCreatedEvent";
import { AccountDebitedEvent } from "../../events/AccountDebitedEvent";
import { AccountCreditedEvent } from "../../events/AccountCreditedEvent";
import { InsufficientFundsException } from "../../exceptions/InsufficientFundsException";
import { Snapshot } from "../../tech/Snapshot";

export class BankAccountImpl extends AbstractEntity implements BankAccount {
    private accountId?: AccountID;
    private balances: Map<string, number> = new Map();

    private setBalance(balance: number, currency: string) {
        const roundedBalance = Math.floor(balance * 100) / 100;
        this.balances.set(currency, roundedBalance);
    }

    private applyAccountCreatedEvent(event: Event) {
        this.accountId = new AccountID(event.getPayload()['id']);
    }

    private applyDebitEvent(event: Event) {
        const debitCurrency = event.getPayload()['debit']['currency'];
        const currentBalance = this.getBalance(debitCurrency);
        const newBalance = currentBalance - event.getPayload()['debit']['amount'];
        this.setBalance(newBalance, debitCurrency);
    }

    private applyCreditEvent(event: Event) {
        const creditCurrency = event.getPayload()['credit']['currency'];
        const currentBalance = this.getBalance(creditCurrency);
        const newBalance = currentBalance + event.getPayload()['credit']['amount'];
        this.setBalance(newBalance, creditCurrency);
    }

    protected applyEvent(event: Event): void {
        switch (event.getName()) {
            case AccountCreatedEvent.EventName:
                this.applyAccountCreatedEvent(event);
                break;

            case AccountDebitedEvent.EventName:
                this.applyDebitEvent(event);
                break;

            case AccountCreditedEvent.EventName:
                this.applyCreditEvent(event);
                break;
        }
    }

    protected applySnapshot(snapshot: Snapshot): void {
        
    }

    private hasEnoughBalance(requestedAmount: Money): boolean {
        return this.getBalance(requestedAmount.getCurrency()) >= requestedAmount.getAmount();
    }

    public initialize(id: AccountID): void {
        this.appendUncommittedEvent(new AccountCreatedEvent(id));
    }
    
    getId(): AccountID {
        return this.accountId!;
    }
    
    debit(amount: Money): void {
        if (!this.hasEnoughBalance(amount)) {
            throw new InsufficientFundsException();
        }

        this.appendUncommittedEvent(new AccountDebitedEvent(this.getId(), amount));
    }

    credit(amount: Money): void {
        this.appendUncommittedEvent(new AccountCreditedEvent(this.getId(), amount));
    }

    getBalance(currency: string): number {
        return this.balances.get(currency) || 0;
    }

    getSnapshot(): Snapshot {
        const balances: any[] = [];

        for (const currency of this.balances.keys()) {
            balances.push({amount: this.getBalance(currency), currency });
        }

        return {
            state: {
                id: this.getId().asString(),
                balances
            },

            lastEventId: this.getVersion(),
        };
    }

}