/**
 * A Projectionist replays all the events required by a Projector.
 */
export interface Projectionist {

    replay(projectorId: string): Promise<void>;

}
