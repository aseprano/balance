import { ServiceContainer } from "../tech/ServiceContainer";
import { AccountController } from "../controllers/AccountController";

module.exports = (container: ServiceContainer) => {
    
    container.declare(
        'AccountController',
        (container) => new AccountController(container.get('AccountService'))
    );
    
}