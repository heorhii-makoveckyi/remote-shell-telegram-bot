const util = require('util')

const fs = require('fs')
const readFile = util.promisify(fs.readFile)

let pathToLocales;
let currentLocale;

function initLocale(localesPath = '../locales/') {
     pathToLocales = localesPath
     // console.log(pathToLocales)
     try{
          setLocale(fs.readFileSync('./currentLocale.txt','utf-8'))
     }
     catch{
          fs.writeFile('./currentLocale.txt', 'en', (err) => {
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

async function getInstruction(ctx) {
     const message = ctx.message.text.substr(1, ctx.message.text.length - 1)
     const stdout = await readFile(currentLocale, 'utf-8')
     // console.log('CL: ' + currentLocale + ' ' + '\nSTDOUT: ' + stdout)
     return ctx.replyWithHTML(JSON.parse(stdout)[message])
}

module.exports = {initLocale, setLocale, getInstruction}