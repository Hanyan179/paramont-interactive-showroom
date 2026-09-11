#!/bin/zsh
cd -- "${0:A:h}"
task_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [[ ! -x "$task_node" ]]; then task_node="$(command -v node)"; fi
if [[ -z "$task_node" || ! -d node_modules ]]; then
  echo "缺少开发环境或依赖，请按照 README.md 安装。"
  read -k 1
  exit 1
fi
"$task_node" scripts/check-data.mjs || exit 1
"$task_node" scripts/check-explorer.mjs || exit 1
"$task_node" node_modules/vite/bin/vite.js build || exit 1
if [[ -d ../展示应用/public ]]; then
  "$task_node" scripts/export-module.mjs || exit 1
fi
echo "独立版与已接入展厅的探索模块已更新。刷新页面即可。"
