# Silly Revolt Node Package
Just a Silly Revolt Node Package for Bots (beta)

## Installation
```
npm i srnp
```

## Example usage
```js
// Let's import the module and create a client
const {Client} = require('srnp');

const client = new Client();

// The client is initialized with the init() method
client.init(process.env.REVOLT_TOKEN)

// Client.init() returns a promise when the client is ready
// But we can use the "ready" event to override the promise
client.on('ready', () => {
    console.log("ready");

    const user = client.users.cache.get("01FSMFEE5QX88J8F3Y3JXTKKBC");
    const server = client.servers.cache.get("01FSMFSXJB6K2B18AHKQPFJDTG");
    const channel = client.channels.text.cache.get("01FSMFSXJBYAAYSVCW9JGXXCJ0");
    const member = server.members.cache.get(user.id);
    
    console.log({ user, server, channel, member });
});
```



