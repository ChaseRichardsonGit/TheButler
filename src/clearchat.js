module.exports = async function(message){ 
    if(!message) {
        console.error("message is not defined");
        return;
    }

    if(!message.content) {
        console.error("message.content is not defined");
        return;
    }

    let numMessages = message.content.split(" ")[1];
    if(!numMessages) {
        return message.channel.send("Please provide the number of messages to delete.");
    }
    if(isNaN(numMessages)) {
        return message.channel.send("Please provide a valid number of messages to delete.");
    }

    const messages = await message.channel.messages.fetch({ limit: numMessages });
    const messagesToDelete = messages.filter(m => !m.content.match(/https?:\/\/[^\s]+/));
    if (messagesToDelete.length === 0) {
        return message.channel.send("No messages to delete.");
    }

    try {
        await message.channel.bulkDelete(messagesToDelete);
        const confirmationMessage = await message.channel.send(`Successfully deleted ${messagesToDelete.size} messages.`);
        setTimeout(function() {
            confirmationMessage.delete();
        }, 5000);
    } catch (err) {
        if (err.code === 50034) {
            return message.channel.send("The messages you requested to delete are over 14 days old and cannot be deleted in bulk.");
        } else {
            console.error(err);
        }
    }
}