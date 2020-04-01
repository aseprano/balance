import { ServiceContainer } from "../tech/impl/ServiceContainer";
import { AccountController } from "../controllers/AccountController";
import { AccountQueryController } from "../controllers/AccountQueryController";
import { AccountService } from "../domain/app-services/AccountService";
import { BankService } from "../domain/app-services/BankService";

module.exports = (container: ServiceContainer) => {
    
    container.declare(
        'AccountController',
        async (container) => {
            const accountService: AccountService = await container.get('AccountService');
            const bank: BankService = await container.get('BankService');
            return new AccountController(accountService, bank);
        }
    ).declare(
        'AccountQueryController',
        (container) => {
            return container.get('DB')
                .then((db) => new AccountQueryController(db));
        }
    )
    
}