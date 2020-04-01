import { Money } from "./Money";
import { InvalidTransactionTypeException } from "../exceptions/InvalidTransactionTypeException";

export class Transaction {
    
    constructor(private type: string, private amount: Money) {
        if (type !== "debit" && type !== "credit") {
            throw new InvalidTransactionTypeException();
        }
    }

    getType(): string {
        return this.type;
    }

    getAmount(): Money {
        return this.amount;
    }

    isDebit(): boolean {
        return this.type === "debit";
    }

}