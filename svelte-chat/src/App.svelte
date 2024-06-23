<script lang="ts">
  import {
    type AnyDocumentId,
    Repo,
    type Doc
  } from '@automerge/automerge-repo';
  import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket';
  import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb';

  import {
    LoginRequiredError,
    createClient,
    createVerifier
  } from '@featherscloud/auth';

  import type { ChatDocument, CloudAuthUser, Message, User } from './utils.js';
  import { formatDate, sha256 } from './utils.js';
  import { afterUpdate } from 'svelte';

  // Initialize Feathers Cloud Auth
  const appId = 'did:key:z6MkrKFRttVTWvf7SkHCThevJik8774WuTgxUuPoX4onXN7B';
  const auth = createClient({ appId });
  const verifier = createVerifier({ appId });

  // Initialize Automerge
  const repo = new Repo({
    network: [new BrowserWebSocketClientAdapter('wss://sync.automerge.org')],
    storage: new IndexedDBStorageAdapter()
  });
  // console.log(repo.create<ChatDocument>({ messages: [], users: [] }).url);
  const automergeUrl =
    'automerge:3FN6EHp9HUdWn6qwqouqgDmprCrV' as AnyDocumentId;
  const handle = repo.find<ChatDocument>(automergeUrl);

  console.log(
    repo.create({
      messages: [],
      users: []
    }).url
  );

  let ready = false;
  let cloudAuthUser: CloudAuthUser | null = null;
  let user: User | null = null;
  let messages: Message[] = [];
  let users: User[] = [];
  let text: string = '';

  const getUserById = (id: string) => users.find((user) => user.id === id);

  const init = async () => {
    try {
      // Get Feathers Cloud Auth access token
      const accessToken = await auth.getAccessToken();
      // Verify our token (this will redirect to the login screen if necessary)
      const { user: verifiedUser } = await verifier.verify(accessToken);
      const loadDocument = (doc?: Doc<ChatDocument>) => {
        if (doc) {
          user =
            doc.users.find((user) => user.id === cloudAuthUser?.id) || null;
          messages = doc.messages;
          users = doc.users;
        }
        ready = true;
      };

      cloudAuthUser = verifiedUser;
      // Update application data when document changes
      handle.on('change', ({ doc }) => loadDocument(doc));
      // Initialise the document if it is already available
      if (handle.isReady()) {
        loadDocument(await handle.doc());
      }
    } catch (error) {
      // Redirect to Feathers Cloud Auth login
      if (error instanceof LoginRequiredError) {
        window.location.href = error.loginUrl;
      }
      throw error;
    }
  };

  // Sets the current user's username and stores it in the document
  const createUser = async (ev: Event) => {
    const formElement = ev.target as HTMLFormElement;
    const input: string = formElement.username.value;
    const username = input.trim().toLowerCase();
    const existingUser = users.find((user) => user.id === cloudAuthUser?.id);

    ev.preventDefault();

    if (existingUser) {
      user = existingUser;
    } else if (users.find((user) => user.username === username)) {
      alert('Username already taken, please choose another one');
    } else {
      const emailHash = await sha256(cloudAuthUser?.email || 'unknown');

      handle.change((doc) => {
        if (cloudAuthUser !== null) {
          doc.users.push({
            id: cloudAuthUser.id,
            avatar: `https://www.gravatar.com/avatar/${emailHash}`,
            username
          });
        }
      });
    }
  };

  const createMessage = (ev: Event) => {
    ev.preventDefault();

    handle.change((doc) => {
      if (user !== null) {
        doc.messages.push({
          id: crypto.randomUUID(),
          text: text,
          createdAt: Date.now(),
          userId: user.id
        });
        text = '';
      }
    });
  };

  afterUpdate(() => {
    document
      .getElementById('message-end')
      ?.scrollIntoView({ behavior: 'smooth' });
  });

  init();
</script>

<main>
  {#if ready}
    {#if user === null}
      <div
        class="login flex min-h-screen bg-neutral justify-center items-center"
      >
        <div class="card w-full max-w-sm bg-base-100 px-4 py-8 shadow-xl">
          <div class="px-4">
            <h1
              class="text-3xl font-bold text-center my-5 bg-clip-text bg-gradient-to-br"
            >
              Pick a username
            </h1>
          </div>
          <form class="card-body pt-2" on:submit={createUser}>
            <div class="form-control">
              <label for="username" class="label"
                ><span class="label-text">Your username</span></label
              >
              <input type="text" name="username" class="input input-bordered" />
            </div>
            <div class="form-control mt-6">
              <button id="login" type="submit" class="btn"
                >Start chatting</button
              >
            </div>
          </form>
        </div>
      </div>
    {/if}

    {#if user !== null}
      <div class="drawer drawer-mobile">
        <input id="drawer-left" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content flex flex-col">
          <div class="navbar w-full">
            <div class="navbar-start">
              <label
                for="drawer-left"
                class="btn btn-square btn-ghost lg:hidden drawer-button"
              >
                <i class="i-feather-menu text-lg"></i>
              </label>
            </div>
            <div class="navbar-center flex flex-col">
              <p>Feathers Chat</p>
              <label for="drawer-right" class="text-xs cursor-pointer">
                <span class="online-count">{users.length}</span> User(s)
              </label>
            </div>
          </div>
          <div id="chat" class="h-full overflow-y-auto px-3">
            {#each messages as message (message.id)}
              <div class="chat chat-start py-2">
                <div class="chat-image avatar">
                  <div class="w-10 rounded-full">
                    <img
                      src={getUserById(message.userId)?.avatar}
                      alt={getUserById(message.userId)?.username}
                    />
                  </div>
                </div>
                <div class="chat-header pb-1">
                  {getUserById(message.userId)?.username}
                  <time class="text-xs opacity-50"
                    >{formatDate(message.createdAt)}</time
                  >
                </div>
                <div class="chat-bubble">{message.text}</div>
              </div>
            {/each}
            <div id="message-end" />
          </div>
          <div class="form-control w-full py-2 px-3">
            <form
              class="input-group overflow-hidden"
              id="send-message"
              on:submit={createMessage}
            >
              <input
                name="text"
                type="text"
                placeholder="Compose message"
                class="input input-bordered w-full"
                bind:value={text}
              />
              <button type="submit" class="btn">Send</button>
            </form>
          </div>
        </div>
        <div class="drawer-side">
          <label for="drawer-left" class="drawer-overlay"></label>
          <ul
            class="menu user-list compact p-2 overflow-y-auto w-60 bg-base-300 text-base-content"
          >
            <li class="menu-title"><span>Users</span></li>
            {#each users as current (current.id)}
              <li class="user">
                <a
                  href="#"
                  class={user.id === current.id
                    ? 'text-secondary font-bold'
                    : ''}
                >
                  <div class="avatar indicator">
                    <div class="w-6 rounded">
                      <img src={current.avatar} alt={current.username} />
                    </div>
                  </div>
                  <span>{current.username}</span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {/if}
  {/if}
</main>
