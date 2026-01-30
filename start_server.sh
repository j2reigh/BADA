#!/bin/bash
NODE_ENV=production node dist/index.cjs > server_manual_start.log 2>&1 &
echo $! > server.pid