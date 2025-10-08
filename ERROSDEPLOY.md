18:20:46.909 Running build in Washington, D.C., USA (East) – iad1
18:20:46.910 Build machine configuration: 2 cores, 8 GB
18:20:46.955 Cloning github.com/BuscadorPXT/financeiro (Branch: main, Commit: 8d5c9cd)
18:20:47.318 Previous build caches not available
18:20:49.459 Cloning completed: 2.502s
18:20:49.875 Running "vercel build"
18:20:50.270 Vercel CLI 48.2.4
18:20:50.937 Installing dependencies...
18:21:29.206 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
18:21:29.507 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
18:21:31.654 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
18:21:31.692 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
18:21:38.722 
18:21:38.723 > financasbuscador@1.0.0 postinstall
18:21:38.723 > cd frontend && npm install
18:21:38.724 
18:22:15.339 
18:22:15.340 added 463 packages, and audited 464 packages in 37s
18:22:15.341 
18:22:15.341 102 packages are looking for funding
18:22:15.341   run `npm fund` for details
18:22:15.349 
18:22:15.349 1 high severity vulnerability
18:22:15.349 
18:22:15.349 Some issues need review, and may require choosing
18:22:15.349 a different dependency.
18:22:15.349 
18:22:15.349 Run `npm audit` for details.
18:22:15.406 
18:22:15.406 added 514 packages in 1m
18:22:15.406 
18:22:15.406 80 packages are looking for funding
18:22:15.407   run `npm fund` for details
18:22:15.452 Running "npm run build"
18:22:15.562 
18:22:15.563 > financasbuscador@1.0.0 build
18:22:15.563 > npm run build:backend && npm run build:frontend
18:22:15.563 
18:22:15.677 
18:22:15.677 > financasbuscador@1.0.0 build:backend
18:22:15.678 > tsc -p tsconfig.backend.json
18:22:15.678 
18:22:20.297 
18:22:20.298 > financasbuscador@1.0.0 build:frontend
18:22:20.298 > cd frontend && npm run build
18:22:20.298 
18:22:20.405 
18:22:20.406 > frontend@0.0.0 build
18:22:20.406 > tsc -b && vite build
18:22:20.406 
18:22:27.902 [36mvite v7.1.9 [32mbuilding for production...[36m[39m
18:22:27.964 transforming...
18:22:35.871 [32m✓[39m 3009 modules transformed.
18:22:36.822 rendering chunks...
18:22:36.855 computing gzip size...
18:22:36.898 [2mdist/[22m[32mindex.html                 [39m[1m[2m    0.46 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m
18:22:36.899 [2mdist/[22m[2massets/[22m[35mindex-CBJKwshr.css  [39m[1m[2m   53.41 kB[22m[1m[22m[2m │ gzip:   9.63 kB[22m
18:22:36.899 [2mdist/[22m[2massets/[22m[36mindex-D7bFvs8a.js   [39m[1m[33m1,378.08 kB[39m[22m[2m │ gzip: 416.15 kB[22m
18:22:36.900 [33m
18:22:36.900 (!) Some chunks are larger than 500 kB after minification. Consider:
18:22:36.900 - Using dynamic import() to code-split the application
18:22:36.903 - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
18:22:36.903 - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
18:22:36.905 [32m✓ built in 8.97s[39m
18:22:37.004 Build Completed in /vercel/output [2m]
18:22:37.104 Deploying outputs...
18:22:39.562 Deployment completed
18:22:40.540 Creating build cache...
18:23:02.095 Created build cache: 21.555s
18:23:02.096 Uploading build cache [114.77 MB]
18:23:04.240 Build cache uploaded: 2.143s