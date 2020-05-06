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
        '/accounts',
        'AccountQueryController', 'listAccounts'
    )
    .get(
        '/accounts/:id',
        'AccountQueryController', 'getAccount'
    )
    .get(
        '/accounts/:id/transactions',
        'AccountQueryController', 'listAccountTransactions'
    )
    .get(
        '/accounts/:id/monthly_expenses/:year(\\d{4})',
        'AccountQueryController', 'listAccountMonthlyExpenses'
    );
}
