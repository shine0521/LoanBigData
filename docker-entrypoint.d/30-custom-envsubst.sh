#!/bin/sh
# 自定义 envsubst：只替换 ${API_TARGET}（带花括号），不替换 $API_TARGET
# 这样 nginx 模板里的 set $upstream "$API_TARGET"; 不会被误伤

set -e

API_TARGET_VAL="${API_TARGET:-https://risk-api-278112-4-1450481727.sh.run.tcloudbase.com}"

# 用 sed 只替换 ${API_TARGET}（精确匹配花括号包裹的变量名）
# -e：对已有 conf 做 in-place 替换
# 注意：模板文件还在 /etc/nginx/templates/，需要渲染到 /etc/nginx/conf.d/
if [ -f /etc/nginx/templates/default.conf.template ]; then
    sed "s|\${API_TARGET}|${API_TARGET_VAL}|g" \
        /etc/nginx/templates/default.conf.template \
        > /etc/nginx/conf.d/default.conf
    echo "[entrypoint] Rendered nginx config with API_TARGET=${API_TARGET_VAL}"
else
    echo "[entrypoint] No template found at /etc/nginx/templates/default.conf.template"
fi

# 执行官方 entrypoint 后续逻辑（启动 nginx）
exec docker-entrypoint.sh "$@"
