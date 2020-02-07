import { Queryable } from "./Queryable";

export interface DBTransaction extends Queryable {

    commit(): Promise<void>;

    rollback(): Promise<void>;

}
