import axios from 'axios'
import camelcaseKeys from 'camelcase-keys'
import { DateTime } from 'luxon'
import R from 'ramda'
import log from '../utils/log'

import {
  DockerHubAPIRepo,
  DockerHubRepo,
  DockerManifestList,
  Tag,
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
const createManifestListURL = ({ repo }: { repo: DockerHubRepo }): string =>
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

  const parsedRepos: DockerHubRepo[] = (camelcaseKeys(
    repos,
  ) as unknown) as DockerHubRepo[]

  if (R.isNil(lastUpdatedSince)) {
    return parsedRepos
  }

  return parsedRepos.filter(
    repo => DateTime.fromISO(repo.lastUpdated) < lastUpdatedSince,
  )
}

/**
 * Query a single repository given a repo name and username.
 *
 * @param user The DockerHub username or org name to query for.
 * @param name The DockerHub repo name -- restrict to this single repo.
 */
export const queryRepo = async ({
  name,
  user,
}: {
  name: string
  user: string
}): Promise<DockerHubRepo | undefined> => {
  const repoResult = await axios.request({
    url: `${DOCKER_HUB_API_ROOT}repositories/${user}/${name}/`,
  })
  const repo: DockerHubRepo | undefined = R.prop('data', repoResult)
  if (repoResult.status !== 200 || !repo || R.isEmpty(repo)) {
    return
  }
  return (camelcaseKeys(repo) as unknown) as DockerHubRepo
}

/**
 * Top-level function for querying repositories.
 *
 * @TODO Rename to just `queryRepos`.
 *
 * @param user The DockerHub username or org name to query for.
 * @param numRepos The number of repos to query (max 100).
 * @param lastUpdatedSince Filter by the DateTime at which a repo was last updated.
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
  const repoResults = await axios.get(listReposURL, {
    params: { page: 1, page_size: numRepos },
  })
  const repos: DockerHubAPIRepo[] = R.path(
    ['data', 'results'],
    repoResults,
  ) as DockerHubAPIRepo[]

  return extractRepositoryDetails(repos, lastUpdatedSince)
}

/**
 * Query image tags.
 */
export const queryTags = async (repo: DockerHubRepo): Promise<Tag[]> => {
  const repoUrl = createUserReposListURL(repo.user)
  const tagsUrl = `${repoUrl}/${repo.name}/tags?page_size=100`
  const tagsResults = await axios.get(tagsUrl)
  const tags = R.path(['data', 'results'], tagsResults)
  // @ts-ignore
  return tags && !R.isEmpty(tags) ? camelcaseKeys(tags) : []
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

  const manifestListURL = createManifestListURL({ repo })
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
