import { Client, Presence } from "./Client";
import { User, UserApiType, RelationShip, UserFlag, Badges } from "./User";

export class UserBot {
    id: string;
    name: string;
    relationship: RelationShip;
    online: boolean;
    client: Client;
    partial: boolean = true;
    badges: Badges;
    relations?: {
        status: RelationShip;
        id: string;
    }[];
    status: {
        text?: string;
        presence?: Presence;
    } = {
        text: undefined,
        presence: undefined,
    };
    flags?: UserFlag;
    bot: {
        owner: User;
    };
    avatar: unknown;
    constructor(user: User, client: Client) {
        this.client = client;
        this.id = user.id;
        this.name = user.name;
        this.avatar = user.avatar;
        this.badges = user.badges;
        this.bot = user.bot!;
        this.relationship = user.relationship;
        this.online = user.online;
        this.status = user.status;
        this.flags = user.flags;
        this.partial = false;
    }

    /**
     * Fetch this user from the API
     * @returns Promise<UserBot>
     */
    fetch(): Promise<UserBot> {
        return new Promise((resolve, reject) => {
            this.client.api
                .get("/users/" + this.id)
                .then(async (res) => {
                    const user = res.data as UserApiType;
                    this.bot = { owner: await this.client.users.fetch(user.bot!.owner) };
                    this.name = user.username;
                    this.relations = user.relations;
                    this.badges = user.badges;
                    this.status = user.status;
                    this.relationship = user.relationship;
                    this.online = user.online;
                    this.flags = user.flags;
                    this.partial = false;
                    this.avatar = user.avatar;
                    resolve(this);
                })
                .catch((err) => reject(err.toString()));
        });
    }

    edit(options: {
        status?: EditStatusOptions;
        profile?: EditProfileoptions;
        avatar?: string;
        remove?: RemoveUserType;
    }) {
        return new Promise((resolve, reject) => {
            const { status, profile, avatar, remove } = options; //TODO agregar profile al usuario
            if(status || profile || avatar) this.client.api.patch("/users/@me", options).then(async (res) => {
                console.log(res.status, res.statusText);
                if (res.status !== 204) reject(res.statusText);
                if (status?.text) this.status.text = status.text;
                if (status?.presence) this.status.presence = status.presence;
                if (avatar) await this.fetchAvatar() //TODO por dios esto es dificil planearlo
                resolve(this)
            });
        })
    }

    editStatus(options: EditStatusOptions) {
        if (options.text || options.presence) this.edit({ status: options });
    }

    editProfile(options: EditProfileoptions) {
        if (options.backgrounnd || options.content) this.edit({ profile: options });
    }

    fetchAvatar(){

    }
}

export enum RemoveUserType {
    Avatar = "Avatar",
    ProfileBackground = "ProfileBackground",
    ProfileContent = "ProfileContent",
    StatusText = "StatusText",
}

export interface EditStatusOptions {
    text?: string;
    presence?: Presence;
}

export interface EditProfileoptions { 
    content?: string; 
    backgrounnd?: string 
}