import { Client, Presence } from "./Client";

export class User {
    id: string;
    name: string;
    badges: Badges;
    relationship: RelationShip;
    online: boolean;
    client: Client;
    partial: boolean = true;
    relations?: {
        status: RelationShip;
        id: string;
    }[];
    status: {
        text?: string;
        presence?: Presence;
    } = {};
    flags?: UserFlag;
    bot?: {
        owner: User;
    };
    avatar: unknown;
    constructor(data: UserApiType, client: Client) {
        this.client = client;
        this.id = data._id;
        this.name = data.username;
        this.badges = data.badges;
        this.relationship = data.relationship;
        this.online = data.online;
        this.avatar = data.avatar;
    }

    /**
     * Fetch this user from the API
     * @returns Promise<User>
     */
    fetch(): Promise<User> {
        return new Promise((resolve, reject) => {
            this.client.api
                .get("/users/" + this.id)
                .then(async (res) => {
                    const user = res.data as UserApiType;
                    if (user.bot) this.bot = { owner: await this.client.users.fetch(user.bot.owner) };
                    this.name = user.username;
                    this.relations = user.relations;
                    this.badges = user.badges;
                    this.status = user.status;
                    this.relationship = user.relationship;
                    this.online = user.online;
                    this.flags = user.flags;
                    this.partial = false;
                    this.avatar = user.avatar;
                    resolve(this);
                })
                .catch((err) => reject(err.toString()));
        });
    }
}

export interface UserApiType {
    _id: string;
    username: string;
    badges: Badges;
    relationship: RelationShip;
    online: boolean;
    relations?: {
        status: RelationShip;
        id: string;
    }[];
    status: {
        text?: string;
        presence?: Presence;
    };
    flags?: UserFlag;
    bot?: {
        owner: string;
    };
    avatar: unknown;
}

export enum UserFlag {
    AcountSuspended = 0 << 1,
    AcountDeleted = 0 << 2,
    AcountBanned = 0 << 3,
}

export enum RelationShip {
    Blocked = 1,
    BlockedOther,
    Friend,
    Incoming,
    None,
    Outgoing,
    User,
}

export enum Badges {
    Developer = 0 << 1,
    Translator = 0 << 2,
    Supporter = 0 << 3,
    ResponsibleDisclosure = 0 << 4,
    Founder = 0 << 5,
    PlatformModeration = 0 << 6,
    ActiveSupporter = 0 << 7,
    Paw = 0 << 8,
    EarlyAdopter = 0 << 9,
}
