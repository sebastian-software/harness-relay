# MCP server

`harness-relay mcp serve` exposes the implemented bridge operations over MCP
stdio. The server is local and starts the user-owned broker on demand.

## Claude Code

```sh
claude mcp add harness-relay -- harness-relay mcp serve
```

## Codex

Add a stdio server entry to `~/.codex/config.toml`:

```toml
[mcp_servers.harness_relay]
command = "harness-relay"
args = ["mcp", "serve"]
```

## Recommended tool flow

1. Call `harness_relay_system_describe` to inspect the contract and routes.
2. Call `harness_relay_invocation_start` with an absolute working directory and
   the smallest required policy.
3. Follow progress with `harness_relay_invocation_events` using the returned
   cursors. Answer pending permission requests with
   `harness_relay_invocation_respond`.
4. Call `harness_relay_invocation_result` after the terminal event.

Only operations marked `implemented` in `system.describe` are advertised as
MCP tools. Tool schemas are self-contained so hosts do not need to resolve
cross-file `$ref` values.

The repository also carries an integration test that starts `harness-relay mcp
serve` as a child process and drives it with the official MCP SDK client over
stdio. It covers initialization, tool discovery, schema-backed calls, and a
complete fake invocation lifecycle.
