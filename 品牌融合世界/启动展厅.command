#!/bin/zsh
cd -- "${0:A:h}"
task_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [[ ! -x "$task_node" ]]; then task_node="$(command -v node)"; fi
if [[ -z "$task_node" ]]; then
  echo "请安装 Node.js 20.19 或更新版本后重试。"
  read -k 1
  exit 1
fi
"$task_node" scripts/serve.mjs
