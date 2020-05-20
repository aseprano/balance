import { Queryable } from "../../tech/db/Queryable";

export interface AccountProjection {

    createAccount(connection: Queryable, accountId: string, owner: string, creationDate: string): Promise<void>;

    deleteAll(connection: Queryable): Promise<void>;

}