require 'octokit'
require 'json'

stack = Faraday::RackBuilder.new do |builder|
    builder.use Faraday::Request::Retry, exceptions: [Octokit::ServerError]
    builder.use Octokit::Middleware::FollowRedirects
    builder.use Octokit::Response::RaiseError
    builder.use Octokit::Response::FeedParser
    builder.response :logger
    builder.adapter Faraday.default_adapter
end
Octokit.middleware = stack

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

    cards = Dir.children("projects/#{project}").filter { |c| c != "metadata.json"}.sort

    for card in cards do 
        card_file = File.open("projects/#{project}/#{card}")
        title = card_file.readline.split('# ')[1]
        body = card_file.read
        gh_issue = client.create_issue(ownerRepoSlug, title, body, :accept => "application/vnd.github.inertia-preview+json")
        puts "#{gh_issue}"
        card_file.close
        gh_card = client.create_project_card(gh_project["id"], content_id: gh_issue["id"], content_type: "Issue")
        
    end
    
end