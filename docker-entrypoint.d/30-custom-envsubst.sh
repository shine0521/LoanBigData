#!/bin/sh
# 精确渲染 nginx API_TARGET 变量：
# - 只替换 ${API_TARGET}（带花括号），不动裸 $API_TARGET
# - 覆盖 20-envsubst-on-templates.sh 的错误渲染结果
set -e

TEMPLATE="/etc/nginx/templates/default.conf.template"
OUTPUT="/etc/nginx/conf.d/default.conf"
API_TARGET_VAL="${API_TARGET:-https://risk-api-278112-4-1450481727.sh.run.tcloudbase.com}"

if [ -f "$TEMPLATE" ]; then
    # 精确替换带花括号的 ${API_TARGET}，裸 $API_TARGET 不动
    sed "s|\${API_TARGET}|${API_TARGET_VAL}|g" "$TEMPLATE" > "$OUTPUT"
    echo "[entrypoint] Rendered nginx config with API_TARGET=${API_TARGET_VAL}"
    echo "[entrypoint] Config written to ${OUTPUT}"
else
    echo "[entrypoint] ERROR: Template not found at ${TEMPLATE}"
    exit 1
fi

# 继续执行官方 entrypoint（处理 IPv6 / local resolvers 等）
exec /docker-entrypoint.sh "$@"
