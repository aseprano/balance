import { ProjectorRegistrationService } from "../app-services/ProjectorRegistrationService";
import { BalancesProjector } from "../projectors/BalancesProjector";
import { DBBalancesProjection } from "../projectors/impl/DBBalancesProjection";
import { ServiceContainer } from "../tech/ServiceContainer";

module.exports = (projectors: ProjectorRegistrationService, serviceContainer: ServiceContainer) => {
    const db = serviceContainer.get('DB');
    
    projectors.register(new BalancesProjector(new DBBalancesProjection(db)));
}
