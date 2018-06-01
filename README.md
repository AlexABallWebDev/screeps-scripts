# screeps-scripts

Scripts for the programmer RTS MMO Screeps.

## First steps on Clone

Run npm to install Typescript declarations for IDEs.

    npm install

Copy screeps.sample.json and add token. This is used for pushing compiled scripts to the official server.

## Build and Push

Run build and push to official server:

    npm run push-main

Run build without pushing to a server (good for testing with a local private server):

    npm run build

## Profiler

The Screeps-Profiler is disabled to avoid using extra CPU when it is not being used. At the moment, my solution is to manually enable it by searching for "screepsProfiler.enable()" in the Screeps script window and uncomment it.