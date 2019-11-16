import { Event } from "./Event";
import { Consumer } from "../Conumer";

export type EventHandler = Consumer<Event>;
