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

projects.forEach(projectName => {
            const projectPath = `./projects/${projectName}`;
            let metadataPath = `${projectPath}/metadata.json`;
            let cards = fs.readdirSync(projectPath).filter(f => f != "metadata.json");
            let metadata = JSON.parse(fs.readFileSync(metadataPath));
            let numberOfCards =  cards.length;
            console.log(`${projectName} has ${numberOfCards} card(s)`);
        
            octo.projects.createForRepo({
                owner: OWNER,
                repo: REPO,
                name: metadata['name'],
                body: metadata['description']
            }).then(
                ghProject => createColumns(ghProject["data"], metadata['columns'])
                )
            .then(
                ghColumns => createCards(ghColumns[0]["data"]["id"], cards)
                )
        }
    )

function createColumns(project, columns) {
    console.log(`Creating columns for ${project["id"]}/${project["name"]}`)
    return Promise.all(columns.map(columnName => {
        return octo.projects.createColumn({
            project_id: project["id"],
            name: columnName
        })
    }))
}

function createCards(firstColumn, cards) {
    return Promise.all(cards.map(card_path => {
        const content = fs.readFileSync(`${projectPath}/${card_path}`, 'utf8');
        return octo.projects.createCard({
            column_id: firstColumn,
            note: content
        })
    }))
}