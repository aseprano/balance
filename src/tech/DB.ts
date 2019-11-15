export interface DB {

    insert(table: string, values: any, onDuplicate?: string): Promise<void>;

    insertIgnore(table: string, values: any): Promise<void>;

    update(table: string, values: any, condition: any): Promise<void>;
    
}