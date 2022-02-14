import { Client, Message, ChannelApiType, ChannelType, Server, Embed } from '../index'
import { Channel } from './Channel'

export class TextChannel extends Channel {
    server!: Server
    name: string
    description?: string
    icon?: unknown
    defaultPermissions?: number
    rolePermissions?: unknown
    nsfw?: boolean
    lastMessageId?: string
    constructor(data: TextChannelApiType, client: Client) {
        super(data, client)
        this.name = data.name
        client.servers.fetch(data.server).then(server => {
            this.server = server
        })
    }

    /**
     * Fetch this channel from the API
     * @returns Promise<TextChannel>
     */
    fetch(): Promise<TextChannel> {
        return new Promise((resolve, reject) => {
            this.client.api
                .get('/channels/' + this.id)
                .then(async res => {
                    const channel = res.data as TextChannelApiType
                    this.server = await this.client.servers.fetch(channel.server)
                    this.id = channel._id
                    this.type = channel.channel_type
                    this.name = channel.name
                    this.description = channel.description
                    this.icon = channel.icon
                    this.defaultPermissions = channel.default_permissions
                    this.rolePermissions = channel.role_permissions
                    this.nsfw = channel.nsfw
                    this.lastMessageId = channel.last_message_id
                    this.partial = false
                    resolve(this)
                })
                .catch(err => reject(err.toString()))
        })
    }

    /**
     *
     * @param {string | SendOptions} options - To send
     * @returns {Promise<Message>} Returns a partial Message
     */
    send(options: string | SendOptions): Promise<Message> {
        return new Promise(async (resolve, reject) => {
            if (typeof options === 'string') {
                this.client.api
                    .post(`/channels/${this.id}/messages`, { content: options })
                    .then(res => resolve(new Message(res.data, this.client)))
                    .catch(err => reject(err.toString()))
            } else if (typeof options === 'object') {
                if (typeof options.content !== 'string') return reject('content is required')
                this.client.api
                    .post(`/channels/${this.id}/messages`, options)
                    .then(res => resolve(new Message(res.data, this.client)))
                    .catch(err => reject(err.toString()))
            } else reject('Wrong SendOptions type')
        })
    }
}

export interface TextChannelApiType extends ChannelApiType {
    name: string
    server: string
    channel_type: ChannelType.Text
    description?: string
    icon?: unknown
    default_permissions?: number
    role_permissions?: unknown
    nsfw?: boolean
    last_message_id?: string
}

export interface SendOptions {
    content: string
    attachments?: string[]
    embeds?: Embed[]
    replies?: {
        id: string
        mention: boolean
    }[]
    masquerade?: {
        name?: string
        avatar?: string
    }
}
