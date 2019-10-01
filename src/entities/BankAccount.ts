import { Money } from "../values/Money";
import { AccountID } from "../values/AccountID";

export interface BankAccount {

    getId(): AccountID;
    
    debit(money: Money): void;

    credit(money: Money): void;
    
}