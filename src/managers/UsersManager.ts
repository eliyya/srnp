import { Collection } from "@discordjs/collection";
import { User, UserApiType } from "../classes/User";
import { Client } from "../classes/Client";

export class UsersManager {
    cache: Collection<string, User> = new Collection();
    client: Client;
    inicializated: boolean = false;
    constructor(client: Client) {
        this.client = client
    }

    initUsers(users: UserApiType[]){
        if(this.inicializated) return Promise.resolve(this);
        return new Promise(async (resolve, reject) => {
            for(const user of users) if(!this.cache.has(user._id)) this.cache.set(user._id, new User(user, this.client))
            await Promise.all(this.cache.map(u=>u.fetch()))
            this.inicializated = true;
            resolve(this);
        })
    }

    fetch(id: string): Promise<User> {
        return new Promise((resolve, reject) => {
            if (this.cache.has(id) && !this.cache.get(id)?.partial) resolve(this.cache.get(id)!);
            else this.client.api.get("/users/" + id).then(async (res) => {
                const user = new User(res.data, this.client);
                await user.fetch();
                if (!this.cache.has(id) || this.cache.get(id)?.partial) this.cache.set(user.id, user);
                resolve(user);
            }).catch((err) => console.error(`Axios /users/${id} Error on UsersManager`, new Error(err.message)));
        })
    }
}
