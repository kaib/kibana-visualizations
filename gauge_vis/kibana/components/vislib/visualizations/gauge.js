define(function (require) {
  return function GaugeChartFactory(d3, Private) {
    var _ = require('lodash');
    var $ = require('jquery');
    var errors = require('errors');

    var Chart = Private(require('components/vislib/visualizations/_chart'));
    require('css!components/vislib/styles/main');

    /**
     * Gauge Chart Visualization
     *
     * @class GaugeChart
     * @constructor
     * @extends Chart
     * @param handler {Object} Reference to the Handler Class Constructor
     * @param el {HTMLElement} HTML element to which the chart will be appended
     * @param chartData {Object} Elasticsearch query results for this specific chart
     */
    _(GaugeChart).inherits(Chart);
    function GaugeChart(handler, chartEl, chartData) {
      if (!(this instanceof GaugeChart)) {
        return new GaugeChart(handler, chartEl, chartData);
      }

      this.handler = handler;
      GaugeChart.Super.apply(this, arguments);
    }


    /**
     * Renders d3 visualization
     *
     * @method draw
     * @returns {Function} Creates the gauge
     */
    GaugeChart.prototype.draw = function () {
      var self = this;

      return function (selection) {
        selection.each(function (data) {
          var width = $(this).width();
          var height = $(this).height();

          var gaugeWidth = parseInt(width * 0.95);
          var gaugeHeight = parseInt(height * 0.95);
          var positionX = parseInt(width / 2);
          var positionY = parseInt(height / 2);

          var radius = Math.min(parseInt(gaugeWidth / 2), parseInt(gaugeHeight / 2));

          var min = self.handler._attr.minValue;
          var max = self.handler._attr.maxValue;
          var range = max - min;

            var valueToDegrees = function(value) {
                return value / range * 270 - (min / range * 270 + 45);
            };

            var valueToRadians = function(value) {
                return valueToDegrees(value) * Math.PI / 180;
            };

            var valToPoint = function(value, factor) {
                return {
                    x: positionX - radius * factor * Math.cos(valueToRadians(value)),
                    y: positionY - radius * factor * Math.sin(valueToRadians(value))
                };
            };

            var buildPointerPath = function(value) {
                var delta = range / 13;

                var head = valueToPoint(value, 0.85);
                var head1 = valueToPoint(value - delta, 0.12);
                var head2 = valueToPoint(value + delta, 0.12);

                var tailValue = value - (range * (1/(270/360)) / 2);
                var tail = valueToPoint(tailValue, 0.28);
                var tail1 = valueToPoint(tailValue - delta, 0.12);
                var tail2 = valueToPoint(tailValue + delta, 0.12);

                return [head, head1, tail2, tail, tail1, head2, head];

                function valueToPoint(value, factor) {
                    var point = valToPoint(value, factor);
                    return point;
                }
            };

            var drawColorZone = function(svg, start, end, color) {
                if (0 >= end - start) return;

                svg.append("svg:path")
                    .style("fill", color)
                    .attr("d", d3.svg.arc()
                        .startAngle(valueToRadians(start))
                        .endAngle(valueToRadians(end))
                        .innerRadius(0.75 * radius)
                        .outerRadius(0.85 * radius))
                    .attr("transform", function() { return "translate(" + positionX + ", " + positionY + ") rotate(270)" });
            };

          var container = d3.select(this);
          var svg = container.append('svg')
              .attr('width', width)
              .attr('height', height)
              .append('g');

            // DRAWING WRAPPING CIRCLES //
          svg.append("svg:circle")
              .attr("class", "bounding-circle")
              .attr("cx", positionX)
              .attr("cy", positionY)
              .attr("r", radius)
              //.style("fill", "rgb(113,113,113)")
              //.style("stroke", "#fff")
              .style("stroke-width", "0.5px")
              .style("opacity", "1");

          svg.append("svg:circle")
              .attr("class", "inner-circle")
              .attr("cx", positionX)
              .attr("cy", positionY)
              .attr("r", 0.9 * radius)
              //.style("fill", "rgba(0,0,0,0)")
              .style("stroke", "#e0e0e0")
              .style("stroke-width", "2px")
              .style("opacity", "1");

            // DRAWING GAUGE TITLE //
            var fontSize = Math.floor(radius / 9);
            var chartTitle = self.handler._attr.metricName;
            svg.append("svg:text")
                .attr("class", "gauge-name")
                .attr("x", positionX)
                .attr("y", positionY - (radius / 2))
                .attr("dy", fontSize / 2)
                .attr("text-anchor", "middle")
                .text(chartTitle)
                .style("font-size", fontSize + "px")
                //.style("fill", "#fff")
                .style("stroke-width", "0px");

            // DRAW COLORED ZONES //
            drawColorZone(svg, parseInt(min + ((max - min) * 0.75)), parseInt(min + ((max - min) * 0.9)), '#f0ad4e');      // yellow
            drawColorZone(svg, parseInt(min + ((max - min) * 0.9)), max, '#d9534f');     // red

            // DRAW TICKS ON GAUGE //
            var majorDelta = range / 10;
            var minorTicks = 5;
            for (var major = min; major <= max; major += majorDelta) {
                var minorDelta = majorDelta / minorTicks;
                for (var minor = major + minorDelta; minor < Math.min(major + majorDelta, max); minor += minorDelta)
                {
                    var point1 = valToPoint(minor, 0.75);
                    var point2 = valToPoint(minor, 0.85);

                    svg.append("svg:line")
                        .attr("class", "tick")
                        .attr("x1", point1.x)
                        .attr("y1", point1.y)
                        .attr("x2", point2.x)
                        .attr("y2", point2.y)
                        //.style("stroke", "rgb(140,140,140)")  // styles are in .css files
                        .style("stroke-width", "1px");
                }

                var point1 = valToPoint(major, 0.7);
                var point2 = valToPoint(major, 0.85);

                svg.append("svg:line")
                    .attr("class", "tick thick")
                    .attr("x1", point1.x)
                    .attr("y1", point1.y)
                    .attr("x2", point2.x)
                    .attr("y2", point2.y)
                    //.style("stroke", "rgb(180,180,180)")  // styles are in .css files
                    .style("stroke-width", "2px");

                if (major == min || major == max) {
                    var point = valToPoint(major, 0.63);

                   svg.append("svg:text")
                        .attr("class", "tick-values")
                        .attr("x", point.x)
                        .attr("y", point.y)
                        .attr("dy", fontSize / 3)
                        .attr("text-anchor", major == min ? "start" : "end")
                        .text(major)
                        .style("font-size", fontSize + "px")
                        //.style("fill", "rgb(220,220,220)")
                        .style("stroke-width", "0px");
                }
            }


            // DRAWING GAUGE NEEDLE //
            var pointerContainer = svg.append("svg:g").attr("class", "pointerContainer");
            var midValue = (min + max) / 2; // gauge values - min:0 max:100

            var value = _.deepGet(data, 'series[0].values[0].aggConfigResult.value');
            if (value < min) value = min;
            else if (value > max) value = max;
            else if (value >= min && value <= max) value = value;
            else value = min;
            var pointerPath = buildPointerPath(value); // I just randomly chose this value

            var pointerLine = d3.svg.line()
                .x(function(d) { return d.x })
                .y(function(d) { return d.y })
                .interpolate("basis");

            pointerContainer.selectAll("path")
                .data([pointerPath])
                .enter()
                .append("svg:path")
                .attr("d", pointerLine)
                .style("fill", "#dc3912")
                .style("stroke", "#c63310")
                .style("fill-opacity", 0.7);

            pointerContainer.append("svg:circle")
                .attr("cx", positionX)
                .attr("cy", positionY)
                .attr("r", 0.08 * radius)
                .style("fill", "#4684EE")
                .style("stroke", "#666")
                .style("opacity", 1);

            pointerContainer.selectAll("text")
                .data([midValue])
                .enter()
                .append("svg:text")
                .attr("x", positionX)
                .attr("y", positionY - (positionY / 4) - fontSize)
                .attr("dy", fontSize / 2)
                .attr("text-anchor", "middle")
                .style("font-size", fontSize + "px")
                .style("fill", "#000")
                .style("stroke-width", "0px");
        });
      };
    };

    return GaugeChart;
  }
});
