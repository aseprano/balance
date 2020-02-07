import { DBTransaction } from "./DBTransaction";
import { Queryable } from "./Queryable";

export interface DB extends Queryable {
    
    beginTransaction(): Promise<DBTransaction>;

}