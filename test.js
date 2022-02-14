const srnp = require('./dist/index')
const { config } = require('dotenv')
config()

const client = new srnp.Client()

client.init(process.env.TOKEN)

client.on('preparing', () => {
    console.log('iniciando')
})

client.on('ready', async () => {
    console.log('ready')

    const user = client.users.cache.get('01FSMFEE5QX88J8F3Y3JXTKKBC')
    const server = client.servers.cache.get('01FSMFSXJB6K2B18AHKQPFJDTG')
    const channel = client.channels.text.cache.get('01FSMFSXJBYAAYSVCW9JGXXCJ0')
    const member = server.members.cache.get(user.id)
    const message = await channel.send('Hello!')

    console.log({ user, server, channel, member, message })
})
