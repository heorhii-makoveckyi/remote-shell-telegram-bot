require('dotenv').config()

const Telegraf = require('telegraf')
const fs = require('fs')
const { BOT_TOKEN, WEBHOOK_DOMAIN, WEBHOOK_PORT } = process.env

const handleShellCommand = require('./handlers/shellHandler')
const { initLocale, setLocale, getInstruction } = require('./handlers/locales')

initLocale('./locales/')

const bot = new Telegraf(BOT_TOKEN)  

bot.telegram.getMe((botInformation) => {
     bot.options.username = botInformation.username
     console.log("Server has initialized bot nickname. Nick: "+botInformation.username)
})
bot.catch((err, ctx) => console.log(`Ooops, encountered an error for ${ctx.updateType}`, err))
bot.command('start', getInstruction)
bot.command('help', getInstruction)
bot.command('ru', (ctx) => {
     setLocale('ru')
     fs.writeFile('currentLocale.txt', 'ru', (err) => {
          if (err) throw err;
     });
     return ctx.reply('Вы выбрали русский')
})
bot.command('en', (ctx) => {
     setLocale('en')
     fs.writeFile('currentLocale.txt', 'en', (err) => {
          if (err) throw err;
     });
     return ctx.reply('You chosen english')
})
bot.on('text', handleShellCommand)

bot.launch({
     webhook: {
         domain: WEBHOOK_DOMAIN,
         port: WEBHOOK_PORT
     }
})