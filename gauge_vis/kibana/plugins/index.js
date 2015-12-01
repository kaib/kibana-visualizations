define(function (require) {
  require('registry/vis_types').register(function GaugeVisPrivateModuleLoader(Private) {
    return Private(require('plugins/gauge_vis/gauge_vis'));
  });
});