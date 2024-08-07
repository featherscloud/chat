// A Pinion (https://github.com/featherscloud/pinion) generator that initializes
// the chat data repository and .env environment variables file for an application.
// Run via
//    npm run init
import { renderTemplate, toFile, prompt, exec } from '@featherscloud/pinion';
import { Repo } from '@automerge/automerge-repo';
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket';

const template = ({ appId, automergeUrl }) => `VITE_CLOUD_APP_ID=${appId}
VITE_AUTOMERGE_URL=${automergeUrl}
`;

async function createAutomergeRepo(ctx) {
  const repo = new Repo({
    network: [new BrowserWebSocketClientAdapter('wss://sync.automerge.org')]
  });
  const { url } = repo.create({ messages: [], users: [] });

  return {
    ...ctx,
    automergeUrl: url
  };
}

// A `generate` export that wraps the context and renders the template
export function generate(init) {
  return Promise.resolve(init)
    .then(
      prompt({
        appId: {
          type: 'input',
          message: 'What is your Feathers Cloud App ID (did:key:...)?',
          required: true,
          validate: (value) => value.startsWith('did:key:')
        },
        framework: {
          type: 'list',
          message: 'Which framework would you like to use?',
          hint: 'This will start the development server for the chosen framework. You have to visit the webpage to finish initialization.',
          choices: ['react', 'svelte']
        }
      })
    )
    .then(createAutomergeRepo)
    .then(renderTemplate(template, toFile('react-chat/.env')))
    .then(renderTemplate(template, toFile('svelte-chat/.env')))
    .then(exec('npm run dev:svelte'));
}
