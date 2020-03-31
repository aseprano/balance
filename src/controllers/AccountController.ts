import { AccountService } from "../domain/app-services/AccountService";
import { Request } from "express";
import { Money } from "../domain/values/Money";
import { AccountID } from "../domain/values/AccountID";
import { InvalidAccountIDException } from "../domain/exceptions/InvalidAccountIDException";
import { BankAccountNotFoundException } from "../domain/exceptions/BankAccountNotFoundException";
import { InsufficientFundsException } from "../domain/exceptions/InsufficientFundsException";
import { ControllerResult, success, error } from "../tech/ControllerResult";
import { BadMoneyException } from "../domain/exceptions/BadMoneyException";

export class AccountController {

    constructor(private accountService: AccountService) {}

    async create(): Promise<ControllerResult> {
        return this.accountService
            .newAccount()
            .then((id) => success({
                id: id.asString()
            }))
            .catch((err) => {
                return err;
            });
    }

    async debit(req: Request): Promise<ControllerResult> {
        try {
            const accountId = new AccountID(req.params.id);
            const amount = new Money(req.body.amount, req.body.currency);
            await this.accountService.debit(amount, accountId);
            return success();
        } catch(e) {
            if (e instanceof InvalidAccountIDException) {
                return error(400, 'Invalid account id', 1001);
            } else if (e instanceof BadMoneyException) {
                return error(400, 'Invalid amount', 1004);
            } else if (e instanceof BankAccountNotFoundException) {
                return error(404, 'Account not found', 1002);
            } else if (e instanceof InsufficientFundsException) {
                return error(409, 'Insufficient funds', 1003);
            } else {
                throw e;
            }
        }
    }

    async credit(req: Request): Promise<ControllerResult> {
        try {
            const accountId = new AccountID(req.params.id);
            const amount = new Money(req.body.amount, req.body.currency);
            await this.accountService.credit(amount, accountId);
            return success();
        } catch(e) {
            if (e instanceof InvalidAccountIDException) {
                return error(400, 'Invalid account id', 1001);
            } else if (e instanceof BadMoneyException) {
                return error(400, 'Invalid amount', 1003);
            } else if (e instanceof BankAccountNotFoundException) {
                return error(404, 'Account not found', 1002);
            } else {
                throw e;
            }
        }
    }
    
}