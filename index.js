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
    let metadata = JSON.parse(fs.readFileSync(metadataPath));
    let numberOfCards =  cards.length;
    console.log(`${project} has ${numberOfCards} card(s)`);

    let gh_project = octo.projects.createForRepo({
        owner: OWNER,
        repo: REPO,
        name: metadata['name'],
    }).catch(e => console.log(e));
    console.log(`${project} created as ${gh_project["id"]}`)
    console.log(`${project} has ${metadata['columns'].length} columns`)
    metadata["columns"].forEach((column) =>
        octo.projects.createColumn({
            project_id: gh_project["id"],
            name: column
        }).catch(e => console.log(e))
    );
})