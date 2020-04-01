import { Money } from "../values/Money";

export interface BankService {

    /**
     * Emits a monetary value, or throws an exception if such currency is not supported
     * 
     * @param amount 
     * @param currency 
     */
    emitMoney(amount: number, currency: string): Money;

}