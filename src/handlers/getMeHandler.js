module.exports = (botInformation) => {
    bot.options.username = botInformation.username
    console.log("Server has initialized bot nickname. Nick: " + botInformation.username)
}