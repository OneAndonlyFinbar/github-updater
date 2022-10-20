# github-updater

Simple single file process which watches for github updates and pulls most recent version on push to provided branch.

# Setup
Make sure you already have a git repository loaded in your current working directory and that it has a remote branch.

`puller.js`
```ts
import { RepoWatcher } from './dist/RepoWatcher.js';
new RepoWatcher({
  webhookSecret: '', // Github webhook secret
  branch: '', // Github branch to watch
  port: 3000, // Port to host local api on
  directory: '', // Local directory to pull into
  pullScript: '' // Custom git pull script if necessary
})
```
