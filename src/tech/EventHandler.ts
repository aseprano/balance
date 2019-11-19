import { Consumer } from "../Conumer";
import { IncomingEvent } from "./impl/IncomingEvent";

export type EventHandler = Consumer<IncomingEvent>;
