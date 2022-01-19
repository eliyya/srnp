import { Collection } from "@discordjs/collection";
import { Client } from "../classes/Client";
import { TextChannel, TextChannelApiType } from '../classes/TextChannel'
import { ChannelApiType, ChannelType } from '../classes/Channel'

export class TextChannelsManager {
    cache: Collection<string, TextChannel> = new Collection();
    client: Client;
    inicializated: boolean = false;
    constructor(client: Client) {
        this.client = client;
    }

    initChannels(channels: ChannelApiType[]) {
        if (this.inicializated) return Promise.resolve(this);
        return new Promise(async (resolve, reject) => {
            for (const channel of channels.filter(c=>c.channel_type == ChannelType.Text))
                if (!this.cache.has(channel._id))
                    this.cache.set(channel._id, new TextChannel(channel as TextChannelApiType, this.client));
            await Promise.all(this.cache.map((s) => s.fetch()));
            this.inicializated = true;
            resolve(this);
        });
    }

    fetch(id: string): Promise<TextChannel> {
        return new Promise((resolve, reject) => {
            if (this.cache.has(id) && !this.cache.get(id)?.partial) resolve(this.cache.get(id)!);
            else this.client.api.get("/channels/" + id).then(async (res) => {
                const channel = new TextChannel(res.data, this.client);
                await channel.fetch();
                resolve(channel);
            }).catch((err) => console.error(`Axios /channels/${id} Error`, new Error(err.message)));
        });
    }
}
