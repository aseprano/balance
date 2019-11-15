import { DB } from "../DB";

export class MySQL implements DB {

    constructor(private pool: any) {}

    async insertIgnore(tableName: string, values: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pool.get_connection((conn: any) => {
                conn.insert(
                    tableName,
                    values,
                    (err: any, res: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res);
                        }
                    },
                    true
                )
            });
        });
    }

    async insert(tableName: string, values: any, onDuplicateKey?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pool.get_connection((conn: any) => {
                conn.insert(
                    tableName,
                    values,
                    (err: any, res: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res);
                        }
                    },
                    false,
                    onDuplicateKey ? `ON DUPLICATE KEY UPDATE ${onDuplicateKey}` : '',
                )
            });
        });
    }

    update(table: string, values: any, condition: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
}