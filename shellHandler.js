require('dotenv').config()

const util = require('util')
const fs = require('fs')
const computerName = require('os').hostname()

const exec = util.promisify(require('child_process').exec)

let current_dir = __dirname.replace(new RegExp('\\\\', 'g'), '/') + '/'

async function pathMaker(path){

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

     console.log('S / path: ' + path)
     let tempPath = current_dir
     console.log('J tempPathes: ' + tempPath)


     // Making new path
     for(let i = path.length - 1; i >= 0; --i){
          console.log('temp + [i]: ' + tempPath + '/' + path[i])
          if (path[i] == '..'){
               path.splice(i, i + 2)
               console.log('Splice path: ' + path)
               while(true){
                    tempPath = tempPath.substring(0, tempPath.length - 1)
                    let letter = tempPath.substr(tempPath.length - 1)
                    if (letter == '/' || letter == '\\')
                         break
               }
          }
          else if(fs.existsSync(tempPath + '/' + path[i])){
               tempPath += path[i]
          }
          else 
               return null
     }

     if (path[1] == ':'){
          tempPath = path[0] + path[1] + '/' + tempPath
     }

     else if (path[0] == '/')
          tempPath = '/' + tempPath

     if (tempPath[tempPath.length - 1] != '/')
          tempPath += '/'

     return tempPath
     
}

async function bashHandler(command = 'cd dir') {
     
     // Resolve special syntax
     command = command.replace(new RegExp('%PATH%', 'g'), current_dir)

     if (command.split(' ')[0] == 'cd'){

          const newPath = await pathMaker(command.split(' ')[1])

          if (newPath == null)
               return `<b>Incorrenct path. Write /help to get right instruction</b>\n<b>${computerName}:</b> <code>${current_dir}</code>$`

          current_dir = newPath
          console.log('cDir: ' + current_dir)

          const n = null
          return {n, computerName, current_dir}
     }

     const { stdout, stderr } = await exec(command, options = {shell: process.env.GIT_BASH_PATH});
     
     return {stdout, computerName, current_dir}
}

module.exports = bashHandler