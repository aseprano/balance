import { Transactionable } from "./Transactionable";

export interface DB extends Transactionable {
    
    insert(table: string, values: any, onDuplicate?: string): Promise<any>;

    insertIgnore(table: string, values: any): Promise<any>;

    update(table: string, values: any, condition: any): Promise<any>;
    
    select(columns: string[], from: string, condition?: any, orderBy?: string[], limit?: number, offset?: number): Promise<any[]>;

}