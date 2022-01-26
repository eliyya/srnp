import EventEmitter from "events";
import WebSocket from "@insertish/isomorphic-ws";
import { UsersManager } from "../managers/UsersManager";
import axios, { AxiosInstance } from "axios";
import { ServersManager } from "../managers/ServersManager";
import { ChannelsManager } from "../managers/ChannelsManager";
import { UserApiType, User } from "./User";
import { UserBot } from './UserBot'

export enum Presence {
    Busy = "Busy",
    Idle = "Idle",
    Invisible = "Invisible",
    Online = "Online",
}

export interface ClientOptions {
    wsURL?: string;
    token?: string;
    apiURL?: string;
    reconnect?: boolean;
}

enum WSDataType {
    Ready = "Ready",
    Error = "Error",
}

enum WSErrorType {
    InvalidSession = "InvalidSession",
}

export class Client extends EventEmitter {
    ws?: WebSocket;
    wsURL: string;
    private _wsInterval = setInterval(() => {}, 20000000);
    private _wsIntent = 1;
    users = new UsersManager(this);
    servers = new ServersManager(this);
    channels = new ChannelsManager(this);
    api: AxiosInstance;
    apiURL: string;
    token: string = "";
    reconnect: boolean;
    user?: UserBot;
    constructor(opt?: ClientOptions) {
        super();
        this.wsURL = opt?.wsURL ?? "wss://ws.revolt.chat?format=json";
        this.api = axios.create();
        this.apiURL = opt?.apiURL ?? "https://api.revolt.chat";
        this.reconnect = opt?.reconnect ?? false;
        if (opt?.token) this.token = opt.token;
    }

    private _initWS(path: string): Promise<WebSocket> {
        return new Promise<WebSocket>((resolve, reject) => {
            this.ws = new WebSocket(path);
            this.ws.onopen = () => {
                if (this._wsIntent > 1) console.log("Socket Connected");
                this._wsIntent = 1;
                this.ws?.send(
                    JSON.stringify({
                        type: "Authenticate",
                        token: this.token,
                    }),
                );
                this._wsInterval = setInterval(() => this.ws?.ping(), 20_000);

                if (this.ws)
                    this.ws.onmessage = async (msg) => {
                        const data = JSON.parse(msg.data.toString());
                        if (data.type === WSDataType.Ready) {
                            await this.users.initUsers(data.users);
                            await this.servers.initServers(data.servers);
                            await this.channels.initChannels(data.channels);

                            resolve(this.ws ?? new WebSocket(""));
                        } else if (data.type === WSDataType.Error && data.error == WSErrorType.InvalidSession) {
                            throw new Error(data.error);
                        }
                    };

                if (this.ws)
                    this.ws.onclose = () => {
                        clearInterval(this._wsInterval);
                        console.log("Closed Socket\nReconnecting...");
                        this._initWS(path);
                    };
            };
            this.ws.onerror = (err) => {
                if (!this.reconnect) throw new Error(err.message);
                else {
                    console.log("Unavivable Socket\nTring in a momment...");
                    setTimeout(() => {
                        this._initWS(path);
                        console.log("Reconnecting Socket...");
                    }, 1_000 * ++this._wsIntent);
                }
            };
        });
    }

    /**
     * init the connection
     * @param token
     * @returns Promise<Client>
     */
    async init(token?: string): Promise<Client> {
        return new Promise<Client>(async (resolve, reject) => {
            if (token) this.token = token;
            if (!this.token) {
                throw new Error("Token required");
            }
            this.emit("preparing");
            this.api = await axios.create({
                baseURL: this.apiURL,
                timeout: 5000,
                headers: { "Content-Type": "application/json", "x-bot-token": this.token },
            });
            await this._initWS(this.wsURL);
            const res = await this.api.get("/users/@me");
            const user = await this.users.fetch((res.data as UserApiType)._id);
            this.user = new UserBot(user, this);
            this.emit("ready", this);
        });
    }
}
