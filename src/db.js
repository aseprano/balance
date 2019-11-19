const QueryBuilder = require('node-querybuilder');

const db = new QueryBuilder(
    {
        host: 'localhost',
        user: 'root',
        password: 'test',
        database: 'balances'
    },
    'mysql',
    'pool'
);

db.get_connection((conn) => {
    console.log('Got connection');

    conn.set({balance: 'balance + 10'}, null, false)
        .where({account_id: '123', currency: 'USD'})
        .update(
            'balances',
            null,
            (err, resp) => {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    console.log(resp);
                }
            }
        );
});