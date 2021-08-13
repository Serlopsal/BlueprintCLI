#! /usr/bin/env node
'use strict';

const yargs = require('yargs');
const fs =  require('fs');
const path = require('path');

const options = yargs
      .usage("bp")
      .option("f", {alias:"file", describe: "Indicate the JSON file of template", type: "string", demandOption: true })
      .option("k", {alias:"template-key", describe: "Indicate the JSON file template key to execute", type: "string", demandOption: true })
      .help(true)
      .argv;


if(!yargs.argv._[0] || yargs.argv._.length !== 1){
    yargs.showHelp();
    return;
}

const file = yargs.argv.file;
const key = yargs.argv.templateKey;

fs.readFile(file, (err, data) => {
    if (err) {console.error(err); return; }
    try{
        let jsonFile = JSON.parse(data);
        if(jsonFile.hasOwnProperty('templates')) {
            const templates = jsonFile.templates;
            if(templates.hasOwnProperty(key)){
                if(Array.isArray(templates[key])){
                    const template = templates[key];
                    if(template.length > 0){
                        for(var file of template){
                            if(!file.filename){
                                console.error("All templates must have a property called filename");
                                return;
                            }
                            if(!file.content){
                                console.error("All templates must have a property called content");
                                return;
                            }
                            if(file.content.substring(0,1) !== '/'){
                                console.error("All content file path must start with '/'");
                                return;
                            }
                        }
                        for(var file of template){
                            createfile(file);
                        }
                    } else{
                        console.error(`${key} must have at least one template file`)
                    }
                } else{
                    console.error(`${key} must be an array`)
                }
            } else {
                console.error(`${key} not found in json file templates`)
            }
        } else{
            console.error("Error format, the JSON file content must be enclosed by 'templates' object key")
        }
    }
    catch {
        console.error("Error format, check JSON file content");
    }
})

function createfile(file){
    
    fs.readFile(path.dirname(yargs.argv.file) + file.content, (err, data) => {
        if (err) { console.error(err); return; }
        let templateContent = data.toString();
        let fileContent = templateContent.replace(/\:\:\[\_KEY\_\]\:\:/g, yargs.argv._[0])
        let filename = file.filename.replace('::KEY::', yargs.argv._[0]);

        fs.writeFile(filename,fileContent, function (err){
            if (err) {console.error(err); return; }
            console.log(`${filename} created successfully`)
        })
    })
}