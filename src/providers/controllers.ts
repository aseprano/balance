import { ServiceContainer } from "../tech/impl/ServiceContainer";
import { AccountController } from "../controllers/AccountController";

module.exports = (container: ServiceContainer) => {
    
    container.declare(
        'AccountController',
        (container) => container.get('AccountService')
            .then((accountService) => new AccountController(accountService))
    );
    
}