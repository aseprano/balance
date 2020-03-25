import { Projectionist } from "../../projections/Projectionist";
import { MessageSender } from "../../messaging/MessageSender";
import { ReplayProjectionCommand } from "../messages/ReplayProjectionCommand";
import { ProjectorRegistrationService } from "../../../domain/app-services/ProjectorRegistrationService";
import { Message } from "../../messaging/Message";
import { DB } from "../../db/DB";

export class ProjectionistProxy implements Projectionist {

    constructor(
        private messageSender: MessageSender,
        private projectors: ProjectorRegistrationService,
        private db: DB
    ) { }

    async replay(projectorId: string): Promise<void> {
        try {
            const projector = this.projectors.getById(projectorId);

            return this.db
                .beginTransaction()
                .then((tx) => {
                    return projector.clear(tx)
                        .then(() => tx.commit());
                }).then(() => {
                    const replayMessage: Message = ReplayProjectionCommand(projector);
                    const subscriptionId = projector.getId();
                    
                    return this.messageSender.send(replayMessage, subscriptionId);
                });
        } catch (error) {
            return Promise.reject(error);
        }
    }

}