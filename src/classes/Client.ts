import EventEmitter from "events";
import WebSocket from "@insertish/isomorphic-ws";
export interface ClientOptions {
    wsURL?: string;
    token?: string;
    reconnect?: boolean
}
enum WSDataType {
    Ready = "Ready",
}
export class Client extends EventEmitter {
    ws?: WebSocket;
    wsURL: string;
    private _wsInterval = setInterval(() => {}, 20000000);
    private _wsIntent = 1;
    token: string = "";
    reconnect: boolean;
    constructor(opt?: ClientOptions) {
        super();
        this.wsURL = opt?.wsURL ?? "wss://ws.revolt.chat?format=json";
        this.reconnect = opt?.reconnect??false
        if (opt?.token) this.token = opt.token;
    }
    private _initWS(path: string): Promise<WebSocket> {
        return new Promise<WebSocket>((resolve, reject) => {
            this.ws = new WebSocket(path);
            this.ws.onopen = () => {
                if(this._wsIntent > 1) console.log('Socket Connected');
                this._wsIntent = 1;
                this.ws?.send(
                    JSON.stringify({
                        type: "Authenticate",
                        token: this.token,
                    }),
                );
                this._wsInterval = setInterval(() => this.ws?.ping(), 20_000);

                
                if (this.ws) this.ws.onmessage = async (msg) => {
                    const data = JSON.parse(msg.data.toString());
                    if (data.type === WSDataType.Ready) {
                        await this.users.initUsers(data.users)
                        await this.servers.initServers(data.servers)
                        await this.channels.initChannels(data.channels)
                        // console.log(data.channels);
                        
                        resolve(this.ws??new WebSocket(''));
                    }
                }

                if(this.ws) this.ws.onclose = () => {
                    clearInterval(this._wsInterval);
                    console.log('Closed Socket\nReconnecting...');                    
                    this._initWS(path);
                };
            };
            this.ws.onerror = (err) => {
                if (!this.reconnect) console.error("WebSocket Error", new Error(err.message));
                else {
                    console.log('Unavivable Socket\nTring in a momment...');
                    setTimeout(()=>{
                        this._initWS(path);
                        console.log('Reconnecting Socket...');
                        
                    }, 1_000*++this._wsIntent)
                }
            }
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
            if(!this.token) {
                throw new Error('Token required');
                process.exit(1);
            }
            this.emit("preparing");
            await this._initWS(this.wsURL);
            this.emit("ready", this);
        });
    }
}
