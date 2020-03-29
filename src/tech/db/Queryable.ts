export interface QueryResult {
    fields: any[];
    lastInsertId?: number;
    numberOfAffectedRows: number;
}

export interface Queryable {
    
    query(query: string, params?: any[], transactionId?: string): Promise<QueryResult>;

}