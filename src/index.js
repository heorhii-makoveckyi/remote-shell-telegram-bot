require('dotenv').config()

const Telegraf = require('telegraf')
const commandParts = require('telegraf-command-parts')

const { BOT_TOKEN, WEBHOOK_DOMAIN, WEBHOOK_PORT } = process.env

const handleShellCommand = require('./handlers/shellHandler')
const { initLocale, setLocaleReply, getInstructionReply } = require('./handlers/localesHandler')

initLocale('./locales/localesConfig.json')

const bot = new Telegraf(BOT_TOKEN)

bot.use(commandParts())

bot.telegram.getMe((botInformation) => {
  bot.options.username = botInformation.username
  console.log('Server has initialized bot nickname. Nick: ' + botInformation.username)
})
bot.catch((err, ctx) => console.log(`Ooops, encountered an error for ${ctx.updateType}`, err))

bot.command('start', getInstructionReply)
bot.command('help', getInstructionReply)
bot.command('setLang', setLocaleReply)
bot.on('text', handleShellCommand)

bot.launch({
  webhook: {
    domain: WEBHOOK_DOMAIN,
    port: WEBHOOK_PORT
  }
})
