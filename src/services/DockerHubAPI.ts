import axios from 'axios'
import camelcaseKeys from 'camelcase-keys'
import { DateTime } from 'luxon'
import R from 'ramda'
import log from '../utils/log'

import {
  DockerHubAPIRepo,
  DockerHubRepo,
  DockerManifestList,
} from '../types/DockerHubRepo'
import {
  DOCKER_HUB_API_AUTH_URL,
  DOCKER_HUB_API_ROOT,
} from '../utils/constants'

/**
 * Currently only supports fetching the manifest for the `latest` tag; in
 * reality, we can pass any valid content digest[1] to retrieve the manifest(s)
 * for that image.
 *
 * [1]: https://github.com/opencontainers/distribution-spec/blob/master/spec.md#content-digests
 */
const createManifestListURL = (repo: DockerHubRepo): string =>
  `https://registry-1.docker.io/v2/${repo.user}/${repo.name}/manifests/latest`

const createUserReposListURL = (user: string): string =>
  `${DOCKER_HUB_API_ROOT}repositories/${user}`

/**
 * The OCI distribution spec requires a unique token for each repo manifest queried.
 */
export const fetchDockerHubToken = async (
  repo: DockerHubRepo,
): Promise<string> => {
  const { name, user } = repo
  const tokenRequest = await axios.get(DOCKER_HUB_API_AUTH_URL, {
    params: {
      scope: `repository:${user}/${name}:pull`,
      service: 'registry.docker.io',
    },
  })

  const token: string | undefined = R.path(['data', 'token'], tokenRequest)
  if (!token) {
    throw new Error('Unable to retrieve auth token from registry.')
  }
  return token
}

/**
 * Pure function that massages the Docker Hub API response into the
 * format we want to return. e.g., only extracting certain fields;
 * converting snake_case to camelCase, etc.
 */
export const extractRepositoryDetails = (
  repos: DockerHubAPIRepo[],
  lastUpdatedSince?: DateTime,
): DockerHubRepo[] => {
  if (!repos || R.isEmpty(repos)) {
    return []
  }
  const parsedRepos: DockerHubRepo[] = camelcaseKeys(repos).map(repo => {
    const lastUpdated: string | undefined = R.path(['lastUpdated'], repo)
    const lastUpdatedDateTime = lastUpdated
      ? DateTime.fromISO(lastUpdated).toUTC()
      : null
    return ({
      ...repo,
      lastUpdated: lastUpdatedDateTime,
    } as unknown) as DockerHubRepo
  })

  return R.isNil(lastUpdatedSince)
    ? parsedRepos
    : parsedRepos.filter(repo => repo.lastUpdated > lastUpdatedSince)
}

/**
 * Top-level function for querying repositories.
 * @param user The Docker Hub username or org name to query for.
 */
export const queryTopRepos = async ({
  lastUpdatedSince,
  numRepos = 100,
  user,
}: {
  lastUpdatedSince?: DateTime
  numRepos?: number
  user: string
}): Promise<DockerHubRepo[]> => {
  if (numRepos > 100) {
    throw new RangeError('Number of repos to query cannot exceed 100.')
  }

  const listReposURL = createUserReposListURL(user)
  const repos = await axios.get(listReposURL, {
    params: { page: 1, page_size: numRepos },
  })

  const repoResults: DockerHubAPIRepo[] = R.path(
    ['data', 'results'],
    repos,
  ) as DockerHubAPIRepo[]

  return extractRepositoryDetails(repoResults, lastUpdatedSince)
}

/**
 * Queries the Docker Hub API to retrieve a "fat manifest", an object of
 * `Content-Type` `application/vnd.docker.distribution.manifest.list.v2+json/`.
 * Read up on the Manifest v2, Schema 2 Spec in more detail:
 * @see https://github.com/docker/distribution/blob/master/docs/spec/manifest-v2-2.md
 * Or the shiny new OCI distribution spec which builds on it:
 * @see https://github.com/opencontainers/distribution-spec/blob/f67bc11ba3a083a9c62f8fa53ad14c5bcf2116af/spec.md
 */
export const fetchManifestList = async (
  repo: DockerHubRepo,
): Promise<DockerManifestList | undefined> => {
  // Docker Hub requires a unique token for each repo manifest queried.
  const token = await fetchDockerHubToken(repo)

  const manifestListURL = createManifestListURL(repo)
  const manifestListResponse = await axios.get(manifestListURL, {
    headers: {
      Accept: 'application/vnd.docker.distribution.manifest.list.v2+json',
      Authorization: `Bearer ${token}`,
    },
  })
  // For now, just ignore legacy V1 schema manifests. They have an entirely
  // different response shape and it's not worth mucking up the schema to
  // support a legacy format.
  if (manifestListResponse.data.schemaVersion === 1) {
    log.info('Schema version 1 is unsupported.', repo.name)
    return
  }

  return R.path(['data'], manifestListResponse)
}
