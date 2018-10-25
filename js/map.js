const d3 = window.d3;
const Promise = window.Promise;
const topojson = window.topojson;
const $ = window.$;

var updateMapFunc;

var files = ["data/ch.json", "data/votes.json?1"];
var promises = [];

files.forEach(function(url) {
  promises.push(d3.json(url))
});

/*var color_relative = d3.scaleLinear()
.domain([15, 50, 85]) // 0, pivot, max
.range(['#ff0000', '#fffeee', 'green']);*/

var color_relative = d3.scaleLinear()
.domain([0, 50, 50.1, 100])
.range(['#450003', '#FF666A', '#94FF7F', '#157F00'])

Promise.all(promises).then(function(values) {
  var $firstCard = $('#card-76 > div.card-section.card-body');
  var width = $firstCard.width() * 0.6;
  var height = width * 0.65;
  var svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

  var projection = d3.geoMercator()
  .scale(width * 10) // mobile: 12 / 14
  .center([8, 46.7])
  .translate([width / 2, height / 2]);

  var path = d3.geoPath().projection(projection);

  /* --- */

  var ch = values[0],
  votes = values[1]

  var votation_id = 0;

  renderMap(svg.append("g"), values, votation_id);

  function renderMap(container, values, votation_id) {
    var countries = topojson.feature(ch, ch.objects.geojson).features;

    container.append("g")
    .attr("class", 'cantons_layer')
    .selectAll(".country")
    .data(countries).enter()
    .append("path")
    .attr("class", "country")
    .attr("d", path)
    .style("fill", function(d, i){
      return color_relative(votes[votation_id][i])
    });

    // TODO add centroids for this
    /*
    var label = svg.selectAll("text")
    .data(countries).enter()
    .append("svg:text")
      .attr("class", "cantons-label")
    .text(function(d){
      console.log('xx')
     return "test";
    })
    .attr('transform', function(d) {
      var centroid_projection = projection([d.centroid_lon, d.centroid_lat]);
      if(centroid_projection){
        return "translate(" + projection([d.centroid_lon, d.centroid_lat]) + ")";
      }else{
        console.log('No projection for ' + d.name);
        return '';
      }
    })
    .attr("text-anchor","middle")
    .attr('fill', 'black');
    */
  }

  updateMapFunc = function(target_votation){
    // DEBUG
    // console.log('Update to votation ' + target_votation + ' ' + votes[target_votation][27])

    var t1 = d3.transition()
    .duration(200)
    .ease(d3.easeLinear);

    var t2 = d3.transition()
    .duration(300)
    .ease(d3.easeLinear);

    d3.selectAll(".country")
    .transition(t1)
    .style('opacity', 0.5)
    .transition(t2)
    .style("fill", function(d, i){
      return color_relative(votes[target_votation][i]);
    })
    .transition(t1)
    .style('opacity', 1);
  }

});

$('#map').append('<div class="legend"></div>')

var legendItems = '';
for(var i = 10; i <= 100; i += 10){
  legendItems = legendItems + '<span style="background-color:' + color_relative(i) + '">&nbsp;</span><label>' + (i-9) + '-' + (i) + '%</label>';
}
$('.legend').html(legendItems);

/* generate CSS
var color_titles = d3.scaleLinear()
.domain([20, 50, 51, 80]) // 0, pivot, max
.range(['#ff0000', '#ffbbbb', '#bbffbb', 'green']);

var css = '';
for(var i = 0; i < 100; i += 10){
  var scale = `.scale${i}{
    background-color: ${color_titles(i)};
}
  `;
  css += scale;
}
console.log(css);
*/
