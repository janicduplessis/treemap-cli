#!/usr/bin/env node

// https://twitter.com/nparashuram/status/1151931186400206849

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const dir = process.argv[2] || ".";

const res = execSync(`du -a ${dir}`);

const files = res
  .toString()
  .split("\n")
  .filter(l => l.length > 0)
  .map(l => {
    const parts = l.split(/\s+/);
    return [parts[1], path.dirname(parts[1]), parseInt(parts[0], 10)];
  });

// Last file is root so we need to set parent to null.
files[files.length - 1][1] = null;

const data = [["A", "B", "C"], ...files];

const template = `
<html>
  <head>
    <script
      type="text/javascript"
      src="https:/www.gstatic.com/charts/loader.js"
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
        });
      }
    </script>
  </head>
  <body>
    <div id="chart_div" style="width: 900px; height: 500px;"></div>
  </body>
</html>

`;

fs.writeFileSync("./index.html", template);
