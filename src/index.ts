import {
  Architecture,
  DockerHubAPIRepo,
  DockerHubRepo,
  DockerManifest,
  DockerManifestList,
  ManifestMediaType,
  Tag,
} from './types/DockerHubRepo'

import {
  extractRepositoryDetails,
  fetchDockerHubToken,
  fetchManifestList,
  queryTags,
  queryTopRepos,
} from './services/DockerHubAPI'

export {
  Architecture,
  DockerHubAPIRepo,
  DockerHubRepo,
  DockerManifest,
  DockerManifestList,
  ManifestMediaType,
  Tag,
}

export {
  extractRepositoryDetails,
  fetchDockerHubToken,
  fetchManifestList,
  queryTags,
  queryTopRepos,
}
