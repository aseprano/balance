import { AccountProjection } from "../AccountsProjection";
import { Queryable } from "../../../tech/db/Queryable";

export class DBAccountProjection implements AccountProjection {

    public async createAccount(
        connection: Queryable,
        accountId: string,
        owner: string,
        creationDate: string
    ): Promise<void> {
        return connection.query(
            "INSERT INTO accounts (id, owner, created_at) VALUES (:accountId, :owner, :creationDate)",
            {
                accountId,
                owner,
                creationDate
            }
        ).then(() => undefined);
    }
    
    public async deleteAll(connection: Queryable): Promise<void> {
        return connection.query("DELETE FROM accounts").then(() => undefined);
    }

}
