// Based on https://gist.github.com/amejiarosario/53afae82e18db30dadc9bc39035778e5

const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const port = process.argv[2] || 9000;

http
  .createServer(function (req, res) {
    console.log(`${req.method} ${req.url}`);

    // parse URL
    const parsedUrl = url.parse(req.url);
    // extract URL path
    let pathname = `.${parsedUrl.pathname}`;
    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
    const ext = path.parse(pathname).ext || ".html";
    // maps file extention to MIME typere
    const map = {
      ".ico": "image/x-icon",
      ".html": "text/html",
      ".js": "text/javascript",
      ".json": "application/json",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".wav": "audio/wav",
      ".mp3": "audio/mpeg",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
    };

    fs.exists(pathname, function (exist) {
      if (!exist) {
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
      }

      if (fs.statSync(pathname).isDirectory()) pathname += "/index" + ext;

      fs.readFile(pathname, function (err, data) {
        if (err) {
          res.statusCode = 500;
          res.end(`Error getting the file: ${err}.`);
        } else {
          // if the file is found, set Content-type and send data
          res.setHeader("Server", "node.js");
          res.setHeader("Content-type", map[ext] || "text/plain");

          res.end(
            data
              .toString()
              .replace(/\{\{CLIENT_ID\}\}/g, process.env.CLIENT_ID)
              .replace(/\{\{API_KEY\}\}/g, process.env.API_KEY)
              .replace(/\{\{SPREADSHEET_ID\}\}/g, process.env.SPREADSHEET_ID)
          );
        }
      });
    });
  })
  .listen(parseInt(port));

console.log(`Server listening on port ${port}`);
