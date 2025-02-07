
#### Checkout the latest release

```bash
# Clone the repository
git clone https://github.com/mangekyou-network/one-eye.git
```

#### Edit the .env file

Copy .env.example to .env and fill in the appropriate values.

```
cp .env.example .env
```

Note: 
- Replace your Cookieswarm API key.
- Replace the OPENAI_API_KEY with your own.
- Switch the VERIFIABLE_INFERENCE to true to enable zkTLS inference.

#### Start Agent

```bash
pnpm i
pnpm build
pnpm start

# The project iterates fast, sometimes you need to clean the project if you are coming back to the project
pnpm clean
```

### Interact via Browser

Once the agent is running, you should see the message to run "pnpm start:client" at the end.

Open another terminal, move to the same directory, run the command below, then follow the URL to chat with your agent.

```bash
pnpm start:client
```

Optional: read the [Documentation](https://elizaos.github.io/eliza/) to learn how to customize your Eliza agent.

---

#### Additional Requirements

You may need to install Sharp. If you see an error when starting up, try installing it with the following command:

```
pnpm install --include=optional sharp
```

You also may need to fix the lock file.

```
pnpm install --fix-lockfile
```