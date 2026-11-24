# Contributing

Improvements from other masajid are very welcome: bug fixes, translations, new features, better docs.

1. Open an issue first for anything bigger than a small fix, so we can agree the approach.
2. Fork, make your change on a branch, and run `pnpm typecheck` and `pnpm test`.
3. If you changed collections or fields, add a migration: `pnpm payload migrate:create short-description`
   and check the generated SQL.
4. Keep anything specific to your masjid (names, addresses, bank details, logos) out of the code. It belongs in the
   admin panel or your own fork.
5. Open a pull request describing what changed and why, with a screenshot for visual changes.

Please be kind and patient in issues and reviews: most people here volunteer for their masjid in their spare time.
