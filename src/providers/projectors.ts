import { ServiceContainer } from "../tech/impl/ServiceContainer";
import { Projector } from "../tech/projections/Projector";
import { BalancesProjector } from "../projectors/impl/BalancesProjector";
import { DBBalancesProjection } from "../projectors/impl/DBBalancesProjection";
import { MonthlyExpensesProjector } from "../projectors/impl/MonthlyExpensesProjector";
import { DBMonthlyExpensesProjection } from "../projectors/impl/DBMonthlyExpensesProjection";
import { TransactionProjector } from "../projectors/impl/TransactionProjector";
import { DBTransactionProjection } from "../projectors/impl/DBTransactionsProjection";

module.exports = async (serviceContainer: ServiceContainer): Promise<Projector[]> => {
    return [
        new BalancesProjector(new DBBalancesProjection()),
        new MonthlyExpensesProjector(new DBMonthlyExpensesProjection()),
        new TransactionProjector(new DBTransactionProjection()),
    ];
}
