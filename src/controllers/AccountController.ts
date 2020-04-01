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

    async debit(req: Request): Promise<ApiResponse> {
        try {
            const accountId = new AccountID(req.params.id);
            const amount = new Money(req.body.amount, req.body.currency);
            await this.accountService.debit(amount, accountId);
            return new MicroserviceApiResponse();
        } catch(e) {
            if (e instanceof InvalidAccountIDException) {
                return new MicroserviceApiError(400, 1001, 'Invalid account id');
            } else if (e instanceof BadMoneyException) {
                return new MicroserviceApiError(400, 1004, 'Invalid amount');
            } else if (e instanceof BankAccountNotFoundException) {
                return new NotFoundApiResponse();
            } else if (e instanceof InsufficientFundsException) {
                return new MicroserviceApiError(409, 1003, 'Insufficient funds');
            } else {
                throw e;
            }
        }
    }

    async credit(req: Request): Promise<ApiResponse> {
        try {
            const accountId = new AccountID(req.params.id);
            const amount = new Money(req.body.amount, req.body.currency);
            await this.accountService.credit(amount, accountId);
            return new MicroserviceApiResponse();
        } catch(e) {
            if (e instanceof InvalidAccountIDException) {
                return new MicroserviceApiError(400, 1001, 'Invalid account id');
            } else if (e instanceof BadMoneyException) {
                return new MicroserviceApiError(400, 1003, 'Invalid amount');
            } else if (e instanceof BankAccountNotFoundException) {
                return new NotFoundApiResponse();
            } else {
                throw e;
            }
        }
    }
    
}