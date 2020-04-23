require('dotenv').config()

const util = require('util')
const fs = require('fs')
const computerName = require('os').hostname()

const exec = util.promisify(require('child_process').exec)

const { SHELL_PATH, USERS } = process.env

let current_dir = __dirname.replace(new RegExp('\\\\', 'g'), '/') + '/'

async function makePath(path){

     // If full path in linux 
     if (path[0] == '/')
          return path

     // If full path in windows
     const fchar = path[0].charCodeAt(0)
     if ((fchar >= 65 && fchar <= 90 || // A - Z
          fchar >= 97 && fchar <= 122) & // a - z
          path[1] == ':') {
          return path
     }

     // Getting path in view like: '.. .. dirName1 dirName2'
     path = path.split('/') 

     // console.log('S / path: ' + path)
     let tempPath = current_dir
     // console.log('J tempPathes: ' + tempPath)


     // Making new path
     const rePath = [...path].reverse()
     rePath.map((element, index) => {
          // console.log('temp + [i]: ' + tempPath + '/' + element)
          if (element == '..'){
               path.splice(index, index + 2)
               // console.log('Splice path: ' + path)
               while(true){
                    tempPath = tempPath.substring(0, tempPath.length - 1)
                    let letter = tempPath.substr(tempPath.length - 1)
                    if (letter == '/' || letter == '\\')
                         return
               }
          }
          else if(fs.existsSync(tempPath + '/' + element)){
               tempPath += element
          }
          else 
               return 
     })

     if (path[1] == ':'){
          tempPath = path[0] + path[1] + '/' + tempPath
     }
     else if (path[0] == '/')
          tempPath = '/' + tempPath

     if (tempPath[tempPath.length - 1] != '/')
          tempPath += '/'

     return tempPath
     
}

module.exports = async(ctx) => {

     console.log('msg: ' + ctx.message.text)
     if (!USERS.includes(ctx.from.username)){
          return ctx.reply('You are not correct user')
     }

     command = ctx.message.text.replace(new RegExp('%PATH%', 'g'), current_dir)
     if (command.split(' ')[0] == 'cd'){

          const newPath = await makePath(command.split(' ')[1])

          if (newPath == null)
               return ctx.replyWithHTML(`<b>Incorrenct path. Write /help to get right 
                    instruction</b>\n<b>${computerName}:</b> <code>${current_dir}</code>$`)

          current_dir = newPath
          // console.log('cDir: ' + current_dir)

          return ctx.replyWithHTML(`<b>${computerName}: </b><code>${current_dir}</code>$`)
     }

     const { stdout, stderr } = await exec(command, options = {shell: SHELL_PATH});
     await ctx.replyWithHTML(`<b>${computerName}: </b><code>${current_dir}</code>$`)
     return ctx.reply(stdout)
}