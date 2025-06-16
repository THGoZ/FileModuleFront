import type { SessionDetails, User } from "../../../../interfaces/interfaces";

const sessionDataCreate = (expire: string, id: string, userData: User) => {
    const sessionData: SessionDetails = {
        expire,
        id,
        userData,
    }
    return sessionData;
}

export default { sessionDataCreate }