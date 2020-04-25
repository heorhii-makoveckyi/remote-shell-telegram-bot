require('dotenv').config()

const util = require('util')
const computerName = require('os').hostname()

const exec = util.promisify(require('child_process').exec)
const exists = util.promisify(require('fs').exists)

const { SHELL_PATH, USERS } = process.env

const { getInstruction } = require('./localesHandler')

let currentDir = __dirname.replace(new RegExp('\\\\', 'g'), '/') + '/'

const AUnicode = 65
const ZUnicode = 90
const aUnicode = 97
const zUnicode = 122

const isUpToTree = element => element === '..'
const isLinuxFullPath = path => path[0] === '/'
const isCdCommand = command => command.split(' ')[0] === 'cd'

function upToTree(tempPath = '/') {
    while (true) {
        tempPath = tempPath.substring(0, tempPath.length - 1)
        let letter = tempPath.substr(tempPath.length - 1)
        if (letter === '/' || letter === '\\')
            return tempPath
    }
}

function isWindowsFullPath(path = '/') {
    const firstLetter = path[0].charCodeAt(0)
    // console.log('firstLetter: ' + firstLetter)
    if ((firstLetter >= AUnicode && firstLetter <= ZUnicode || // A - Z
        firstLetter >= aUnicode && firstLetter <= zUnicode) & // a - z
        path[1] === ':') {
        return true
    }
    return false
}

function makePathRoot(tempPath = '/', path = '/') {
    if (path[1] === ':') {
        tempPath = path[0] + path[1] + '/' + tempPath
    }
    else if (path[0] === '/')
        tempPath = '/' + tempPath

    if (tempPath[tempPath.length - 1] != '/')
        tempPath += '/'

    return tempPath
}

async function makePath(path = '/') {

    if (!await exists(path))
        throw await getInstruction('invalidCd')

    if (isLinuxFullPath(path))
        return path

    if (isWindowsFullPath(path))
        return path

    // Getting path in view like: '.. .. dirName1 dirName2'
    path = path.split('/')

    // console.log('S / path: ' + path)
    let tempPath = currentDir

    // Making new path
    const rePath = [...path].reverse()
    await Promise.all(rePath.map(async (pathPart) => {
        if (isUpToTree(pathPart))
            tempPath = upToTree(tempPath)
        else if (await exists(tempPath + '/' + pathPart))
            tempPath += pathPart
        else
            tempPath = makePathRoot(tempPath, path)
    }))

    return tempPath
}

module.exports = async (ctx) => {

    console.log('msg: ' + ctx.message.text)
    if (!USERS.includes(ctx.from.username)) {
        return ctx.reply('You are not correct user')
    }
    command = ctx.message.text.replace(new RegExp('%PATH%', 'g'), currentDir)

    if (isCdCommand(command)) {
        let newPath = null
        try {
            newPath = await makePath(command.split(' ')[1])
        } catch (err) {
            return ctx.replyWithHTML(err + `\n<b>${computerName}:</b> <code>${currentDir}</code>$`)
        }

        currentDir = newPath
        // console.log('cDir: ' + currentDir)
        return ctx.replyWithHTML(`<b>${computerName}: </b><code>${currentDir}</code>$`)
    }

    try {
        const { stdout, stderr } = await exec(command, options = { shell: SHELL_PATH })
        await ctx.replyWithHTML(`<b>${computerName}: </b><code>${currentDir}</code>$`)
        return ctx.reply(stdout)
    }
    catch (err) {
        await ctx.replyWithHTML(`<b>${computerName}: </b><code>${currentDir}</code>$`)
        return ctx.reply('ERROR: ' + err)
    }
}