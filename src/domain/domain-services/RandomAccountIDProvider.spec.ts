import RandomIDGenerator from "./RandomAccountIDProvider";

describe('RandomAccountIDProvider', () => {

    it('returns a random id', () => {
        const randomIds: string[] = [];

        for (let i=0; i < 1000; i++) {
            randomIds.push(RandomIDGenerator().asString());
        }

        // all ids must be 11 chars long
        expect(randomIds.every(s => s.length === 11)).toEqual(true);
        
        // all ids are unique
        const uniqueIds = randomIds.filter((s, index) => randomIds.indexOf(s) === index);
        expect(uniqueIds.length).toEqual(randomIds.length);
    });

})