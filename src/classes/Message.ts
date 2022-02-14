import { Client, TextChannel, User, Member, EmbedOptions } from "../index";
import { Embed } from "./Embed";

export class Message {
    client: Client;
    id: string;
    channel!: TextChannel;
    author!: User;
    member?: Member;
    content: string;
    nonce?: string;
    attachments?: Attachments[];
    edited?: {
        $date: string;
    }
    mentions?: Member[]
    embeds?: Embed[]
    masquerade?: {
        name?: string;
        avatar?: string;
    }
    partial: boolean = true

    constructor(data: MessageData, client: Client) {
        client.channels.text.fetch(data.channel).then(async (channel) => {
            this.channel = channel;
            this.author = await client.users.fetch(data.author);
            this.member = await channel.server.members.fetch(data.author);
            if (data.mentions) for (const mention of data.mentions) {
                const member = await channel.server.members.fetch(mention);
                this.mentions?.push(member) //TODO collection
            }
            if (data.embeds) for (const embed of data.embeds) {
                this.embeds?.push(new Embed(embed)) //TODO collection
            }
        });
        this.client = client;
        this.id = data._id;
        this.content = data.content;
        if (data.nonce) this.nonce = data.nonce;
        if (data.attachments) this.attachments = data.attachments;
        if (data.edited) this.edited = data.edited
        if (data.masquerade) this.masquerade = data.masquerade
    }
}

export interface MessageData {
    _id: string;
    nonce?: string;
    channel: string;
    author: string;
    content: string;
    attachments?: Attachments[];
    edited?: {
        $date: string;
    }
    embeds?: EmbedOptions[];
    mentions: string[];
    masquerade?: {
        name?: string;
        avatar?: string;
    }
}

export interface Attachments {
    _id: string;
    tag: "attachments" | "avatars" | "backgrounds" | "banners" | "icons"
    size: number;
    filename: string;
    content_type: string;
    metadata: {
        type: "File" | "Text" | "Audio" | "Image" | "Video";
        width?: number;
        height?: number;
    };
}