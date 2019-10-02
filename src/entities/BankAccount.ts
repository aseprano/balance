import { Money } from "../values/Money";
import { AccountID } from "../values/AccountID";
import { Entity } from "./Entity";

export interface BankAccount extends Entity {

    getId(): AccountID;
    
    debit(money: Money): void;

    credit(money: Money): void;
    
}