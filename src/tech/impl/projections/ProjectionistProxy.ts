import { Projectionist } from "../../projections/Projectionist";
import { MessageSender } from "../../messaging/MessageSender";
import { ReplayProjectionCommand } from "../messages/ReplayProjectionCommand";
import { ProjectorRegistrationService } from "../../../domain/app-services/ProjectorRegistrationService";
import { Message } from "../../messaging/Message";

export class ProjectionistProxy implements Projectionist {

    constructor(
        private messageSender: MessageSender,
        private projectors: ProjectorRegistrationService
    ) { }

    async replay(projectorId: string): Promise<void> {
        try {
            const projector = this.projectors.getById(projectorId);
            const replayMessage: Message = ReplayProjectionCommand(projector);
            const subscriptionId = projector.getId();

            return this.messageSender.send(replayMessage, subscriptionId);
        } catch (error) {
            return Promise.reject(error);
        }
    }

}