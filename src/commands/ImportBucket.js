const { Command, flags } = require('@oclif/command')

class ImportBucketCommand extends Command {
    async run() {
        const { flags } = this.parse(ImportBucketCommand)

        
    }
}

ImportBucketCommand.description = `Describe the command here`;

ImportBucketCommand.flags = {

}

module.exports = ImportBucketCommand;