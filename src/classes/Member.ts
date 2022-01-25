import { User } from "./User";
import { Client } from "./Client";
import { Server } from "./Server";

export interface MemberApiType {
    _id: { server: string; user: string };
    roles?: string[];
    nickname?: string;
    avatar: unknown;
}

export class Member {
    server: Server;
    id: string;
    roles: string[];
    nickname?: string;
    avatar: unknown;
    client: Client;
    partial: boolean = false;
    user: User;

    constructor(server: Server, data: MemberApiType, user: User, client: Client) {
        this.user = user
        this.server = server;
        this.id = data._id.user;
        this.roles = data.roles ?? [];
        this.nickname = data.nickname;
        this.avatar = data.avatar;
        this.client = client;
    }

    /**
     * Fetch this member from the API
     * @returns Promise<Member>
     */
    fetch(): Promise<Member> {
        return new Promise((resolve, reject) => {
            this.client.api
                .get("/users/" + this.id)
                .then(async (res) => {
                    const member = res.data as MemberApiType;
                    this.user = await this.client.users.fetch(member._id.user);
                    this.id = member._id.user;
                    this.roles = member.roles ?? [];
                    this.nickname = member.nickname;
                    this.avatar = member.avatar;
                    resolve(this);
                })
                .catch((err) => console.error);
        });
    }
}
