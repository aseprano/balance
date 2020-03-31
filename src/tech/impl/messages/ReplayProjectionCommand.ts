import { Message } from "@darkbyte/messaging";
import { Commands } from "../../../domain/Commands";
import { Projector } from "../../projections/Projector";

export function ReplayProjectionCommand(projector: Projector): Message {
    return {
        name: Commands.REPLAY_PROJECTION,
        data: JSON.stringify(projector.getEventsOfInterest())
    };
}