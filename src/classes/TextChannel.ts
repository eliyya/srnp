import { Server } from "./Server";
import { Channel, ChannelApiType, ChannelType } from "./Channel";
import { Client } from "./Client";

export class TextChannel extends Channel {
    server!: Server;
    name: string;
    description?: string;
    icon?: unknown;
    defaultPermissions?: number;
    rolePermissions?: unknown;
    nsfw?: boolean;
    lastMessageId?: string;
    constructor(data: TextChannelApiType, client: Client) {
        super(data, client);
        this.name = data.name;
        client.servers.fetch(data.server).then((server) => {
            this.server = server;
        });
    }

    fetch(): Promise<TextChannel> {
        return new Promise((resolve, reject) => {
            this.client.api
                .get("/channels/" + this.id)
                .then(async (res) => {
                    const channel = res.data as TextChannelApiType;
                    this.server = await this.client.servers.fetch(channel.server);
                    this.id = channel._id;
                    this.type = channel.channel_type;
                    this.name = channel.name;
                    this.description = channel.description;
                    this.icon = channel.icon;
                    this.defaultPermissions = channel.default_permissions;
                    this.rolePermissions = channel.role_permissions;
                    this.nsfw = channel.nsfw;
                    this.lastMessageId = channel.last_message_id;
                    this.partial = false;
                    resolve(this);
                })
                .catch((err) => console.error(`Axios /channel/${this.id} Error`, new Error(err.message)))
        });
    }
}

export interface TextChannelApiType extends ChannelApiType {
    name: string;
    server: string;
    channel_type: ChannelType.Text;
    description?: string;
    icon?: unknown;
    default_permissions?: number;
    role_permissions?: unknown;
    nsfw?: boolean;
    last_message_id?: string;
}
