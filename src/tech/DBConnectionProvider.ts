import { Config } from "@darkbyte/ts-config";

export class DBConnectionProvider {
    private connection: any = undefined;

    constructor(private config: Config) {}

    private async buildConnection(): Promise<any> {
        return require('knex')({
            client: 'mysql',
            connection: {
              host : await this.config.get('DB_HOST', 'localhost'),
              user : await this.config.get('DB_USER', 'root'),
              password : await this.config.get('DB_PASS', 'root'),
              database : await this.config.get('DB_NAME', 'test')
            },
            pool: {min: 1, max: 5}
          });
    }

    async getDB(): Promise<any> {
        if (!this.connection) {
            this.connection = await this.buildConnection();
        }
        
        return this.connection;
    }

}