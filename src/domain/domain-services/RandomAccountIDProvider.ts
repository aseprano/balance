import { AccountID } from "../values/AccountID";

export default function RandomAccountIDProvider(): AccountID {
    let randomId = (Math.floor(Math.random() * 99999999999)) + '';

    if (randomId.length < 11) {
        randomId = '0'.repeat(11 - randomId.length) + randomId;
    }

    return new AccountID(randomId);
}
