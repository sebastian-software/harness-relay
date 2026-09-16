# Releasing

`harness-relay` releases are automated. Nothing is published by hand.

## First usable public release

The target for the first usable public release is **0.1.0**, retaining the
Developer Preview scope in [ADR-0007](adr/0007-typescript-and-unix-first.md).
The existing npm version `0.0.0` reserves the package name and contains no CLI.

The release must provide a working CLI and installable skills for general
delegation, an independent second opinion, and a review with multiple models
from public sources. Documented installation steps are sufficient; a custom
installer is not a release requirement. The skill boundary is recorded in
[ADR-0023](adr/0023-ship-caller-side-delegation-and-workflow-skills.md).

The current version bootstrap described below must be reconciled with this
target before the release pull request is finalized.

## First-release acceptance

The release candidate must pass the repository's existing macOS and Linux
checks and demonstrate the following:

- The packed CLI installs and runs outside the development checkout, with all
  required runtime files included.
- All three skills are discoverable and usable in Claude Code and Codex through
  documented installation steps. The documentation identifies the public skill
  source and version as well as Node.js, harness installation, and native login
  prerequisites.
- Real Claude and Codex invocations exercise the delegation path. Second-opinion
  and multi-model review reports identify their contributors, retain differing
  findings, and expose failed or incomplete contributions.
- Regression checks cover process cleanup after errors, incomplete native
  output, policy argument mapping, and configured model aliases.
- The generated release candidate consistently identifies version `0.1.0`, and
  npm Trusted Publishing is configured for the actual repository and workflow.

After publication, repeat the documented installation from the public npm
registry and the versioned public skill source. Successful tests against a local
tarball alone do not establish public installability.

## How a release happens

1. Every pull request lands with a Conventional Commit title. CI checks the
   title, because release-please derives the next version and the changelog
   entry from the squashed commit.
2. On every push to `main`, `.github/workflows/publish.yml` runs release-please.
   It maintains a single release pull request that bumps `package.json`,
   regenerates `src/version.ts` and prepends a `CHANGELOG.md` entry.
3. Merging that pull request creates the tag (`v<version>`) and the GitHub
   Release, and the same workflow then publishes the tag to npm with
   `pnpm publish --provenance --access public`.

The publish job checks out the release tag, never `main`, and runs `pnpm check`
before publishing.

## Configuration the automation depends on

- **npm Trusted Publishing** for `harness-relay`, bound to this repository and
  the `publish.yml` workflow, with the `npm-release` environment. Configuring
  it is the repository owner's one manual step. The job requests an OIDC token
  (`id-token: write`) and consumes no `NPM_TOKEN`. Until Trusted Publishing is
  configured, the publish step fails at authentication; the release itself is
  unaffected and the publish can be retried afterwards.
- **`RELEASE_PLEASE_TOKEN`** (optional). Events created with the built-in
  `GITHUB_TOKEN` do not start new workflow runs, so without this token the
  release pull request has no CI checks. Everything else works.

## Retrying a failed publish

Dispatch `publish.yml` manually with the release tag, for example `v0.1.1`. The
manual path skips release-please, checks out that tag and republishes it, so a
delayed retry can never publish newer sources under a version that already
exists.

## Version bootstrap

The committed manifest currently records `0.1.0` even though that version has
never been published. Release Please interprets this as a previous release,
which lets the breaking rename advance the release candidate to `1.0.0`.

The required first-release correction is pending implementation:

1. Start with an empty manifest and set `initial-version` explicitly to `0.1.0`
   in the release configuration.
2. Remove the old `bootstrap-sha` and reconcile the hand-written changelog entry
   with the first actual release.
3. Regenerate the release candidate and verify that it contains one `0.1.0`
   release, consistent package and runtime versions, and the intended CLI and
   skill artifacts.
4. Merge the verified release pull request through the normal automated path.

The shared [Release Please reference](https://github.com/sebastian-software/standards/tree/main/reference/release-please)
provides the single-product release pattern. The pinned Release Please version
supports the explicit initial version; do not rely on an implicit default.
