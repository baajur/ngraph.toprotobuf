var schema = require('./schema.js');

var makeProtoBufView = require('./lib/protobufView.js');

var fs = require('fs');
var mkdirp = require('mkdirp');
var merge = require('ngraph.merge');
var path = require('path');

module.exports = save;
module.exports.read = require('./readPrimitive.js');

function save(graph, options) {
  options = merge(options, {
    outDir: '.',
    labels: 'labels.pb',
    links: 'links.pb'
  });

  fixPaths();

  var protoBufView = makeProtoBufView(graph, schema);

  var linksBuffer = protoBufView.getLinksBuffer();
  // Turns out node 5.1 crashes when array buffer has length 0.
  var buffer = (linksBuffer.byteLength > 0) ? new Buffer(linksBuffer) : new Buffer(0);
  fs.writeFileSync(options.links, buffer);

  var labelsBuffer = protoBufView.getLabelsBuffer();
  fs.writeFileSync(options.labels, new Buffer(labelsBuffer));

  fs.writeFileSync(options.meta, JSON.stringify({
    options: options,
    stats: {
      nodes: graph.getNodesCount(),
      edges: graph.getLinksCount()
    }
  }, null, 2), 'utf8');

  fs.writeFileSync(options.protoFile, schema.graph);

  // TODO: Save data for each node/edge?
  return;

  function fixPaths() {
    if (!fs.existsSync(options.outDir)) {
      mkdirp.sync(options.outDir);
    }

    options.labels = path.join(options.outDir, options.labels);
    options.links = path.join(options.outDir, options.links);
    options.protoFile = path.join(options.outDir, 'graph.proto');
    options.meta = path.join(options.outDir, 'graph-def.json');
  }
}

