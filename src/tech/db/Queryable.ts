export interface QueryResult {
    fields: any[];
    lastInsertId?: number;
    numberOfAffectedRows: number;
}

export interface Queryable {
    
    query(query: string, params?: any[]): Promise<QueryResult>;

}