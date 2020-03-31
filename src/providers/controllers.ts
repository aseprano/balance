import { ServiceContainer } from "../tech/impl/ServiceContainer";
import { AccountController } from "../controllers/AccountController";
import { AccountQueryController } from "../controllers/AccountQueryController";

module.exports = (container: ServiceContainer) => {
    
    container.declare(
        'AccountController',
        (container) => container.get('AccountService')
            .then((accountService) => new AccountController(accountService))
    ).declare(
        'AccountQueryController',
        (container) => {
            return container.get('DB')
                .then((db) => new AccountQueryController(db));
        }
    )
    
}