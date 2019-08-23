/**
 * This is a direct representation of what we get back from the `/repositories`
 * API call.
 */
export interface DockerHubAPIRepo {
  can_edit: boolean
  description: string
  is_automated: boolean
  is_migrated: boolean
  is_private: boolean
  last_updated: string
  name: string
  namespace: string
  pull_count: number
  repository_type: string
  star_count: number
  status: number
  user: string
}

/**
 * Enum representing the architecture defined in part of an OCI image's
 * manifest list.
 *
 * There are, of course, a shit ton of other supported architectures.
 * These are just the ones I've found to be most relevant / common.
 */
export enum Architecture {
  amd64 = 'amd64',
  arm = 'arm',
  arm64 = 'arm64',
}

type ManifestMediaType =
  | 'application/vnd.docker.distribution.manifest.v2+json'
  | 'application/vnd.docker.distribution.manifest.list.v2+json'

/**
 * Yes, there's *way* more information contained in the manifest / "fat"
 * manifestList than just architectures, but I find this to be the most
 * relevant section for my projects. PR's welcome.
 */
export interface DockerManifest {
  digest: string
  mediaType: ManifestMediaType
  platform: Array<{
    architecture: Architecture
  }>
  schemaVersion: 1 | 2 | any
}

export interface DockerHubRepo {
  // ========================
  // Main fields of interest
  // ========================
  description: string | null | undefined
  lastUpdated: Date
  manifest?: DockerManifest
  name: string
  pullCount: number
  starCount: number
  user: string

  // =============================================
  // Other stuff that comes down through the API,
  // that some may find useful
  // =============================================
  canEdit: boolean
  isAutomated: boolean
  isMigrated: boolean
  isPrivate: boolean
  namespace: string
  repositoryType: string
  status: number
}
