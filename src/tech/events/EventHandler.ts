import { Consumer } from "../../lib/Conumer";
import { IncomingEvent } from "../impl/events/IncomingEvent";

export type EventHandler = Consumer<IncomingEvent>;
