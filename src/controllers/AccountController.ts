import { AccountService } from "../domain/app-services/AccountService";
import { Request } from "express";
import { Money } from "../domain/values/Money";
import { AccountID } from "../domain/values/AccountID";
import { InvalidAccountIDException } from "../domain/exceptions/InvalidAccountIDException";
import { BankAccountNotFoundException } from "../domain/exceptions/BankAccountNotFoundException";
import { InsufficientFundsException } from "../domain/exceptions/InsufficientFundsException";
import { BadMoneyException } from "../domain/exceptions/BadMoneyException";
import { ApiResponse } from "../tech/api/ApiResponse";
import { MicroserviceApiResponse } from "./MicroserviceApiResponse";
import { MicroserviceApiError } from "./MicroserviceApiError";
import { NotFoundApiResponse } from "../tech/api/NotFoundApiResponse";
import { Transaction } from "../domain/values/Transaction";
import { inspect } from "util";
import { InvalidTransactionTypeException } from "../domain/exceptions/InvalidTransactionTypeException";

export class AccountController {

    constructor(private accountService: AccountService) {}

    async create(): Promise<ApiResponse> {
        return this.accountService
            .newAccount()
            .then((id) => new MicroserviceApiResponse({
                id: id.asString()
            })).catch((err) => {
                return err;
            });
    }

    async addTransaction(req: Request): Promise<ApiResponse> {
        try {
            const accountId = new AccountID(req.params.id);
            const transaction = new Transaction(req.body.type, new Money(req.body.amount, req.body.currency));

            if (transaction.isDebit()) {
                await this.accountService.debit(transaction.getAmount(), accountId);
            } else {
                await this.accountService.credit(transaction.getAmount(), accountId);
            }

            return new MicroserviceApiResponse();
        } catch (e) {
            if (e instanceof InvalidTransactionTypeException) {
                return new MicroserviceApiError(400, 1001, 'Invalid transaction type');
            } else if (e instanceof BadMoneyException) {
                return new MicroserviceApiError(400, 1002, 'Invalid amount');
            } else if (e instanceof BankAccountNotFoundException) {
                return new NotFoundApiResponse();
            } else if (e instanceof InsufficientFundsException) {
                return new MicroserviceApiError(409, 1003, 'Insufficient funds');
            } else {
                throw e;
            }
        }
    }
    
}