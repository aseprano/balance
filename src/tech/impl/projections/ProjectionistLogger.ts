import { Projectionist } from "../../projections/Projectionist";

export class ProjectionistLogger implements Projectionist {

    constructor(
        private projectionist: Projectionist,
        private prefix?: string
    ) {}

    private doLog(message: string) {
        //console.debug((this.prefix ? this.prefix + ' ' : '') + message);
    }

    replay(projectorId: string): Promise<void> {
        this.doLog(`Wanna replay projection '${projectorId}'`);

        return this.projectionist.replay(projectorId)
            .then(() => {
                this.doLog(`Replay requested for projection '${projectorId}'`);
            }).catch((e) => {
                this.doLog(`Replay request for projection '${projectorId}' has failed: ${e.message}`);
                return Promise.reject(e);
            });
    }
    
}