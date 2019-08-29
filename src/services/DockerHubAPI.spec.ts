import axios from 'axios'
import R from 'ramda'

import manifestFixture from '../__tests__/manifest_fixture.json'
import fixture from '../__tests__/repos_fixture.json'
import { DockerHubRepo } from '../types/DockerHubRepo'
import {
  extractRepositoryDetails,
  fetchManifestList,
  queryTopRepos,
} from './DockerHubAPI'

const get = jest.spyOn(axios, 'get').mockResolvedValue({})

const repoFixtures = fixture.data.results

describe('DockerHub handler', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('extractRepositoryDetails for a non-existant repo', () => {
    const repositoryDetails = extractRepositoryDetails([])
    expect(repositoryDetails).toHaveLength(0)
  })

  test('extractRepositoryDetails happy path', () => {
    const repoResults = repoFixtures
    const repositoryDetails = extractRepositoryDetails(repoResults)
    expect(repositoryDetails).toHaveLength(R.length(repoResults))
    const keys = [
      'description',
      'lastUpdated',
      'name',
      'pullCount',
      'starCount',
    ]

    // Verify values are defined for each of the above keys.
    repositoryDetails.forEach(repo => {
      keys.forEach((key: string) => {
        expect(repo).toHaveProperty(key)
      })
    })
  })

  test('queryTopRepos', async () => {
    // Configure axios to return our fixtures, rather than hitting the API.
    get.mockResolvedValueOnce(fixture)

    const topRepos: DockerHubRepo[] = await queryTopRepos('jessestuart')

    // Only one HTTP call required -- no auth needed when querying repos.
    expect(get).toHaveBeenCalledTimes(1)
    expect(topRepos).toHaveLength(R.length(repoFixtures))

    const totalPulls = R.sum(R.pluck('pullCount', topRepos))
    expect(totalPulls).toMatchSnapshot()

    const topRepoName = R.pipe(
      R.head,
      R.path(['name']),
    )(topRepos)

    expect(topRepoName).toBe('owntracks')
  })

  test('fetchManifestList happy path.', async () => {
    get.mockResolvedValueOnce({ data: { token: 'FAKE_TOKEN' } })
    get.mockResolvedValueOnce(manifestFixture)

    const topRepo: DockerHubRepo = R.head(
      extractRepositoryDetails(repoFixtures),
    )
    if (!topRepo) {
      fail('Unable to load repos fixture.')
      return
    }

    const manifestList = await fetchManifestList(topRepo)
    expect(get).toHaveBeenCalledTimes(2)
    expect(get.mock.calls).toMatchSnapshot()
    expect(get).toHaveBeenNthCalledWith(1, 'https://auth.docker.io/', {
      params: {
        scope: 'repository:jessestuart/owntracks:pull',
        service: 'registry.docker.io',
      },
    })
    expect(get).toHaveBeenNthCalledWith(
      2,
      'https://registry-1.docker.io/v2/jessestuart/owntracks/manifests/latest',
      {
        headers: {
          Accept: 'application/vnd.docker.distribution.manifest.list.v2+json',
          Authorization: 'Bearer FAKE_TOKEN',
        },
      },
    )

    expect(manifestList).toMatchSnapshot()
  })

  test('fetchManifestList fails when no token returned.', async () => {
    get.mockResolvedValueOnce({ data: {} })
    get.mockResolvedValueOnce(manifestFixture)

    const topRepo = R.head(extractRepositoryDetails(repoFixtures))
    if (!topRepo) {
      fail('Unable to load repos fixture.')
      return
    }

    expect(fetchManifestList(topRepo)).rejects.toThrow()
    expect(get).toHaveBeenCalledTimes(1)
  })
})
