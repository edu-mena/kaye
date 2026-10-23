// Commit messages follow Conventional Commits: "type(scope): summary".
// Types and scopes are explained in docs/engenharia.md.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert', 'security'],
    ],
    'scope-enum': [1, 'always', ['api', 'web', 'android', 'admin', 'db', 'docker', 'ci', 'docs', 'deps', 'security', 'scrapers']],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
}
