module.exports = async function(message){
    if (!message) {
        console.error("message is not defined");
        return;
    }

    if (!message.content) {
        console.error("message.content is not defined");
        return;
    }

    let numMessages = message.content.split(" ")[1];
    if(!numMessages) {
        return message.channel.send("Please provide the number of messages to delete.");
    }
    if (isNaN(numMessages)) {
        return message.channel.send("Please provide a valid number of messages to delete.");
    }
    try {
        message.channel.bulkDelete(numMessages);
        message.channel.send(`Successfully deleted ${numMessages} messages.`);
    } catch (err) {
        console.error(err);
    }
}
