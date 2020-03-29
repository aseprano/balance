import { IncomingEvent } from "../impl/events/IncomingEvent";
import { Function } from "../../lib/Function";

export type EventHandler = Function<IncomingEvent, Promise<void>>;
