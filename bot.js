require('dotenv').config()

const Telegraf = require('telegraf')
const extra = require('telegraf/extra')
const fs = require('fs')

const shellHandler = require('./shellHandler')
const Locale = require('./locales')

const locale = new Locale('./locales/')
try{
     locale.setLocale(fs.readFileSync('./currentLocale.txt','utf-8'))
}
catch{
     fs.writeFile('./currentLocale.txt', 'en', (err) => {
          if (err) throw err;
          console.log('File is created successfully.');
     }); 
     locale.setLocale('en')
}

const bot = new Telegraf(process.env.BOT_TOKEN)  

bot.telegram.getMe().then((bot_informations) => {
     bot.options.username = bot_informations.username
     console.log("Server has initialized bot nickname. Nick: "+bot_informations.username)
})

bot.catch((err, ctx) => {
     console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})
 
bot.use(async (ctx, next) => {
     const start = new Date()
     await next()
     const ms = new Date() - start
     console.log('Response time: %sms', ms)
})

bot.on('text', (ctx) => {

     let out = ''
     let msg = ctx.message.text

     console.log(ctx.message)
     console.log('msg: ' + msg)

     if (!process.env.USERS.includes(ctx.from.username)){
          return ctx.reply('You are not correct user')
     }

     switch(msg){
          case '/ru':
               locale.setLocale('ru')
               fs.writeFile('currentLocale.txt', 'ru', (err) => {
                    if (err) throw err;
               });
               out = 'Вы выбрали русский'
               break
          case '/en':
               locale.setLocale('en')
               fs.writeFile('currentLocale.txt', 'en', (err) => {
                    if (err) throw err;
               });
               out = 'You chosen english'
               break
          case '/start':
               out = locale.getMessage('start')
               break
          case '/help':
               out = locale.getMessage('help') 
               break
          default:
               (async() => {
                    // console.log('Before handler')
                    const {stdout, computerName, current_dir} = await shellHandler(ctx.message.text)
                    
                    if (stdout != null)
                         await ctx.reply(stdout)
                    
                    return ctx.reply(`<b>${computerName}: </b><code>${current_dir}</code>$`, extra.HTML())
                    // console.log('after handler')
               })()
     }
     return ctx.reply(out, extra.HTML())
})

bot.launch({
     webhook: {
         domain: process.env.DOMAIN,
         port: process.env.PORT
     }
 })