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
        body: metadata['description']
    })
    const columns = await createColumns(gh_project['data'], metadata['columns']);
    console.log(columns)
    const firstColumn = columns[0]['data']['id'];
    await createCards(firstColumn, cards);
    
})

async function createColumns(project, columns) {
    console.log(`Creating columns for ${project["id"]}/${project["name"]}`)
    return columns.map(async column =>
        octo.projects.createColumn({
            project_id: project["id"],
            name: column
        })
    )
}
async function createCards(firstColumn, cards) {
    return Promise.all(cards.map(async card_path => {
        const content = fs.readFileSync(card_path);
        octo.projects.createCard({
            column_id: firstColumn,
            note: content
        })
    }))
}
