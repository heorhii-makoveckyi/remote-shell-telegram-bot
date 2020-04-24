const util = require('util')

const fs = require('fs')
const readFile = util.promisify(fs.readFile)

let pathToLocales;
let currentLocale;

async function initLocale(localesDirPath = './locales/', curLocalePath = './locales/currentLocale.txt') {
     pathToLocales = localesDirPath
     // console.log(pathToLocales)
     try{ 
          setLocale(await readFile(curLocalePath,'utf-8'))
     }
     catch{
          fs.writeFile(curLocalePath, 'en', (err) => {
               if (err) throw err;
               // console.log('File is created successfully.');
          }); 
          setLocale('en')
     }
}

function setLocale(locale = 'en') {
     currentLocale = pathToLocales + locale + '.json'
     // console.log(currentLocale)
}

async function getReplyInstruction(ctx) {
     console.log(ctx)
     const message = ctx.message.text.substr(1, ctx.message.text.length - 1)
     console.log('MESSAGE: ' + message)
     const stdout = await readFile(currentLocale, 'utf-8')
     // console.log('CL: ' + currentLocale + ' ' + '\nSTDOUT: ' + stdout)
     return ctx.replyWithHTML(JSON.parse(stdout)[message])
}

async function getInstruction(message) {
     const stdout = await readFile(currentLocale, 'utf-8')
     // console.log('CL: ' + currentLocale + ' ' + '\nSTDOUT: ' + stdout)
     return JSON.parse(stdout)[message]
}

module.exports = {initLocale, setLocale, getReplyInstruction, getInstruction}