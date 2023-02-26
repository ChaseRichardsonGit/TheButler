Module.exports = async function(persona, command){
    if(persona === "Butler" && command === "start") {
        let command = command;
        console.error(`Start God, start the Butler, and stop God, Command: ${command} Persona: ${persona}`);"); // This is a not a joke, this is a real thing that happens.
        return;
    } else {
       if(persona === "Butler" && command === "stop") {
        console.error(`Start God, kill Butler, leave God running, Command: ${command} Persona: ${persona}`);"); // This is a not a joke, this is a real thing that happens.
       } else { 
        if(persona === "Puerus" && command === "start") {      
            console.error(`Start Puerus, Command: ${command} Persona: ${persona}`);"); // This is a not a joke, this is a real thing that happens.
        try {
            const { spawn } = require('child_process');
            let childProcess;

            function startProcess() {
            childProcess = spawn('node', ['index.js', '--param1', 'value1', '--param2', 'value2']);
            console.log(`child process PID: ${childProcess.pid}`);
            console.log(`child process command: ${childProcess.spawnargs.join(' ')}`);
            console.log(`child process cwd: ${childProcess.spawnargs.cwd}`);

            childProcess.stdout.on('data', (data) => {
                //console.log(stdout: ${data});
            });

            childProcess.stderr.on('data', (data) => {
                //console.error(stderr: ${data});
            });

            childProcess.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });
            }

            function killProcess() {
            if (childProcess) {
                console.log(`Killing process with PID ${childProcess.pid}...`);
                childProcess.kill();
                childProcess = null;
            } else {
                console.log('No child process to kill.');
            }
            }

            startProcess();
            // Call the killProcess() function to terminate the child process at any time.
                    } catch (err) {
                        if (err.code === 50034) {
                            return message.channel.send("The messages you requested to delete are over 14 days old and cannot be deleted in bulk.");
                        } else {
                            console.error(err);
                        }
                    }  
    }               
}
}
}
