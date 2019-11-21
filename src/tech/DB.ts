export interface DB {

    insert(table: string, values: any, onDuplicate?: string): Promise<any>;

    insertIgnore(table: string, values: any): Promise<any>;

    update(table: string, values: any, condition: any): Promise<any>;
    
    select(columns: string[], from: string, condition: any): Promise<any[]>;

}