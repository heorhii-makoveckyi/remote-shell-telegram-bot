const util = require('util')

const readFile = util.promisify(require('fs').readFile)
const writeFile = util.promisify(require('fs').writeFile)

const invalidLangLiteral = 'invalidLang'
const currentLocaleLiteral = 'currentLocale'
const validLocalesLiteral = 'validLocales'
const pathToLocalesLiteral = 'pathToLocales'
const chooseLiteral = 'choose'

let pathToLocales = ''
let currentLocale = ''
let configPath = ''

async function initLocale(pathToConfig = './locales/localesConfig.json') {
    
    configPath = pathToConfig
    const config = JSON.parse(await readFile(pathToConfig, 'utf-8'))
    pathToLocales = config[pathToLocalesLiteral]

    // console.log('CONFIG PATH: ' + configPath)
    await setLocale(config[currentLocaleLiteral])
}

async function setLocale(lang = 'en') {

    currentLocale = pathToLocales + lang + '.json'
    // console.log('CURRENT LOCALE: ' + currentLocale)

    const configRaw = await readFile(configPath, 'utf-8')
    const config = JSON.parse(configRaw)

    config[currentLocaleLiteral] = lang
    await writeFile(configPath, JSON.stringify(config))
}

async function setLocaleReply(ctx) {
    const lang = ctx.state.command.args
    const newLocale = pathToLocales + lang + '.json'
    const config = JSON.parse(await readFile(configPath, 'utf-8'))

    if (!config[validLocalesLiteral].includes(lang))
        return ctx.replyWithHTML(await getInstruction(invalidLang))

    currentLocale = newLocale

    config[currentLocaleLiteral] = lang
    await writeFile(configPath, JSON.stringify(config))
    return ctx.replyWithHTML(await getInstruction(chooseLiteral))
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