import { Collection } from "@discordjs/collection";
import { User, UserApiType } from "../classes/User";
import { Client } from "../classes/Client";
import { Member, MemberApiType } from "../classes/Member";
import { Server } from "../classes/Server";

export class MembersManager {
    cache: Collection<string, Member> = new Collection();
    client: Client;
    server: Server;
    inicializated: boolean = false;

    constructor(server: Server, client: Client) {
        this.client = client;
        this.server = server;
    }

    initMembers() {
        if (this.inicializated) return Promise.resolve(this);
        return new Promise(async (resolve, reject) => {
            this.client.api.get(`/servers/${this.server.id}/members`).then(async (res) => {                
                const {members} = res.data as {members: MemberApiType[]}
                for (const member of members) {
                    const user = await this.client.users.fetch(member._id.user);
                    this.cache.set(member._id.user, new Member(this.server, member, user, this.client))
                }
                this.inicializated = true;
                resolve(this);
            }).catch(err => console.error(`Axios /servers/${this.server.id}/members Error on ServersManager`, new Error(err.message)))
        });
    }

    /**
     * Get a member specified by id
     * @param id the id of the member to fetch
     * @returns Promise<Member>
     */
    fetch(id: string): Promise<Member> {
        return new Promise((resolve, reject) => {
            if (this.cache.has(id) && !this.cache.get(id)?.partial) resolve(this.cache.get(id)!);
            else this.client.api.get(`/servers/${this.server.id}/members/${id}` ).then(async (res) => {
                const user = await this.client.users.fetch(id);
                const member = new Member(this.server, res.data, user, this.client);
                this.cache.set(id, member);
                resolve(member);
            }).catch((err) => console.error(`Axios /servers/${this.server.id}/members/${id} Error on ServersManager`, new Error(err.message)));
        });
    }
}
