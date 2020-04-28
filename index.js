const { Octokit } = require('@octokit/rest');
const fs = require('fs');

let projects = fs.readdirSync('./projects');
console.log(`We have ${projects.length} project(s)`);
const OWNER_REPO = (process.env.GITHUB_REPOSITORY || "JakeHendy/onboarding-repo");
const OWNER = OWNER_REPO.split('/')[0];
const REPO = OWNER_REPO.split('/')[1];
const octo = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

projects.forEach(project => {
    let metadataPath = `./projects/${project}/metadata.json`;
    let cards = fs.readdirSync(`./projects/${project}`);
    let hasMetadata = fs.existsSync(`./projects/${project}/metadata.json`);
    let metadata = hasMetadata ? JSON.parse(fs.readFileSync(metadataPath)) : { "name" : project };
    let numberOfCards = hasMetadata ? cards.length - 1 : cards.length;
    console.log(`${project} has ${numberOfCards} card(s)`);

    let projectCreated = octo.projects.createForRepo({
        owner: OWNER,
        repo: REPO,
        name: metadata['name'],
    }).catch(e => console.log(e));
})