import { MonthlyExpensesProjection } from "../MonthlyExpensesProjection";
import { Queryable } from "../../tech/db/Queryable";

export class DBMonthlyExpensesProjection implements MonthlyExpensesProjection
{

    addMonthlyExpense(
        connection: Queryable,
        accountId: string,
        month: string,
        amount: number,
        currency: string
    ): Promise<void> {
        amount = Math.floor(amount*100);

        return connection.query(
            `UPDATE monthly_expenses SET amount = amount + ? where account_id = ? and month = ? and currency = ?`,
            [amount, accountId, month, currency]
        ).then((ret) => {
            if (!ret.numberOfAffectedRows) {
                return connection.query(
                    `INSERT INTO monthly_expenses (account_id, month, currency, amount) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount = amount + ?`,
                    [accountId, month, currency, amount, amount]
                ).then(() => undefined);
            }
        });
    }

    clear(connection: Queryable) {
        return connection.query('TRUNCATE TABLE monthly_expenses').then(() => undefined);
    }
    
}