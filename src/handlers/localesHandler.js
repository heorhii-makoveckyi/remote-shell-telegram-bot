const util = require('util')

const fs = require('fs')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

let pathToLocales = null
let currentLocale = null
let configPath = null

async function initLocale(localesDirPath = './locales/', localesConfigPath = './locales/localesConfig.json') {
    pathToLocales = localesDirPath
    configPath = localesConfigPath
    // console.log('CONFIG PATH: ' + configPath)
    await setLocale(JSON.parse(await readFile(configPath, 'utf-8'))['currentLocale'])
}

async function setLocale(lang = 'en') {
    
    currentLocale = pathToLocales + lang + '.json'
    // console.log('CURRENT LOCALE: ' + currentLocale)
    
    const configRaw = await readFile(configPath, 'utf-8')
    // console.log('CONFIG RAW ' + configRaw + ' ' + typeof configRaw)
    
    const config = JSON.parse(configRaw)
    // console.log('CONFIG: ' + config)

    config['currentLocale'] = lang
    await writeFile(configPath, JSON.stringify(config))
}

async function setLocaleReply(ctx) {
    const lang = ctx.state.command.args

    const newLocale = pathToLocales + lang + '.json'

    const config = JSON.parse(await readFile(configPath, 'utf-8'))

    if (!config['validLocales'].includes(lang))
        return ctx.replyWithHTML(await getInstruction('invalidLang'))

    currentLocale = newLocale

    config['currentLocale'] = lang

    await writeFile(configPath, JSON.stringify(config))

    return ctx.replyWithHTML(await getInstruction('choose'))
}

async function getInstructionReply(ctx) {
    const message = ctx.message.text.substr(1, ctx.message.text.length - 1)
    const stdout = await readFile(currentLocale, 'utf-8')
    return ctx.replyWithHTML(JSON.parse(stdout)[message])
}

async function getInstruction(message) {
    const stdout = await readFile(currentLocale, 'utf-8')
    return JSON.parse(stdout)[message]
}

module.exports = { initLocale, getInstruction, setLocaleReply, getInstructionReply }