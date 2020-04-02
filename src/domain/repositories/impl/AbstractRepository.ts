import { Entity } from "../../entities/Entity";
import { Snapshot } from "../../../tech/Snapshot";
import { EventStream } from "../../../tech/events/EventStream";
import { EventStore } from "../../../tech/events/EventStore";
import { SnapshotRepository } from "../../../tech/SnapshotRepository";

export interface EntityStream {
    snapshot?: Snapshot;
    stream: EventStream;
}

export abstract class AbstractRepository {

    constructor(private eventStore: EventStore, private snapshotRepo: SnapshotRepository) {}

    private shouldTakeSnapshot(entity: Entity): boolean {
        return this.snapshotInterval() > 0 && (entity.getVersion() % this.snapshotInterval()) === 0
    }

    protected async getEventsForId(id: any): Promise<EntityStream> {
        const streamId = this.streamNameForId(id);
        const snapshot = await this.snapshotRepo.getById(streamId);
        const events = await this.eventStore.readStreamOffset(streamId, snapshot ? snapshot.version : 0);

        return {
            snapshot,
            stream: events
        }
    }

    protected async saveEntity(entity: Entity): Promise<void> {
        const streamId = this.streamNameForId(entity.getId());

        if (entity.getVersion() === 0) {
            const restoredVersion = entity.getVersion();
            const eventsToCommit = entity.commitEvents();
    
            return this.eventStore
                .appendToStream(streamId, eventsToCommit, restoredVersion)
                .then(() => {
                    if (this.shouldTakeSnapshot(entity)) {
                        return this.snapshotRepo.add(streamId, entity.getSnapshot());
                    }
                });
        } else {
            return this.eventStore
                .createStream(streamId, entity.commitEvents());
        }
    }

    protected async deleteEntity(entity: Entity): Promise<void> {

    }

    protected abstract streamNameForId(id: any): string;

    protected abstract snapshotInterval(): number;

}