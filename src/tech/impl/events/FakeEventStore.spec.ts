import { FakeEventStore } from "./FakeEventStore";
import { EventStream } from "../../events/EventStream";
import { CustomEvent } from "./CustomEvent";
import { StreamNotFoundException } from "../../exceptions/StreamNotFoundException";
import { StreamAlreadyExistingException } from "../../exceptions/StreamAlreadyExistingException";
import { StreamConcurrencyException } from "../../exceptions/StreamConcurrencyException";

describe('FakeEventStore', () => {

    it('starts without streams', () => {
        const fakeStore = new FakeEventStore();
        expect(fakeStore.getAllStreamsIds()).toEqual([]);
    });

    it('adds a new stream when it does not exist', async () => {
        const fakeStore = new FakeEventStore();
        
        fakeStore.createStream(
            "foo-123",
            [
                new CustomEvent('fake-event-1'),
            ]
        );

        const storedStream: EventStream = await fakeStore.readStream('foo-123');
        expect(storedStream.version).toBe(1);
        expect(storedStream.events).toEqual([
            new CustomEvent('fake-event-1')
        ]);
    });

    it('does not create a stream with an already existing id', async (done) => {
        const fakeStore = new FakeEventStore();
        await fakeStore.createStream('foo-123', []);

        fakeStore.createStream('foo-123', [])
            .catch((error) => {
                expect(error instanceof StreamAlreadyExistingException).toBeTruthy();
                done();
            });
    });

    it('does not append events to a non-existing stream', (done) => {
        const fakeStore = new FakeEventStore();
        fakeStore.appendToStream('foo-123', [], 1)
            .catch((error) => {
                expect(error instanceof StreamNotFoundException).toBeTruthy();
                done();
            });
    });

    it('does not append events to a stream if the expected version does not match', (done) => {
        const fakeStore = new FakeEventStore();
        fakeStore.createStream('foo-123', []); // version set to 1
        fakeStore.appendToStream('foo-123', [], 7)
            .catch((error) => {
                expect(error instanceof StreamConcurrencyException).toBeTruthy();
                done();
            });
    });

    it('appends events to an existing stream and increases the version', async () => {
        const fakeStore = new FakeEventStore();

        await fakeStore.createStream('foo-123', [
            new CustomEvent('FirstEvent')
        ]);

        await fakeStore.appendToStream('foo-123', [
            new CustomEvent('SecondEvent'),
            new CustomEvent('ThirdEvent')
        ], 1);

        const storedEvents = await fakeStore.readStream('foo-123');
        expect(storedEvents.version).toEqual(2);
        expect(storedEvents.events).toEqual([
            new CustomEvent('FirstEvent'),
            new CustomEvent('SecondEvent'),
            new CustomEvent('ThirdEvent')
        ]);
    });

    it('fails when reading a non existing stream', (done) => {
        const fakeStore = new FakeEventStore();

        fakeStore.readStream('foo-123')
            .catch((error) => {
                expect(error instanceof StreamNotFoundException).toBeTruthy();
                done();
            });
    });

    it('can set a stream by invoking setStream()', async () => {
        const fakeStore = new FakeEventStore();
        const fakeStream = {
            version: 7,
            events: [
                new CustomEvent('my-custom-event-1', { age: 38, name: 'Goofy' }),
            ]
        } as EventStream;

        fakeStore.setStream('fake-stream', fakeStream);

        const stream = await fakeStore.readStream('fake-stream');
        expect(stream).toEqual(fakeStream);
    });
    
})