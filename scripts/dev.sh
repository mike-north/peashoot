#!/bin/bash
pnpm dlx concurrently -c "green,yellow,blue" \
  -n "server,types,client" \
  "pnpm --filter=server dev" \
  "pnpm --filter=types dev" \
  "pnpm --filter=client dev"