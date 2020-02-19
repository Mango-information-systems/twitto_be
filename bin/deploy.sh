#!/bin/bash
set -euo pipefail

if [ -z ${1} ];
then
	echo "environment is unset, exiting";
else
	echo "deploying to '$1' environment";
	target=$(if [ "prod" == "$1" ]; then echo "twitto"; else echo "test-twitto"; fi) \
	&& sudo rsync -ua --exclude="*node_modules/*" --exclude=".*" --exclude="persist/*" ./* /home/srv-node-mango/$target \
	&& cd /home/srv-node-mango/$target \
	&& NODE_ENV=production npm install \
	&& sudo chown -R srv-node-mango:srv-node-mango /home/srv-node-mango/$target \
	&& sudo systemctl restart node-$target \
	&& sudo touch /var/ngx_pagespeed_cache/cache.flush \
	&& echo "done";
fi
