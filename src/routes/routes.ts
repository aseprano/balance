import { Router } from "../tech/Router";

module.exports = (router: Router) => {
    router
    .post(
        '/accounts',
        'AccountController', 'create'
    )
    .post(
        '/accounts/:id/transactions',
        'AccountController', 'addTransaction'
    )
    .get(
        '/accounts/:id',
        'AccountQueryController', 'getAccount'
    )
    .get(
        '/accounts',
        'AccountQueryController', 'listAccounts'
    );
}
