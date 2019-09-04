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
 * Union type representing the architecture defined in part of an OCI image's
 * manifest list.
 *
 * As specified in the Docker Manifest spec, any valid GOARCH values are valid
 * image architecture values, and vice versa:
 * > The platform object describes the platform which the image in the manifest
 * > runs on. A full list of valid operating system and architecture values are
 * > listed in the Go language documentation for $GOOS and $GOARCH
 * @see https://docs.docker.com/registry/spec/manifest-v2-2/#manifest-list-field-descriptions
 */
export type Architecture =
  | '386'
  | 'amd64'
  | 'arm'
  | 'arm64'
  | 'mips'
  | 'mips64'
  | 'mips64le'
  | 'mipsle'
  | 'ppc64'
  | 'ppc64le'
  | 's390x'
  | 'wasm'

/**
 * Union type representing the OS defined in part of an OCI image's
 * manifest list.
 * See the docs for the `Architecture` type above for more info.
 */
export type OS =
  | 'aix'
  | 'android'
  | 'darwin'
  | 'dragonfly'
  | 'freebsd'
  | 'illumos'
  | 'js'
  | 'linux'
  | 'netbsd'
  | 'openbsd'
  | 'plan9'
  | 'solaris'
  | 'windows'

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
    os: OS
    architecture: Architecture
  }>
  readonly schemaVersion: 1 | 2 | any
}

export interface DockerManifestList {
  readonly manifests: DockerManifest[]
  readonly mediaType: ManifestMediaType
  readonly schemaVersion: 1 | 2 | any
}

export interface DockerHubRepo {
  // ========================
  // Main fields of interest
  // ========================
  readonly description: string | null | undefined
  // ISO8601-format string.
  readonly lastUpdated: string
  readonly name: string
  readonly pullCount: number
  readonly starCount: number
  readonly user: string

  // Manifest type *may* be nested within this interface, but is usually
  // fetched and returned separately.
  readonly manifestList?: DockerManifestList

  // =============================================
  // Other stuff that comes down through the API,
  // that some may find useful
  // =============================================
  readonly canEdit?: boolean
  readonly isAutomated?: boolean
  readonly isMigrated?: boolean
  readonly isPrivate?: boolean
  readonly namespace?: string
  readonly repositoryType?: string
  readonly status?: number
}
