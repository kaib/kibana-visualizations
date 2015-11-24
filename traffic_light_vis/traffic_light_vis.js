define(function (require) {
  // we need to load the css ourselves
  require('css!plugins/traffic_light_vis/traffic_light_vis.css');

  // we also need to load the controller and used by the template
  require('plugins/traffic_light_vis/traffic_light_vis_controller');

  return function (Private) {
    var TemplateVisType = Private(require('plugins/vis_types/template/template_vis_type'));
    var Schemas = Private(require('plugins/vis_types/_schemas'));

    // return the visType object, which kibana will use to display and configure new
    // Vis object of this type.
    return new TemplateVisType({
      name: 'traffic_light',
      title: 'Traffic Light',
      description: 'Great for one-glance status readings, the traffic light visualization expresses in green / yellow / red the position of a single value in relation to low and high thresholds.',
      icon: 'fa-car',
      template: require('text!plugins/traffic_light_vis/traffic_light_vis.html'),
      params: {
        defaults: {
          width: 50,
          redThreshold: 20,
          greenThreshold: 80,
          invertScale: false
        },
        editor: require('text!plugins/traffic_light_vis/traffic_light_vis_params.html')
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