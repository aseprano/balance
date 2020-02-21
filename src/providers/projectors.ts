import { ServiceContainer } from "../tech/ServiceContainer";
import { Projector } from "../tech/projections/Projector";
import { BalancesProjector } from "../projectors/BalancesProjector";
import { DBBalancesProjection } from "../projectors/impl/DBBalancesProjection";
import { MonthlyExpensesProjector } from "../projectors/MonthlyExpensesProjector";
import { DBMonthlyExpensesProjection } from "../projectors/impl/DBMonthlyExpensesProjection";

module.exports = async (serviceContainer: ServiceContainer): Promise<Projector[]> => {
    return [
        new BalancesProjector(new DBBalancesProjection()),
        new MonthlyExpensesProjector(new DBMonthlyExpensesProjection()),
    ];
}
