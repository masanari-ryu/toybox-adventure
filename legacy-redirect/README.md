# Legacy search URL redirect

`toybox-adventure.pages.dev` is retained only as a permanent redirect to
`https://masanari-ryu.github.io/toybox-adventure/`.
The deleted Cloudflare game files are not restored. The separate Direct Upload
project contains only `_redirects` and a minimal fallback `index.html`.

Deploy only those two files to Cloudflare's `toybox-adventure` Pages project.
Never connect the game repository's main build to that project: the game remains
on GitHub Pages. Keep this redirect active so indexed URLs and old bookmarks work.
