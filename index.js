#!/usr/bin/env node

// https://twitter.com/nparashuram/status/1151931186400206849

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const dir = process.argv[2] || ".";

const res = execSync(`du -ak ${dir}`);

const files = res
  .toString()
  .split("\n")
  .filter(l => l.length > 0)
  .map(l => {
    const parts = l.split(/\s+/);
    const size = parseInt(parts[0], 10);
    const relativePath = "./" + path.relative(dir, parts[1]);
    return [relativePath, path.dirname(relativePath), parseInt(parts[0], 10)];
  });

// Last file is root.
files[files.length - 1][0] = ".";
files[files.length - 1][1] = null;

const data = [["A", "B", "C"], ...files];

const template = `
<html>
  <head>
    <script
      type="text/javascript"
      src="https://www.gstatic.com/charts/loader.js"
    ></script>
    <script type="text/javascript">
      google.charts.load('current', { packages: ['treemap'] });
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        var data = google.visualization.arrayToDataTable(${JSON.stringify(
          data,
          null,
          2
        )});

        tree = new google.visualization.TreeMap(
          document.getElementById('chart_div'),
        );

        tree.draw(data, {
          minColor: '#f00',
          midColor: '#ddd',
          maxColor: '#0d0',
          headerHeight: 15,
          fontColor: 'black',
          showScale: true,
          generateTooltip: showFullTooltip
        });

        function humanFileSize(size) {
          const i = Math.floor(Math.log(size) / Math.log(1024));
          return (
            (size / Math.pow(1024, i)).toFixed(2) * 1 +
            " " +
            ["KB", "MB", "GB", "TB"][i]
          );
        }

        function showFullTooltip(row, size, value) {
          return \`
            <div style="background:#fd9; padding:10px; border-style:solid">
              <span style="font-family:sans-serif">
                \${data.getValue(row, 0)} (\${humanFileSize(size)})
              </span>
            </div>\`;
        }
      }
    </script>
  </head>
  <body>
    <div id="chart_div" style="width: 900px; height: 500px;"></div>
  </body>
</html>

`;

fs.writeFileSync("./index.html", template);
