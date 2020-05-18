require 'octokit'
require 'json'

client = Octokit::Client.new(:access_token => ENV["GITHUB_TOKEN"])
ownerRepoSlug = ENV.key?("GITHUB_REPOSITORY") ? ENV["GITHUB_REPOSITORY"] : "JakeHendy/onboarding-repo"
owner = ownerRepoSlug.split('/')[0]
repository = ownerRepoSlug.split('/')[1]

projectList = Dir.children("projects")
for project in projectList do
    puts "Creating #{project}"
    metadata_file = File.open("projects/#{project}/metadata.json")
    metadata = JSON.load metadata_file
    metadata_file.close
    puts "#{metadata["name"]}"
    gh_project = client.create_project(ownerRepoSlug, metadata["name"], body: metadata["description"])
    puts "Created #{gh_project['id']}"
    firstColumnId = ""
    # create columns
    metadata["columns"].each {
        |column| client.create_project_column(
            gh_project["id"],
            column
        )
    }
    columns = client.project_columns(gh_project["id"])
    first_column = columns.select { |c| c["name"] == metadata["columns"][0]}[0]
    puts "First column (#{first_column["name"]}) has id #{first_column["id"]}"

end