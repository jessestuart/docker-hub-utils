import axios from 'axios'
import _ from 'lodash'
import fp from 'lodash/fp'

import { DockerHubAPIRepo, DockerHubRepo } from '../types/DockerHubRepo'
import {
  DOCKER_HUB_API_AUTH_URL,
  DOCKER_HUB_API_ROOT,
} from '../utils/constants'

// NOTE: Arbitrarily chosen # of repos to query. This should be
//       parameterized and allow pagination.
const NUM_REPOS_TO_ANALYZE = 30

/**
 * Currently only supports fetching the manifest for the `latest` tag; in
 * reality, we can pass any valid content digest[1] to retrieve the manifest(s)
 * for that image.
 *
 * [1]: https://github.com/opencontainers/distribution-spec/blob/master/spec.md#content-digests
 */
const createManifestListURL = (repo: DockerHubRepo) =>
  `https://registry-1.docker.io/v2/${repo.user}/${repo.name}/manifests/latest`

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
  const token: string | undefined = _.get(tokenRequest, 'data.token')
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
export const extractRepositoryDetails = _.flow(
  fp.get('data.results'),
  fp.map(fp.mapKeys(fp.camelCase)),
) as (repos: any) => DockerHubRepo[]

/**
 * Top-level function for querying repositories.
 * @param user The Docker Hub username or org name to query for.
 */
export const queryTopRepos = async (user: string): Promise<DockerHubRepo[]> => {
  const repos: DockerHubAPIRepo[] = await axios.get(
    `${DOCKER_HUB_API_ROOT}${user}`,
    {
      params: { page: 1, page_size: NUM_REPOS_TO_ANALYZE },
    },
  )

  const parsedRepos: DockerHubRepo[] = extractRepositoryDetails(repos)
  return parsedRepos
}

/**
 * Queries the Docker Hub API to retrieve a "fat manifest", an object of
 * `Content-Type` `application/vnd.docker.distribution.manifest.list.v2+json/`.
 * Read up on the Manifest v2, Schema 2 Spec in more detail:
 * @see https://github.com/docker/distribution/blob/master/docs/spec/manifest-v2-2.md
 * Or the shiny new OCI distribution spec which builds on it:
 * @see https://github.com/opencontainers/distribution-spec/blob/f67bc11ba3a083a9c62f8fa53ad14c5bcf2116af/spec.md
 */
export const fetchManifestList = async (repo: DockerHubRepo) => {
  // Docker Hub requires a unique token for each repo manifest queried.
  const token = await fetchDockerHubToken(repo)

  const manifestListURL = createManifestListURL(repo)
  const manifestList = await axios.get(manifestListURL, {
    headers: {
      Accept: 'application/vnd.docker.distribution.manifest.list.v2+json',
      Authorization: `Bearer ${token}`,
    },
  })

  const schemaVersion = _.get(manifestList, 'schemaVersion')

  return _.get(manifestList, 'manifests').map((manifest: unknown) => ({
    ..._.pick(manifest, ['digest', 'mediaType', 'platform']),
    schemaVersion,
  }))
}
