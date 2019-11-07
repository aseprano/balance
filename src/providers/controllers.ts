import { ServiceContainer } from "../tech/ServiceContainer";
import { AccountController } from "../controllers/AccountController";

module.exports = (container: ServiceContainer) => {
    
    container.declare('AccountController', (c) => {
        return new AccountController(c.get('AccountService'));
    });
    
}