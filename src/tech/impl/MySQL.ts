import { DB } from "../DB";

export class MySQL implements DB {

    constructor(private pool: any) {}

    async beginTransaction(): Promise<void> {

    }

    async commit(): Promise<void> {

    }

    async rollback(): Promise<void> {

    }
    
    async insertIgnore(tableName: string, values: any): Promise<any> {
    }

    async insert(tableName: string, values: any, onDuplicateKey?: string): Promise<any> {
    }

    async update(table: string, values: any, condition: any): Promise<void> {
    }

    async select(columns: string[], source: string, condition?: any, orderBy?: string[], limit?: number, offset?: number): Promise<any[]> {
    }
    
}