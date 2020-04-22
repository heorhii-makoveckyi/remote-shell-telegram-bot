const fs = require('fs')

class Locale{
     constructor(pathToLocales = './locales/', currentLocale = 'en'){
          this.pathToLocales = pathToLocales
          this.currentLocale = currentLocale
     }
     setLocale(locale = 'en'){
          console.log('LOCALE: ' + locale)
          this.currentLocale = this.pathToLocales + locale + '.json'
     }
     getMessage(message = 'message'){
          let file = fs.readFileSync(this.currentLocale, 'utf-8')
          return JSON.parse(file)[message]
     }
}

module.exports = Locale
