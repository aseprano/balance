import { Router } from "../tech/Router";

module.exports = (router: Router) => {
    router.post(
        '/accounts',
        'AccountController', 'create'
    ).post(
        '/accounts/:id/debits',
        'AccountController', 'debit'
    ).post(
        '/accounts/:id/credits',
        'AccountController', 'credit'
    ).get(
        '/accounts/:id',
        'AccountQueryController', 'getAccount'
    ).get(
        '/accounts',
        'AccountQueryController', 'listAccounts'
    );
}
