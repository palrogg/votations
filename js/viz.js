/*
much better way to do all this:
MBostock's Cloropleth
http://bl.ocks.org/mbostock/4060606
*/

var width = 600,
    height = 400;

var projection = d3.geo.mercator()
    .scale(5000)
    .center([8, 46.7])
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

var data, data_ages, current_age, ages_loaded = false;
var i = -1;

var color = d3.scale.linear()
    .domain([0, 0, 40000]) // 0, pivot, max
    .range(['green', 'white', 'red']);

var color_relative = d3.scale.linear()
    .domain([-200, 0, 200]) // 0, pivot, max
    .range(['red', 'white', 'green']);


// captions
var captionCloseTimeout;
var caption = d3.select('body').append('div')
		.attr('id', 'caption')
		.html('Hover a canton to learn more.');

function position() {
	this.style("left", function(d) { return d.x + "px"; })
		.style("top", function(d) { return d.y + "px"; })
		.style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
		.style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

function showCaption(d, i) {
	clearTimeout(captionCloseTimeout);
	var position = d3.mouse(document.body);
	var captionHtml = 	'<h3>' + data[i].canton + '</h3>' +
	'<b>Unmatched men per 1000 singles:</b> ' + data[i].unmatched_total_per_1000 + '<br />' +
	'<b>Unmatched men, total:</b> ' + data[i].unmatched_total + '<br />';

	current_age = document.getElementById('select_age').value;
	if(data[i].unmatched[current_age-18] >= 0)
	{
		captionHtml += "<b>Unmatched " + current_age + " y.o. men:</b> " + data[i].unmatched[current_age-18] + '<br />';
		captionHtml += "<b>Unmatched " + current_age + " y.o. men per 1000:</b> " + data[i].unmatched_per_1000[current_age-18];
	}else{
		captionHtml += "<b>Unmatched " + current_age + " y.o. women:</b> " + -1*data[i].unmatched[current_age-18] + '<br />';
		captionHtml += "<b>Unmatched " + current_age + " y.o. women per 1000:</b> " + -1*data[i].unmatched_per_1000[current_age-18];
	}
	caption.style('display', 'block')
			.html(captionHtml);
}

// end captions


d3.json("data/unmatched_global.json", function(cantons)
{
/*
columns:
canton, unmatched_men_total, single_unmatched_men_total_per_1000, unmatched, unmatched_per_1000

*/
	data = cantons.map(function(d)
	{
		//each d is one line of the csv file represented as a json object
		i++;
		return d;
		//return {"id": i, "canton": d.canton, "unmatched_total": d.unmatched_total, "unmatched_total_per_1000": d.unmatched_total_per_1000, "unmatched":d.unmatched, "unmatched_per_1000":d.unmatched_per_1000};
	})

	// very dirty: exception for ZÃ¼rich and Zug
	var zu = data[25];
	data[25] = data[24];
	data[24] = zu;
	merge_topojson(data);
});


var j = -1;
function merge_topojson(data){
	d3.json("data/ch.json", function(error, ch) {
	  if (error) throw error;

	svg.append("g")
		  .attr("class", "counties")
		  .selectAll("path")
		  .data(topojson.feature(ch, ch.objects.geojson).features)
		  .enter().append("path")
		  .attr("class", "county-boundary")
		  .attr("d", path)
		  .on('mouseover', showCaption)
		  .on('mousemove', showCaption)
		  .style("fill", function(d) {
		  		j++;

		  		// To solve: Zurich and Zug get inverted because of the â€œÃ¼â€
//		  		console.log(d.properties.Name + "->" + data[j].canton + ", " + data[j].unmatched_total + ", " + data[j].unmatched_total_per_1000);

				try {
					return d.color = color_relative(data[j].unmatched_total_per_1000);
				}
				catch(e) {
					console.log(j + ":" + e.message);
					console.log(data);
				}
			});
	});
}

d3.select(self.frameElement).style("height", height + "px");


// <SELECT> -> relative / absolute values

d3.select("select").on("change", function() {
	if(this.value == "absolute")
	{
		j = -1;
		svg.selectAll("path")
		.transition().duration(200)
		.style("fill", function(d) {
			j++;
			return d.color = color(data[j].unmatched_total);
		});
	}
	else // relative
	{
		j = -1;
		svg.selectAll("path")
		.transition().duration(200)
		.style("fill", function(d) {
			j++;
			try {
				return d.color = color_relative(data[j].unmatched_total_per_1000);
			}
			catch(e) {
				console.log(j + ":" + e.message);
			}
		});
	}
});


function change_age(value)
{
	current_age = value;

	document.getElementById('custom_age').innerHTML = value;

	if(document.getElementById('select_relative').value == "absolute")
	{
		j = -1;
		svg.selectAll("path")
		.transition().duration(200)
		.style("fill", function(d) {
			j++;

			return d.color = color(data[j].unmatched[value-18]);
		});
	}
	else // relative
	{
		j = -1;
		max = 0;
		svg.selectAll("path")
		.transition().duration(200)
		.style("fill", function(d) {
			j++;
			if (data[j].unmatched_per_1000[value-18] > max)
			{
			   max = data[j].unmatched_per_1000[value-18];
			}
			return d.color = color_relative(data[j].unmatched_per_1000[value-18]);
		});
		//alert(max);
	}

}


// quick & dirty: keys
/*
function handleKeyDown(event) {
	if (event.keyCode == 37) {
	  // Left cursor key
	  if (current_age > 18)
	  	document.getElementById('select_age').value = current_age-1;
	}
	if (event.keyCode == 39) {
	  // Right cursor key
	  if (current_age < 65)
	  	change_age(current_age+1);
	}
}
document.onkeydown = handleKeyDown;
*/
