define(function (require) {
  require('css!plugins/gauge_vis/gauge_vis.css');

  return function GaugeVisType(Private) {
    var VislibVisType = Private(require('plugins/vis_types/vislib/_vislib_vis_type'));
    var Schemas = Private(require('plugins/vis_types/_schemas'));

    return new VislibVisType({
      name: 'gauge',
      title: 'Gauge',
      icon: 'fa-tachometer',
      description: 'A cool gauge instead of just displaying a number',
      params: {
        defaults: {
          minValue: 0,
          maxValue: 100,
          metricName: ''
        },
        editor: require('text!plugins/gauge_vis/gauge_vis_params.html')
      },
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Metric',
          min: 1,
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        }
      ])
    });
  };
});
