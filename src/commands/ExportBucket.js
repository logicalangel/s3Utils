const { Command, flags } = require('@oclif/command');
const os = require('os');
const path = require('path');
const aws = require('aws-sdk');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs');
const GLOBAL_CONF_PATH = path.join(os.homedir(), 's3utils.env')

require('dotenv').config({ path: GLOBAL_CONF_PATH });

class ExportBucketCommand extends Command {
    async run() {
        const { flags } = this.parse(ExportBucketCommand)

        let createS3 = ora('Connecting to encpoint');
        let bucketList = ora('Get list of buckets');
        let CheckFolder = ora('Check if dist folder exist');
        let getListOfObject = ora('Retrieve list of objects');
        let Downloading = ora('Downloading...');

        createS3.start();
        let client = new aws.S3({
            signatureVersion: 'v4',
            s3ForcePathStyle: 'true',
            endpoint: process.env.AWS_ENDPOINT,
        });
        createS3.succeed();

        bucketList.start();

        client.listBuckets(async (err, data) => {
            if (err)
                return console.log(err);
            bucketList.stop();

            let { Bucket } = await inquirer.prompt([{
                type: 'list',
                name: 'Bucket',
                message: 'Select Bucket For Export?',
                choices: [...data.Buckets.map(bucket => bucket.Name)]
            }]);

            bucketList.succeed();

            CheckFolder.start();
            if (!fs.existsSync(process.cwd() + '/' + Bucket))
                fs.mkdir(process.cwd() + '/' + Bucket);
            CheckFolder.succeed();

            getListOfObject.start();
            client.listObjectsV2({ Bucket }, (err, data) => {
                if (err) return console.log(err);
                getListOfObject.succeed();
                Downloading.start();

                let downloaded = 0;
                data.Contents.forEach((file, index) => {
                    let uri = '/';
                    if (file.Key.indexOf('/') > -1) {
                        let path = file.Key.split('/');
                        for (let i = 0; i < path.length - 1; i++) uri += path[i];
                        if (!fs.existsSync(process.cwd() + '/' + Bucket + uri)) fs.mkdir('./' + Bucket + uri);
                    }

                    let readStream = client.getObject({ Bucket, Key: file.Key }).createReadStream();
                    let writeStream = fs.createWriteStream(process.cwd() + '/' + Bucket + '/' + file.Key, { autoClose: true });

                    readStream.on('error', (err) => { writeStream.destroy(); console.log(err); console.log('ErrorRead -> ' + Bucket + '/' + file.Key + ' : ' + file.Size); process.exit(1) });
                    writeStream.on('error', (err) => { readStream.destroy(); console.log(err); console.log('ErrorWrite -> ' + Bucket + '/' + file.Key + ' : ' + file.Size); process.exit(1) });
                    writeStream.on('close', () => {
                        downloaded += 1;
                        Downloading.text = 'Downloading...\t(' + downloaded + '/' + data.Contents.length + ')';
                        if (downloaded == data.Contents.length) {
                            Downloading.succeed();
                            process.exit(0);
                        }
                    });
                    readStream.pipe(writeStream)
                });
            });
        });
    }
}

ExportBucketCommand.description = `Describe the command here`;

ExportBucketCommand.flags = {

}

module.exports = ExportBucketCommand;