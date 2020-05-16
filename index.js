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
    const projectPath = `./projects/${project}`;
    let metadataPath = `${projectPath}/metadata.json`;
    let cards = fs.readdirSync(projectPath).filter(f => f != "metadata.json");
    let metadata = JSON.parse(fs.readFileSync(metadataPath));
    let numberOfCards =  cards.length;
    console.log(`${project} has ${numberOfCards} card(s)`);

    let gh_project = await octo.projects.createForRepo({
        owner: OWNER,
        repo: REPO,
        name: metadata['name'],
        body: metadata['description']
    })
    const columns = createColumnsSync(gh_project['data'], metadata['columns']);
    console.log(columns)
    const firstColumn = columns[0]['data']['id'];
    await createCards(firstColumn,projectPath, cards);
    
})

function createColumnsSync(project, columnNames) {
    console.log(`Creating columns for ${project["id"]}/${project["name"]}`)
    let columns = []
    columnNames.forEach(
        columnName => {
            let createdColumn = octo.projects.createColumn({
                    project_id: project["id"],
                    name: columnName
                })
                
            columns.push(createdColumn.resolve())
        }
    )
    return columns;
}

async function createCards(firstColumn, projectPath, cards) {
    return Promise.all(cards.map(card_path => {
        const content = fs.readFileSync(`${projectPath}/${card_path}`, 'utf8');
        octo.projects.createCard({
            column_id: firstColumn,
            note: content
        })
    }))
}
