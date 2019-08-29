/**
 * This is a direct representation of what we get back from the `/repositories`
 * API call.
 */
export interface DockerHubAPIRepo {
  readonly can_edit: boolean
  readonly description: string
  readonly is_automated: boolean
  readonly is_migrated: boolean
  readonly is_private: boolean
  readonly last_updated: string
  readonly name: string
  readonly namespace: string
  readonly pull_count: number
  readonly repository_type: string
  readonly star_count: number
  readonly status: number
  readonly user: string
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

export enum ManifestMediaType {
  Manifest = 'application/vnd.docker.distribution.manifest.v2+json',
  ManifestList = 'application/vnd.docker.distribution.manifest.list.v2+json',
}

/**
 * Yes, there's *way* more information contained in the manifest / "fat"
 * manifestList than just architectures, but I find this to be the most
 * relevant section for my projects. PR's welcome.
 */
export interface DockerManifest {
  readonly digest: string
  readonly mediaType: ManifestMediaType
  readonly platform: Array<{
    architecture: Architecture
  }>
  readonly schemaVersion: 1 | 2 | any
}

export interface DockerHubRepo {
  // ========================
  // Main fields of interest
  // ========================
  readonly description: string | null | undefined
  readonly lastUpdated: Date
  readonly name: string
  readonly pullCount: number
  readonly starCount: number
  readonly user: string

  manifest?: DockerManifest

  // =============================================
  // Other stuff that comes down through the API,
  // that some may find useful
  // =============================================
  readonly canEdit: boolean
  readonly isAutomated: boolean
  readonly isMigrated: boolean
  readonly isPrivate: boolean
  readonly namespace: string
  readonly repositoryType: string
  readonly status: number
}
