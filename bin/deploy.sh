#!/bin/bash
set -euo pipefail

if [ -z ${1} ];
then
	echo "environment is unset, exiting";
else
	echo "deploying to '$1' environment";
	target=$(if [ "prod" == "$1" ]; then echo "twitto"; else echo "test-twitto"; fi) \
	&& rm -r node_modules/* \
	&& NODE_ENV=production npm install \
	&& npm audit fix \
	&& sudo rsync -ua --exclude=".*" --exclude="persist/*" ./* /home/srv-node-mango/$target \
	&& cd /home/srv-node-mango/$target \
	&& sudo chown -R srv-node-mango:srv-node-mango /home/srv-node-mango/$target \
	&& sudo touch /var/ngx_pagespeed_cache/cache.flush \
	&& echo "done";
fi
