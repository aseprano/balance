import { BankService } from "../BankService";
import { Money } from "../../values/Money";
import { CurrencyNotAllowedException } from "../../exceptions/CurrencyNotAllowedException";

export class BankServiceImpl implements BankService {
    private allowedCurrencies: Set<string> = new Set();

    private currencyIsAllowed(currency: string): boolean {
        return this.allowedCurrencies.has(currency);
    }

    public setAllowedCurrencies(currencies: string[]): void {
        currencies.filter((c) => c.length)
            .map((c) => c.toUpperCase())
            .forEach((c) => this.allowedCurrencies.add(c));
    }

    emitMoney(amount: number, currency: string): Money {
        if (!this.currencyIsAllowed(currency)) {
            throw new CurrencyNotAllowedException();
        }

        return new Money(amount, currency);
    }

}