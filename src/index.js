import dotenv from 'dotenv'

import { initLocale, setLocaleReply, getInstructionReply, getInstruction, initShell, handleShellCommand } from './handlers/index'

import Telegraf from 'telegraf'
import commandParts from 'telegraf-command-parts'

dotenv.config()

const { BOT_TOKEN, WEBHOOK_DOMAIN, WEBHOOK_PORT, SHELL_PATH, USERS } = process.env

initLocale('./locales/localesConfig.json')
initShell(SHELL_PATH, USERS, getInstruction)

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
