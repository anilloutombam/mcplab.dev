---
title: External MCP targets
description: Run scenarios against HTTP and stdio MCP servers and inspect them in a browser UI.
---

The `run` command can execute a scenario against Failure Lab's built-in server or a configured
external MCP target. External execution uses the same calls, expectations, observer behavior, exit
codes, and reports as built-in execution.

## Run an external target

Pass a target configuration separately from the scenario:

```sh
npm run dev -- run path/to/scenario.json --target path/to/target.json
```

Keeping the files separate allows one scenario to run against multiple MCP implementations without
embedding credentials or connection details in the scenario.

## Streamable HTTP

```json
{
	"adapter": "mcp",
	"config": {
		"transport": "http",
		"url": "https://example.com/mcp",
		"headerEnv": {
			"Authorization": "MCP_AUTHORIZATION"
		}
	}
}
```

Set the referenced environment variable before running the scenario:

```sh
export MCP_AUTHORIZATION="Bearer replace-with-your-token"
```

`headers` accepts non-sensitive literal headers. Use `headerEnv` for tokens and other secrets so
they are not committed to source control. Each key is an HTTP header name and each value is the
name of an environment variable.

## Stdio

```json
{
	"adapter": "mcp",
	"config": {
		"transport": "stdio",
		"command": "npx",
		"args": ["your-mcp-server"],
		"env": {
			"LOG_LEVEL": "error"
		}
	}
}
```

The optional `cwd` field selects the child process working directory. The adapter owns the process
and connection created during setup and closes them during cleanup.

## GitLab, Stripe, and custom MCP servers

Use the URL or launch command supplied by the MCP provider. The scenario's `call.tool` must match a
tool returned by that server's `tools/list`; its `call.args` must satisfy that tool's input schema.
Provider credentials should be supplied through environment-backed headers or the stdio process
environment.

Failure Lab does not hard-code GitLab, Stripe, or provider-specific tool names. The `mcp` adapter
works at the MCP transport boundary, while the adapter registry allows additional adapters to be
introduced without changing scenario command orchestration.

## GitLab MCP server

GitLab is the primary provider example. GitLab's official endpoint is
`https://gitlab.com/api/v4/mcp` for GitLab.com, or
`https://<your-gitlab-host>/api/v4/mcp` for another GitLab instance. GitLab recommends HTTP and
uses OAuth 2.0 Dynamic Client Registration.

Failure Lab does not currently initiate an interactive HTTP OAuth flow itself. Use GitLab's
documented `mcp-remote` stdio bridge so it can open the browser authorization flow:

```json
{
	"adapter": "mcp",
	"config": {
		"transport": "stdio",
		"command": "npx",
		"args": ["-y", "mcp-remote@latest", "https://gitlab.com/api/v4/mcp"]
	}
}
```

Run the included read-only project-search scenario:

```sh
npm run dev -- run examples/scenarios/gitlab-search-projects.json \
  --target examples/targets/gitlab-stdio.json \
  --report json
```

On the first connection, complete the GitLab authorization in the browser. GitLab MCP must also be
enabled for the applicable GitLab group or instance. The server is currently documented by GitLab
as beta, so verify the available tool names in Inspector if the example reports an unknown tool.

For browser-first validation, connect MCP Inspector directly to the GitLab HTTP endpoint and
complete its OAuth flow. Confirm that the `search` tool is available before running the included
scenario. Exercise caution with data returned from repositories you do not trust.

## GitHub MCP server

GitHub is an additional provider example. Its official remote MCP endpoint is
`https://api.githubcopilot.com/mcp/`. It accepts a valid
GitHub access token in the `Authorization` header. The repository includes a read-only `get_me`
example that limits the exposed tools with GitHub's `X-MCP-Tools` header.

Set the complete authorization value in the environment:

```sh
export GITHUB_MCP_AUTHORIZATION="Bearer replace-with-your-token"
```

### Obtain a GitHub token

If GitHub CLI is already authenticated, confirm the active account and reuse its token without
printing the token:

```sh
gh auth status
export GITHUB_MCP_AUTHORIZATION="Bearer $(gh auth token)"
```

Otherwise, create a short-lived fine-grained personal access token from
[GitHub token settings](https://github.com/settings/personal-access-tokens/new). Grant only the
repository access and read-only permissions required by the tools you intend to exercise. Then set
the complete header value in the same terminal used to run Failure Lab:

```sh
export GITHUB_MCP_AUTHORIZATION="Bearer github_pat_replace_with_your_token"
```

The placeholder text is not a usable token. Do not add a literal token to the target JSON, shell
scripts, documentation, commits, issues, or logs. Remove the environment variable after testing:

```sh
unset GITHUB_MCP_AUTHORIZATION
```

Failure Lab's current HTTP adapter accepts an already obtained access token. Interactive OAuth is
handled by OAuth-capable MCP hosts and is not initiated by the Failure Lab CLI.

Run the included scenario:

```sh
npm run dev -- run examples/scenarios/github-get-me.json \
  --target examples/targets/github-http.json \
  --report json
```

A successful result contains `setup`, `execute`, and `cleanup` diagnostics with `success` outcomes.
The scenario calls only `get_me`; it does not create or modify GitHub resources. Use a token with
the minimum permissions required by the tools you intend to test, and never commit the token or a
literal authorization header.

GitHub also publishes a local stdio server as `ghcr.io/github/github-mcp-server`. Use the remote
example above for the shortest verification path; use the local image when testing process startup
and stdio cleanup behavior.

## Validate the connection in a browser

The Failure Lab runner currently reports through the console or JSON; it does not include a browser
dashboard. Use the official MCP Inspector for interactive connection and tool-call validation:

```sh
npx @modelcontextprotocol/inspector
```

In Inspector:

1. Select Streamable HTTP or stdio.
2. Enter the same URL or process configuration used by the target file.
3. Add the required authentication without committing it to the repository.
4. Connect and open **Tools**.
5. Confirm the scenario tool appears and invoke it with the scenario arguments.
6. Run the Failure Lab command with `--target` to verify orchestration and reporting.

Inspector validates that the target is reachable and that an individual call works. Failure Lab
then validates the declared outcome, deadline, optional observer, adapter lifecycle, and cleanup.

## Lifecycle and diagnostics

External execution records adapter operations in order:

1. `setup` starts or connects to the target and waits for MCP initialization.
2. `execute` invokes the primary scenario call.
3. `observe` runs when the scenario contains an observer.
4. `cancel` is requested after a bounded operation times out.
5. `cleanup` runs after every successful setup.

Console and JSON output distinguish scenario assertions from adapter infrastructure health. An
assertion can fail even when every adapter operation succeeds. Conversely, cleanup or transport
failure marks the run unsuccessful without presenting it as a scenario assertion failure.

## Troubleshooting

- `target_load_failed`: the target file cannot be read, has invalid JSON, names an unknown adapter,
  or fails the selected adapter's strict configuration schema.
- Setup failure: confirm the URL, command, environment variables, network access, and credentials.
- Unknown tool: inspect `tools/list` and update the scenario tool name and arguments.
- Timeout: compare the scenario `timeoutMs` with the provider's expected response time.
- Cleanup failure: inspect the external diagnostics; scenario assertions remain separately reported.

See [Reporting](/docs/reporting/) for the output model and [Architecture](/docs/architecture/) for
adapter ownership boundaries.
