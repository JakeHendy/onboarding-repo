const { Octokit } = require('@octokit/rest');
const fs = require('fs');

let projects = fs.readdirSync('./projects');
console.log(`We have ${projects.length} project(s)`);

projects.forEach(project => {
    let metadataPath = `./projects/${project}/metadata.json`;
    let cards = fs.readdirSync(`./projects/${project}`);
    let hasMetadata = fs.existsSync(`./projects/${project}/metadata.json`);
    let metadata = hasMetadata ? fs.readFileSync(metadataPath) : { "name" : project };
    let numberOfCards = hasMetadata ? cards.length - 1 : cards.length;
    console.log(`${project} has ${numberOfCards} card(s)`);
    
})