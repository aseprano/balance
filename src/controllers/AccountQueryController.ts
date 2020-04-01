import { Queryable } from "../tech/db/Queryable";
import { Request } from "express";
import { ApiResponse } from "../tech/api/ApiResponse";
import { NotFoundApiResponse } from "../tech/api/NotFoundApiResponse";
import { MicroserviceApiResponse } from "./MicroserviceApiResponse";

function formatAccountBalance(rows: any[]): any {
    return {
        id: rows[0].id,
        balance: rows.map((row: any) => {
            return {
                amount: row.balance / 100,
                currency: row.currency
            }
        })
    };
}

/**
 * Expects an array of balances
 * @param fields 
 */
function formatMultipleRows(rows: any[]): any[] {
    const result: any[] = [];
    let currentAccountRows: any[] = [];
    let currentBalanceId = '';

    rows.forEach((currentRow) => {
        if (currentBalanceId !== currentRow.id) {
            if (currentAccountRows.length) {
                result.push(formatAccountBalance(currentAccountRows));
                currentAccountRows = [];
            }

            currentBalanceId = currentRow.id;
        }

        currentAccountRows.push(currentRow);
    });

    if (currentAccountRows) {
        result.push(formatAccountBalance(currentAccountRows));
    }

    return result;
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

    private getPageNumber(req: Request): number {
        return this.getNumericParam(req, 'page', 0);
    }

    private getPageSize(req: Request): number {
        return this.getNumericParam(req, 'pageSize', 10);
    }

    private loadAccounts(ids: string[]): any {
        const sql = `
        SELECT account_id AS id,
               currency,
               balance
        FROM balances
        WHERE account_id IN (?)
        ORDER BY account_id, currency`;

        return this.dbConn.query(sql, [ids])
            .then((ret) => formatMultipleRows(ret.fields));
    }

    /** PUBLIC APIs **/

    public getAccount(req: Request): Promise<ApiResponse> {
        const sql = `
        SELECT  account_id AS id,
                currency,
                balance
        FROM balances
        WHERE account_id = ?
        ORDER BY currency ASC`;

        return this.dbConn
            .query(sql, [req.params['id']])
            .then((ret) => {
                return ret.fields.length
                    ? new MicroserviceApiResponse(formatAccountBalance(ret.fields))
                    : new NotFoundApiResponse();
            });
    }

    public listAccounts(req: Request): Promise<ApiResponse> {
        const pageNumber = this.getPageNumber(req);
        const pageSize = this.getPageSize(req);

        const sql = `
        SELECT id
        FROM accounts
        ORDER BY id
        LIMIT ${pageSize*pageNumber}, ${pageSize}`;

        return this.dbConn
            .query(sql)
            .then((ret) => ret.fields.map((f) => f.id))
            .then((ids) => this.loadAccounts(ids))
            .then((data) => new MicroserviceApiResponse(data));
    }

}