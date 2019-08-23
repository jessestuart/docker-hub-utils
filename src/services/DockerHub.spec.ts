import axios from 'axios'
import _ from 'lodash'
import fp from 'lodash/fp'
import fixture from '../__tests__/fixtures.json'
import manifestFixture from '../__tests__/manifest_fixture.json'
import { DockerHubRepo } from '../types/DockerHubRepo'
import {
  extractRepositoryDetails,
  fetchManifestList,
  queryTopRepos,
} from './DockerHub'

const get = jest.spyOn(axios, 'get')

const fixtureLength = _.size(fixture.data.results)

describe('DockerHub handler', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('extractRepositoryDetails', () => {
    const repositoryDetails = extractRepositoryDetails(fixture)
    expect(repositoryDetails).toHaveLength(fixtureLength)
    const keys = [
      'description',
      'lastUpdated',
      'name',
      'pullCount',
      'starCount',
    ]

    keys.forEach((key: string) => expect(_.every(repositoryDetails, key)))
  })

  test('queryTopRepos', async () => {
    get.mockResolvedValue(fixture)

    const topRepos: DockerHubRepo[] = await queryTopRepos('jessestuart')

    expect(get).toHaveBeenCalledTimes(1)
    expect(topRepos).toHaveLength(fixtureLength)
    expect(_.sumBy(topRepos, 'pullCount')).toBe(1718496)

    const topRepoName = _.flow(
      fp.first,
      fp.get('name'),
    )(topRepos)
    expect(topRepoName).toBe('owntracks')
  })

  test('fetchManifestList', async () => {
    get.mockResolvedValueOnce({ data: { token: 'FAKE_TOKEN' } })
    get.mockResolvedValueOnce(manifestFixture)

    const topRepo = _.first(extractRepositoryDetails(fixture))
    if (!topRepo) {
      fail('Unable to load repos fixture.')
      return
    }

    const manifestList = await fetchManifestList(topRepo)
    expect(get).toHaveBeenCalledTimes(2)
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

    expect(manifestList).toEqual([
      {
        digest:
          'sha256:d0593f2bf35b854611dda94b5210243f8473847150d1709b12163453841bf5f8',
        mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
        platform: { architecture: 'amd64', os: 'linux' },
        schemaVersion: 2,
      },
      {
        digest:
          'sha256:0ec4c38328ab0e0b8798c28384fd44bab385b8313b13aa8f494e940e83a12d69',
        mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
        platform: { architecture: 'arm', os: 'linux' },
        schemaVersion: 2,
      },
      {
        digest:
          'sha256:72d730063d55fa164378188f92119e00769dbc759f95cbf1319705e90d6214ea',
        mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
        platform: { architecture: 'arm64', os: 'linux' },
        schemaVersion: 2,
      },
    ])
  })
})
