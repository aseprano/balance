import { EventBusImpl } from "./EventBusImpl";
import { CustomEvent } from "../CustomEvent";

describe('EventBusImpl', () => {

    it('does not allow invalid event names', () => {
        const eventBus = new EventBusImpl();
        expect(() => eventBus.on('foobar', () => {})).toThrow();
        expect(() => eventBus.on('foobar.', () => {{}})).toThrow();
    });
    
    it('allows subscription with specific names', async () => {
        const bus = new EventBusImpl();
        let subscriptionInvoked = false;

        bus.on('com.darkbyte.foo', (e) => {
            subscriptionInvoked = true;
        });

        await bus.handle(new CustomEvent('com.darkbyte.foo'));
        expect(subscriptionInvoked).toEqual(true);
    });

    it('allows subscriptions with shortcodes', async () => {
        const eventBus = new EventBusImpl();
        const events1: string[] = [];
        const events2: string[] = [];

        eventBus
            .on('com.darkbyte.*', (e) => {
                events1.push(e.getName());
            })
            .on('com.foobar.?', (e) => {
                events2.push(e.getName());
            });

        await Promise.all([
            eventBus.handle(new CustomEvent('com.darkbyte.e1')),
            eventBus.handle(new CustomEvent('com.darkbyte.e2.foo')),
            eventBus.handle(new CustomEvent('com.darkbyte')),
            eventBus.handle(new CustomEvent('com.foobar.e1')),
            eventBus.handle(new CustomEvent('com.foobar.e1.foo')),
        ]);
        
        expect(events1).toEqual(['com.darkbyte.e1', 'com.darkbyte.e2.foo']);
        expect(events2).toEqual(['com.foobar.e1']);
    });

    it('does not deliver event that do not match subscriptions', async () => {
        const bus = new EventBusImpl();
        let subscriptionInvoked = false;

        bus.on('com.darkbyte.foo', (e) => {
            subscriptionInvoked = true;
        });

        await bus.handle(new CustomEvent('com.darkbyte.foo2'));
        expect(subscriptionInvoked).toEqual(false);
    });

    it('does not mix subscriptions with the same key', async () => {
        let s1count = 0;
        let s2count = 0;

        const eventBus = new EventBusImpl();

        eventBus
            .on('com.darkbyte.foo', () => { s1count++; })
            .on('com.darkbyte.foo', () => { s2count++; });

        await eventBus.handle(new CustomEvent('com.darkbyte.foo'));
        expect(s1count).toEqual(1);
        expect(s2count).toEqual(1);
    });

    it('is case sensitive', async () => {
        const eventBus = new EventBusImpl();
        let subscriber1Invoked = false;
        let subscriber2Invoked = false;

        eventBus.on('com.darkbyte.foo', () => {
            subscriber1Invoked = true;
        }).on('com.darkbyte.Foo', () => {
            subscriber2Invoked = true;
        });

        await eventBus.handle(new CustomEvent('com.darkbyte.foo'));
        expect(subscriber1Invoked).toEqual(true);
        expect(subscriber2Invoked).toEqual(false);
    });

});
