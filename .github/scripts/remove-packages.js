const { Octokit } = require('@octokit/rest');

const removePackageVersions = async (imageUrl, imageVersions) => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const [_imageHost, imageOwner, imageName] = imageUrl.split("/");
  const imageIds = await loadVersionIds(octokit, imageOwner, imageName, imageVersions);

  console.log(imageUrl, imageVersions, imageIds);
  for (const imageId of imageIds) {
    await octokit.rest.packages.deletePackageVersionForUser({
      package_type: 'container',
      package_name: imageName,
      username: imageOwner,
      package_version_id: imageId,
    });
  }
}

const loadVersionIds = async (octokit, imageOwner, imageName, versions) => {
  let page = 0;
  versions = new Set(versions);

  const ids = new Set();
  while (versions.size > 0) {
    const response = await octokit.rest.packages.getAllPackageVersionsForPackageOwnedByUser({
      package_type: 'container',
      package_name: imageName,
      username: imageOwner,
      page,
    });
    console.log(response)
    for (const entry of response.data) {
      if (versions.delete(entry.name)) {
        ids.add(entry.id);
      }
    }
    page += 1;
  }
  return ids;
}

module.exports = {
  removePackageVersions,
}
