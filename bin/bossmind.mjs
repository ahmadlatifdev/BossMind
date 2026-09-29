#!/usr/bin/env node
import { main } from "../src/cli.mjs";

const code = await main();
if (code !== 0) process.exit(code);
