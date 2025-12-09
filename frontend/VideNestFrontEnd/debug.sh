#!/bin/bash
echo "--- NODE VERSION ---" > debug_output.txt
node -v >> debug_output.txt 2>&1
echo "--- NPM VERSION ---" >> debug_output.txt
npm -v >> debug_output.txt 2>&1
echo "--- TAILWIND CHECK ---" >> debug_output.txt
ls -d node_modules/tailwindcss >> debug_output.txt 2>&1
echo "--- NPM RUN DEV START ---" >> debug_output.txt
timeout 5s npm run dev >> debug_output.txt 2>&1
echo "--- END ---" >> debug_output.txt
