import { ServiceContainer } from "../tech/impl/ServiceContainer";
import { Projector } from "../tech/projections/Projector";
import { BalancesProjector } from "../projectors/impl/BalancesProjector";
import { DBBalancesProjection } from "../projectors/impl/DBBalancesProjection";
import { MonthlyExpensesProjector } from "../projectors/impl/MonthlyExpensesProjector";
import { DBMonthlyExpensesProjection } from "../projectors/impl/DBMonthlyExpensesProjection";

module.exports = async (serviceContainer: ServiceContainer): Promise<Projector[]> => {
    return [
        new BalancesProjector(new DBBalancesProjection()),
        new MonthlyExpensesProjector(new DBMonthlyExpensesProjection()),
    ];
}
