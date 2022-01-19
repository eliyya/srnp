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

    fetch(id: string): Promise<Server> {
        return new Promise((resolve, reject) => {
            if (this.cache.has(id) && !this.cache.get(id)?.partial) resolve(this.cache.get(id)!);
            else this.client.api.get("/servers/" + id).then(async (res) => {
                const server = new Server(res.data, this.client);
                await server.fetch();
                resolve(server);
            }).catch((err) => console.error(`Axios /server/${id} Error`, new Error(err.message)));
        });
    }
}