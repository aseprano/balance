import { ProjectorRegistrationService } from "../app-services/ProjectorRegistrationService";
import { BalancesProjector } from "../projectors/BalancesProjector";
import { DBBalancesProjection } from "../projectors/impl/DBBalancesProjection";
import { ServiceContainer } from "../tech/ServiceContainer";

module.exports = (projectors: ProjectorRegistrationService, serviceContainer: ServiceContainer) => {
    serviceContainer.get('DB')
        .then((db) => {
            projectors.register(new BalancesProjector(new DBBalancesProjection(db)));
        });
}
