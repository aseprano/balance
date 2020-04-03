import { MonthlyExpensesProjection } from "../MonthlyExpensesProjection";
import { Queryable } from "../../../tech/db/Queryable";

export class DBMonthlyExpensesProjection implements MonthlyExpensesProjection
{

    addMonthlyExpense(
        connection: Queryable,
        accountId: string,
        month: string,
        amount: number,
        currency: string
    ): Promise<void> {
        return connection.query(
            `UPDATE monthly_expenses SET amount = amount + :amount WHERE account_id = :accountId AND currency = :currency AND month = :month`,
            {
                amount,
                accountId,
                currency,
                month
            }
        ).then((ret) => {
            if (!ret.numberOfAffectedRows) {
                return connection.query(
                    `INSERT INTO monthly_expenses (account_id, month, currency, amount) VALUES (:accountId, :month, :currency, :amount) ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount)`,
                    {
                        accountId,
                        month,
                        currency,
                        amount
                    }
                ).then(() => undefined);
            }
        });
    }

    clear(connection: Queryable) {
        return connection.query('TRUNCATE TABLE monthly_expenses').then(() => undefined);
    }
    
}
