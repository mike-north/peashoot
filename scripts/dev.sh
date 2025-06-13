#!/bin/bash
pnpm dlx concurrently -c "green,yellow,blue" \
  -n "server,types,client" \
  "pnpm dev --filter @peashoot/server" \
  "pnpm dev --filter @peashoot/types" \
  "pnpm dev --filter @peashoot/client"