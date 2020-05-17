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
    puts client.create_project(ownerRepoSlug, metadata["name"])

end