import { Consumer } from "../../lib/Conumer";
import { IncomingEvent } from "../impl/IncomingEvent";

export type EventHandler = Consumer<IncomingEvent>;
