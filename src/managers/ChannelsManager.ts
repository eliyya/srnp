import { Client } from "../classes/Client";
import { TextChannel, TextChannelApiType } from '../classes/TextChannel'
import { ChannelApiType, ChannelType } from '../classes/Channel'
import { TextChannelsManager } from "./TextChannelsManager";

export class ChannelsManager {
    text: TextChannelsManager;
    client: Client;
    inicializated: boolean = false;
    constructor(client: Client) {
        this.client = client;
        this.text = new TextChannelsManager(client);
    }

    initChannels(channels: ChannelApiType[]) {
        if (this.inicializated) return Promise.resolve(this);
        return new Promise(async (resolve, reject) => {
            for (const channel of channels.filter(c=>c.channel_type == ChannelType.Text)) {
                if (!this.text.cache.has(channel._id))
                this.text.cache.set(channel._id, new TextChannel(channel as TextChannelApiType, this.client));
                await Promise.all(this.text.cache.map((s) => s.fetch()));
            }
            this.inicializated = true;
            resolve(this);
        });
    }

    /**
     * Get a channel specified by id
     * @param id the id of the channel to fetch
     * @returns Promise<TextChannel>
     */
    fetch(id: string): Promise<TextChannel> {
        return new Promise((resolve, reject) => {
            if (this.text.cache.has(id) && !this.text.cache.get(id)?.partial) resolve(this.text.cache.get(id)!);
            else this.client.api.get("/channels/" + id).then(async (res) => {
                const channel = new TextChannel(res.data, this.client);
                await channel.fetch();
                resolve(channel);
            }).catch((err) => console.error(`Axios /channels/${id} Error`, new Error(err.message)));
        });
    }
}
