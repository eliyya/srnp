import { Collection } from "@discordjs/collection";
import { Client } from "../classes/Client";
import { ServerApiType, Server } from "../classes/Server";

export class ServersManager {
    cache: Collection<string, Server> = new Collection();
    client: Client;
    inicializated: boolean = false;
    constructor(client: Client) {
        this.client = client;
    }

    initServers(servers: ServerApiType[]) {
        if (this.inicializated) return Promise.resolve(this);
        return new Promise(async (resolve, reject) => {
            for (const server of servers)
                if (!this.cache.has(server._id))
                    this.cache.set(server._id, new Server(server, this.client));
            await Promise.all(this.cache.map((s) => s.fetch()));
            this.inicializated = true;
            resolve(this);
        });
    }

    /**
     * Get a server specified by id
     * @param id the id of the server to fetch
     * @returns Promise<Server>
     */
    fetch(id: string): Promise<Server> {
        return new Promise((resolve, reject) => {
            if (this.cache.has(id) && !this.cache.get(id)?.partial) resolve(this.cache.get(id)!);
            else this.client.api.get("/servers/" + id).then(async (res) => {
                const server = new Server(res.data, this.client);
                await server.fetch();
                if(!this.cache.has(id) || this.cache.get(id)?.partial) this.cache.set(id, server);
                resolve(server);
            }).catch((err) => console.error(`Axios /servers/${id} Error on ServersManager`, new Error(err.message)));
        });
    }
}
