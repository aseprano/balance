import { ServiceContainer } from "../tech/impl/ServiceContainer";
import { Projector } from "../tech/projections/Projector";
import { BalancesProjector } from "../projectors/impl/BalancesProjector";
import { DBBalancesProjection } from "../projectors/impl/DBBalancesProjection";
import { MonthlyExpensesProjector } from "../projectors/impl/MonthlyExpensesProjector";
import { DBMonthlyExpensesProjection } from "../projectors/impl/DBMonthlyExpensesProjection";
import { TransactionProjector } from "../projectors/impl/TransactionProjector";
import { DBTransactionProjection } from "../projectors/impl/DBTransactionsProjection";
import { MoneyRoundService } from "../domain/domain-services/MoneyRoundService";

module.exports = async (serviceContainer: ServiceContainer): Promise<Projector[]> => {
    const roundService = new MoneyRoundService();

    return [
        new BalancesProjector(new DBBalancesProjection(roundService)),
        new MonthlyExpensesProjector(new DBMonthlyExpensesProjection()),
        new TransactionProjector(new DBTransactionProjection(), roundService),
    ];
}
