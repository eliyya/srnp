import { Client } from "./Client";
import { User } from "./User";
import { MembersManager } from '../managers/MembersManager'

export class Server {
    id: string;
    ownerId: string;
    owner?: User;
    name: string;
    channels: string[];
    categories: {
        id: string;
        title: string;
        channels: string[];
    }[];;
    systemMessages: {
        userJoined: string;
        userLeft: string;
        userKicked: string;
        userBanned: string;
    };
    roles: unknown;
    defaultPermissions: [number, number];
    icon: unknown;
    banner: unknown;
    client: Client;
    description?: string;
    nsfw?: boolean;
    flags?: ServerFlags;
    analytics?: boolean;
    discoverable?: boolean;
    partial: boolean = true;
    members: MembersManager;

    constructor(data: ServerApiType, client: Client) {
        client.users.fetch(data.owner).then((user) => {
            this.owner = user;
        });
        this.client = client;
        this.ownerId = data.owner
        this.id = data._id;
        this.name = data.name;
        this.channels = data.channels;
        this.categories = data.categories;
        this.systemMessages = {
            userJoined: data.system_messages.user_joined,
            userLeft: data.system_messages.user_left,
            userKicked: data.system_messages.user_kicked,
            userBanned: data.system_messages.user_banned,
        };
        this.roles = data.roles;
        this.defaultPermissions = data.default_permissions;
        this.icon = data.icon;
        this.members = new MembersManager(this, client);
    }

    /**
     * Fetch this server from the API
     * @returns Promise<Server>
     */
    fetch(): Promise<Server> {
        return new Promise((resolve, reject) => {
            this.client.api
                .get("/servers/" + this.id)
                .then(async (res) => {
                    const server = res.data as ServerApiType;
                    this.owner = await this.client.users.fetch(server.owner);
                    this.id = server._id;
                    this.name = server.name;
                    this.channels = server.channels;
                    this.categories = server.categories;
                    this.systemMessages = {
                        userJoined: server.system_messages.user_joined,
                        userLeft: server.system_messages.user_left,
                        userKicked: server.system_messages.user_kicked,
                        userBanned: server.system_messages.user_banned,
                    };
                    this.roles = server.roles;
                    this.defaultPermissions = server.default_permissions;
                    this.icon = server.icon;
                    this.description = server.description;
                    this.nsfw = server.nsfw;
                    this.flags = server.flags;
                    this.analytics = server.analytics;
                    this.discoverable = server.discoverable;
                    this.partial = false;
                    await this.members.initMembers()
                    resolve(this);
                })
                .catch((err) => console.error(`Axios /server/${this.id} Error`, new Error(err.message)))
        });
    }
}

export interface ServerApiType {
    _id: string;
    owner: string;
    name: string;
    channels: string[];
    categories: {
        id: string;
        title: string;
        channels: string[];
    }[];
    system_messages: {
        user_joined: string;
        user_left: string;
        user_kicked: string;
        user_banned: string;
    };
    roles: unknown;
    default_permissions: [number, number];
    icon: unknown;
    banner: unknown;
    description?: string;
    nsfw?: boolean;
    flags?: ServerFlags;
    analytics?: boolean;
    discoverable?: boolean;
}

export enum ServerFlags {
    OfficialRevoltServer = 0 << 1,
    VerifiedCommunityServer = 0 << 2
}
