define(function (require) {
  require('registry/vis_types').register(function (Private) {
    return Private(require('plugins/traffic_light_vis/traffic_light_vis'));
  });
});