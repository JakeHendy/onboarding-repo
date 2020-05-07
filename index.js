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

projects.forEach(async project => {
    let metadataPath = `./projects/${project}/metadata.json`;
    let cards = fs.readdirSync(`./projects/${project}`);
    let metadata = JSON.parse(fs.readFileSync(metadataPath));
    let numberOfCards =  cards.length;
    console.log(`${project} has ${numberOfCards} card(s)`);

    let gh_project = await octo.projects.createForRepo({
        owner: OWNER,
        repo: REPO,
        name: metadata['name'],
    })
    await createColumns(gh_project['data'], metadata['columns']);
    
})

async function createColumns(project, columns) {
    console.log(project)
    console.log(`Creating columns for ${project["id"]}/${project["name"]}`)

    columns.forEach(async column =>
        octo.projects.createColumn({
            project_id: project["id"],
            name: column
        })
    )

}