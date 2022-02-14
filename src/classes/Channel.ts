import { Client } from "../index";

export class Channel {
    id: string;
    type: ChannelType;
    client: Client;
    partial: boolean = true;
    constructor(data: ChannelApiType, client: Client) {
        this.client = client;
        this.id = data._id;
        this.type = data.channel_type;
    }

    /**
     * Fetch this channel from the API
     * @returns Promise<Channel>
     */
    fetch(): Promise<Channel> {
        return new Promise((resolve, reject) => {
            this.client.api
                .get("/channels/" + this.id)
                .then(async (res) => {
                    const channel = res.data as ChannelApiType;
                    this.id = channel._id;
                    this.type = channel.channel_type;
                    this.partial = false;
                    resolve(this);
                })
                .catch((err) => reject(err.toString()))
        });
    }
}

export interface ChannelApiType {
    _id: string;
    channel_type: ChannelType;
}

export enum ChannelType {
    Text = 'TextChannel',
    Voice = 'VoiceChannel'
}
