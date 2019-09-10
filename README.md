<p align="center">
  <a href="https://github.com/jessestuart/docker-hub-utils">
    <img
      src="https://github.com/jessestuart/docker-hub-utils/blob/master/assets/nodejs-docker.png?raw=true"
      width="50%"
    />
  </a>
</p>
<h1 align="center">
  docker-hub-utils
</h1>

[![CircleCI][circleci-badge]][circleci-link] [![npm][npm-badge]][npm-link]
[![codecov][codecov]][codecov 2]

### What is this?

The `docker-hub-utils` package provides utilities functions wrapping the Docker
Hub API, which provides only trivial support for filtering queries, and can be
quite verbose when e.g., fetching [Manifest Lists][docker] to determine which
architectures a given image supports.

This was primarily designed to be used in the implementation of the
[`docker-hub-graphql-api`][github 2] project, which provides a convenient
GraphQL abstraction layer over Docker Hub's REST API; but may also be used as a
standalone utility library.

---

### Currently supported operations

- Querying top repos by username / organization name.
- Filtering top user / org repositories by date last updated; this is useful
  when you're only interested in repositories that have been updated in the past
  `N` months / years / etc, a feature missing from the native API.
- Fetching Manifest Lists for any repository image in a single function call,
  abstracting away the bearer token authentication dance.

You can see examples of these operations in use within the
[`docker-hub-graphql-api`][github 2] project, or in this project's test cases.

[circleci-badge]:
  https://circleci.com/gh/jessestuart/docker-hub-utils.svg?style=shield
[codecov]:
  https://codecov.io/gh/jessestuart/docker-hub-utils/branch/master/graph/badge.svg
[circleci-link]: https://circleci.com/gh/jessestuart/docker-hub-utils
[codecov 2]: https://codecov.io/gh/jessestuart/docker-hub-utils
[docker]: https://docs.docker.com/registry/spec/manifest-v2-2/
[github]: https://github.com/jessestuart/multiar.ch
[github 2]: https://github.com/jessestuart/docker-hub-graphql-api
[npm-badge]: https://img.shields.io/npm/v/docker-hub-utils.svg
[npm-link]: https://www.npmjs.com/package/docker-hub-utils
