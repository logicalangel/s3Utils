const { Command, flags } = require('@oclif/command')
const os = require('os');
const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs');

const GLOBAL_CONF_PATH = path.join(os.homedir(), 's3utils.env')

class SetRemoteCommand extends Command {
    async run() {
        const { flags } = this.parse(SetRemoteCommand)
        inquirer.prompt([
            {
                type: 'input',
                name: 'ENDPOINT',
                message: "EndPoint: "
            }, {
                type: 'input',
                name: 'ACCESSKEY',
                message: "Access Key: "
            }, {
                type: 'input',
                name: 'SECRETKEY',
                message: "Secret Key: "
            }
        ]).then(answers => {
            let config = "";
            config += 'AWS_ENDPOINT=' + answers['ENDPOINT'] + '\n';
            config += 'AWS_ACCESS_KEY_ID=' + answers['ACCESSKEY'] + '\n';
            config += 'AWS_SECRET_ACCESS_KEY=' + answers['SECRETKEY'];
            fs.writeFileSync(GLOBAL_CONF_PATH, config);
            console.log('Server Connection saved to -> ' + GLOBAL_CONF_PATH);
        });
    }
}

SetRemoteCommand.description = `Describe the command here`;

SetRemoteCommand.flags = {

}

module.exports = SetRemoteCommand
