import { AccountHolderName } from "./AccountHolderName";
import { InvalidAccountHolderNameException } from "../exceptions/InvalidAccountHolderNameException";

describe("AccountHolderName", () => {
    const expectedException = new InvalidAccountHolderNameException();

    it("cannot be empty", () => {
        expect(() => new AccountHolderName("")).toThrow(expectedException);
        expect(() => new AccountHolderName()).toThrow(expectedException);
    });

    it("can have a one-word string", () => {
        const name = new AccountHolderName("Seprano");
        expect(name.asString()).toEqual("Seprano");
    });

    it("cannot start with a lowercase letter", () => {
        expect(() => new AccountHolderName("seprano")).toThrow(expectedException);
    });

    it("can be made of two words", () => {
        const name = new AccountHolderName("Seprano Antonio");
        expect(name.asString()).toEqual("Seprano Antonio");
    });

    it("cannot be made of non-ucfirst words", () => {
        expect(() => new AccountHolderName("Seprano antonio")).toThrow(expectedException);
    });

    it("can have multiple, comma separated ucfirst words", () => {
        const name = new AccountHolderName("Seprano, Antonio");
        expect(name.asString()).toEqual("Seprano, Antonio");
    });

    it("cannot have comma separated words starting with lowercase letters", () => {
        expect(() => new AccountHolderName("Seprano, antonio")).toThrow(expectedException);
    });

    it("can have single-quote separated ucfirst words", () => {
        const name = new AccountHolderName("O'Brian");
        expect(name.asString()).toEqual("O'Brian");

        expect(() => new AccountHolderName("O' Brian")).toThrow(expectedException);
        expect(() => new AccountHolderName("O' brian")).toThrow(expectedException);
    });

    it("can have comma separated ucfirst words", () => {
        const name = new AccountHolderName("Dr. Brown");
        expect(name.asString()).toEqual("Dr. Brown");

        expect(() => new AccountHolderName("Dr.Brown")).toThrow(expectedException);
        expect(() => new AccountHolderName("Dr. brown")).toThrow(expectedException);
    });
    
});
