# Silly Revolt Node Package
Just a Silly Revolt Node Package for Bots

## Instalation
```
npm i srnp
```

## Example usage
```js
// Let's import the module and create a client
const {Client} = require('../srnp/dist/index');

const client = new Client();

// The client is initialized with the init() method
client.init(process.env.REVOLT_TOKEN)

// Client.init() returns a promise when the client is ready
// But we can use the "ready" event to override the promise
client.on('ready', () => {
    console.log('ready');
    console.log(
        client.servers.cache.get('01FSMFSXJB6K2B18AHKQPFJDTG')
                    .members.cache.get('01FSMFEE5QX88J8F3Y3JXTKKBC')
    );
});
```