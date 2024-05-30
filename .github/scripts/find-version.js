const findNextVersion = (tags, branch) => {
  const version = findMostRecentVersion(tags);
  if (branch.startsWith('feature/')) {
    // It's a minor feature.

    // If the previous version was a full release or a patch dev release,
    // we are a completely new minor dev release.
    // Otherwise, the previous version was itself a minor dev release,
    // and we can reuse its number.
    if (version.preRelease == null || version.patch !== 0) {
      version.minor += 1;
      version.patch = 0;
    }
  } else {
    // It's a patch.

    // If the previous version was a full release,
    // we are a completely new patch dev release.
    // Otherwise, we can simply reuse the previous version's number.
    if (version.preRelease == null) {
      version.patch += 1;
    }
  }

  version.preRelease ??= 0;
  version.preRelease += 1;
  return version;
};

const findMostRecentVersion = (tags) => {
  const SEMANTIC_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-dev\d+)?$/;
  const versions = tags
    .filter((tag) => SEMANTIC_VERSION_PATTERN.test(tag))
    .map((tag) => tag.split(/[.\-]/))
    .map(([major, minor, patch, preRelease]) => ({
      major: parseInt(major),
      minor: parseInt(minor),
      patch: parseInt(patch),
      preRelease: preRelease && parseInt(preRelease.substring(3)),
    }))
    .sort((a, b) => {
      if (a.major !== b.major) {
        return b.major - a.major;
      }
      if (a.minor !== b.minor) {
        return b.minor - a.minor;
      }
      if (a.patch !== b.patch) {
        return b.patch - a.patch;
      }
      if (a.preRelease !== b.preRelease) {
        if (a.preRelease == null) {
          return 1;
        }
        if (b.preRelease == null) {
          return -1;
        }
        return a.preRelease - b.preRelease;
      }
      return 0;
    });

  if (versions.length === 0) {
    throw new Error('unable to find a valid version on current edge tag');
  }
  return versions[0];
};

module.exports = {
  findNextVersion,
  findMostRecentVersion,
}
