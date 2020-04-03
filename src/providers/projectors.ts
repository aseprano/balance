import { ServiceContainer } from "../tech/impl/ServiceContainer";
import { Projector } from "../tech/projections/Projector";
import { BalancesProjector } from "../projectors/BalancesProjector";
import { DBBalancesProjection } from "../projectors/projections/impl/DBBalancesProjection";
import { MonthlyExpensesProjector } from "../projectors/MonthlyExpensesProjector";
import { DBMonthlyExpensesProjection } from "../projectors/projections/impl/DBMonthlyExpensesProjection";
import { TransactionsProjector } from "../projectors/TransactionsProjector";
import { DBTransactionProjection } from "../projectors/projections/impl/DBTransactionsProjection";
import { MoneyRoundingService } from "../domain/domain-services/MoneyRoundingService";

module.exports = async (serviceContainer: ServiceContainer): Promise<Projector[]> => {
    const roundService = new MoneyRoundingService();

    return [
        new BalancesProjector(new DBBalancesProjection(), roundService),
        new MonthlyExpensesProjector(new DBMonthlyExpensesProjection()),
        new TransactionsProjector(new DBTransactionProjection(), roundService),
    ];
}
