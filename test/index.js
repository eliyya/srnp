"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../dist/index");
const client = new index_1.Client();
client.init('bot_token');
client.on('ready', () => {
});
