import util from 'util'
import os from 'os'
import pathLib from 'path'

const exec = util.promisify(require('child_process').exec)
const access = util.promisify(require('fs').access)

let shellPath = ''
let users = ''
let logCallback = async (message) => {}

const computerName = os.hostname()
let currentDir = __dirname.replace(new RegExp('\\\\', 'g'), '/') + '/'

export { handleShellCommand, initShell }

const isUpToTree = element => element === '..'
const isFullPath = path => pathLib.isAbsolute(path)
const isCdCommand = command => command.split(' ')[0] === 'cd'

function initShell (pathToShell = '', usersList = '', logFunction = async (message) => {}) {
  shellPath = pathToShell
  users = usersList
  logCallback = logFunction
}

function upToTree (tempPath = '/') {
  while (true) {
    tempPath = tempPath.substring(0, tempPath.length - 1)
    const letter = tempPath.substr(tempPath.length - 1)
    if (letter === '/' || letter === '\\') { return tempPath }
  }
}

function makePathRoot (tempPath = '/', path = '/') {
  if (path[1] === ':') { tempPath = path[0] + path[1] + '/' + tempPath } else if (path[0] === '/') { tempPath = '/' + tempPath }
  if (tempPath[tempPath.length - 1] !== '/') { tempPath += '/' }
  return tempPath
}

async function makePath (path = '/') {
  try { await access(path) } catch {
    console.log('Cannot access')
    throw await logCallback('invalidCd')
  }

  if (isFullPath(path)) { return path }
  // Getting path in view like: '.. .. dirName1 dirName2'
  path = path.split('/')

  let tempPath = currentDir

  // Making new path
  const rePath = [...path].reverse()
  await Promise.all(rePath.map(async (pathPart) => {
    let exists = true
    try { await access(tempPath + '/' + pathPart) } catch { exists = false }
    if (isUpToTree(pathPart)) { tempPath = upToTree(tempPath) } else if (exists) { tempPath += pathPart } else { tempPath = makePathRoot(tempPath, path) }
  }))

  return tempPath
}

async function handleShellCommand (ctx) {
  console.log('msg: ' + ctx.message.text)
  if (!users.includes(ctx.from.username)) {
    return ctx.reply('You are not correct user')
  }
  const command = ctx.message.text.replace(new RegExp('%PATH%', 'g'), currentDir)

  if (isCdCommand(command)) {
    let newPath = null
    try {
      newPath = await makePath(command.split(' ')[1])
    } catch (err) {
      return ctx.replyWithHTML(err + `\n<b>${computerName}:</b> <code>${currentDir}</code>$`)
    }

    currentDir = newPath
    return ctx.replyWithHTML(`<b>${computerName}: </b><code>${currentDir}</code>$`)
  }

  try {
    const { stdout } = await exec(command, { shell: shellPath })
    await ctx.replyWithHTML(`<b>${computerName}: </b><code>${currentDir}</code>$`)
    return ctx.reply(stdout)
  } catch (err) {
    await ctx.replyWithHTML(`<b>${computerName}: </b><code>${currentDir}</code>$`)
    return ctx.reply('ERROR: ' + err)
  }
}
