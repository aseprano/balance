import { Queryable } from "../tech/db/Queryable";

export interface MonthlyExpensesProjection {

    addMonthlyExpense(
        connection: Queryable,
        accountId: string,
        month: string, // yyyy-mm
        amount: number,
        currency: string
    ): Promise<void>;

}