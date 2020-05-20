import { ServiceContainer } from "../tech/impl/ServiceContainer";
import { Projector } from "../tech/projections/Projector";
import { BalancesProjector } from "../projectors/BalancesProjector";
import { DBBalancesProjection } from "../projectors/projections/impl/DBBalancesProjection";
import { MoneyRoundingService } from "../domain/domain-services/MoneyRoundingService";
import { AccountsProjector } from "../projectors/AccountsProjector";
import { DBAccountProjection } from "../projectors/projections/impl/DBAccountProjection";

module.exports = async (serviceContainer: ServiceContainer): Promise<Projector[]> => {
    const roundService = new MoneyRoundingService();

    return [
        new AccountsProjector(new DBAccountProjection()),
        new BalancesProjector(new DBBalancesProjection(), roundService),
        //new MonthlyExpensesProjector(new DBMonthlyExpensesProjection(), roundService),
        //new TransactionsProjector(new DBTransactionProjection(), roundService),
    ];
}
