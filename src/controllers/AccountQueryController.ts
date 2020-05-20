import { Queryable } from "../tech/db/Queryable";
import { Request } from "express";
import { ApiResponse } from "../tech/api/ApiResponse";
import { NotFoundApiResponse } from "../tech/api/NotFoundApiResponse";
import { MicroserviceApiResponse } from "./MicroserviceApiResponse";

function formatAccountBalance(rows: any[]): any {
    return {
        id: rows[0].id,
        owner: rows[0].owner,
        created_at: rows[0].created_at,
        balance: rows.map((row: any) => {
            return {
                amount: row.balance / 100,
                currency: row.currency
            }
        }),
    };
}

export class AccountQueryController {

    constructor(private dbConn: Queryable) {}

    private getParam(req: Request, paramName: string, defaultValue: any = undefined): any {
        const paramValue = req.query[paramName];
        return typeof paramValue !== "undefined" ? paramValue : defaultValue;
    }

    private getNumericParam(req: Request, paramName: string, defaultValue: number): number {
        const paramValue = this.getParam(req, paramName);

        if (!paramValue || typeof paramValue === 'string' && !paramValue.match(/^\d+$/)) {
            return defaultValue;
        }

        return parseInt(paramValue);
    }

    private getPageNumber(req: Request, defaultValue = 0): number {
        return this.getNumericParam(req, 'page', defaultValue);
    }

    private getPageSize(req: Request, defaultValue = 10): number {
        return this.getNumericParam(req, 'page_size', defaultValue);
    }

    /** PUBLIC APIs **/

    public async getAccount(req: Request): Promise<ApiResponse> {
        const sql = `
        SELECT  id,
                owner,
                created_at,
                currency,
                balance
        FROM balances INNER JOIN accounts
        ON balances.account_id = accounts.id
        WHERE id = :id
        ORDER BY currency ASC`;

        return this.dbConn
            .query(sql, { id: req.params['id'] })
            .then((ret) => {
                return ret.fields.length
                    ? new MicroserviceApiResponse(formatAccountBalance(ret.fields))
                    : new NotFoundApiResponse();
            });
    }

    public async listAccounts(req: Request): Promise<ApiResponse> {
        const pageNumber = this.getPageNumber(req);
        const pageSize = this.getPageSize(req);

        const sql = `
        SELECT id, owner, created_at
        FROM accounts
        ORDER BY id
        LIMIT ${pageSize*pageNumber}, ${pageSize}`;

        return this.dbConn
            .query(sql)
            .then((ret) => ret.fields)
            .then((rows) => new MicroserviceApiResponse(rows));
    }

    public async listAccountTransactions(req: Request): Promise<ApiResponse> {
        const pageNumber = this.getPageNumber(req);
        const pageSize = this.getPageSize(req);

        const sql = `
        SELECT type, amount/100 AS amount, currency, date
        FROM transactions
        WHERE account_id = :accountId
        ORDER BY id DESC
        LIMIT ${pageSize*pageNumber}, ${pageSize}`;

        return this.dbConn
            .query(sql, { accountId: req.params['id']})
            .then((ret) => ret.fields)
            .then((data) => new MicroserviceApiResponse(data));
    }
    
    public async listAccountMonthlyExpenses(req: Request): Promise<ApiResponse> {
        const accountId = req.params['id'];
        const year = req.params['year'];

        const sql = `
        SELECT month, amount/100 AS amount, currency
        FROM monthly_expenses
        WHERE account_id = :accountId
        AND month BETWEEN :fromMonth AND :toMonth
        ORDER BY month ASC`;

        return this.dbConn
            .query(sql, { accountId: accountId, fromMonth: `${year}-01`, toMonth: `${year}-12`})
            .then((ret) => ret.fields)
            .then((data) => new MicroserviceApiResponse(data));
    }

}