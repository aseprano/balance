import { CustomEvent } from "./CustomEvent";

describe('CustomEvent', () => {
    
    it('holds the name and payload set via constructor', () => {
        const event = new CustomEvent('MyEventName', {
            age: 38,
            name: 'John Doe'
        });

        expect(event.getName()).toEqual('MyEventName');
        expect(event.getPayload()).toEqual({
            age: 38,
            name: 'John Doe'
        });
    });

});
