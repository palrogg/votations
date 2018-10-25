function position(){this.style("left",function(t){return t.x+"px"}).style("top",function(t){return t.y+"px"}).style("width",function(t){return Math.max(0,t.dx-1)+"px"}).style("height",function(t){return Math.max(0,t.dy-1)+"px"})}function showCaption(t,e){clearTimeout(captionCloseTimeout);var a=d3.mouse(document.body),n="<h3>"+data[e].canton+"</h3><b>Unmatched men per 1000 singles:</b> "+data[e].unmatched_total_per_1000+"<br /><b>Unmatched men, total:</b> "+data[e].unmatched_total+"<br />";current_age=document.getElementById("select_age").value,data[e].unmatched[current_age-18]>=0?(n+="<b>Unmatched "+current_age+" y.o. men:</b> "+data[e].unmatched[current_age-18]+"<br />",n+="<b>Unmatched "+current_age+" y.o. men per 1000:</b> "+data[e].unmatched_per_1000[current_age-18]):(n+="<b>Unmatched "+current_age+" y.o. women:</b> "+-1*data[e].unmatched[current_age-18]+"<br />",n+="<b>Unmatched "+current_age+" y.o. women per 1000:</b> "+-1*data[e].unmatched_per_1000[current_age-18]),caption.style("display","block").html(n)}function merge_topojson(t){d3.json("data/ch.json",function(e,a){if(e)throw e;svg.append("g").attr("class","counties").selectAll("path").data(topojson.feature(a,a.objects.geojson).features).enter().append("path").attr("class","county-boundary").attr("d",path).on("mouseover",showCaption).on("mousemove",showCaption).style("fill",function(e){j++;try{return e.color=color_relative(t[j].unmatched_total_per_1000)}catch(e){console.log(j+":"+e.message),console.log(t)}})})}function change_age(t){current_age=t,document.getElementById("custom_age").innerHTML=t,"absolute"==document.getElementById("select_relative").value?(j=-1,svg.selectAll("path").transition().duration(200).style("fill",function(e){return j++,e.color=color(data[j].unmatched[t-18])})):(j=-1,max=0,svg.selectAll("path").transition().duration(200).style("fill",function(e){return j++,data[j].unmatched_per_1000[t-18]>max&&(max=data[j].unmatched_per_1000[t-18]),e.color=color_relative(data[j].unmatched_per_1000[t-18])}))}var width=600,height=400,projection=d3.geo.mercator().scale(5e3).center([8,46.7]).translate([width/2,height/2]),path=d3.geo.path().projection(projection),svg=d3.select("#map").append("svg").attr("width",width).attr("height",height),data,data_ages,current_age,ages_loaded=!1,i=-1,color=d3.scale.linear().domain([0,0,4e4]).range(["green","white","red"]),color_relative=d3.scale.linear().domain([-200,0,200]).range(["red","white","green"]),captionCloseTimeout,caption=d3.select("body").append("div").attr("id","caption").html("Hover a canton to learn more.");d3.json("data/unmatched_global.json",function(t){data=t.map(function(t){return i++,t});var e=data[25];data[25]=data[24],data[24]=e,merge_topojson(data)});var j=-1;d3.select(self.frameElement).style("height",height+"px"),d3.select("select").on("change",function(){"absolute"==this.value?(j=-1,svg.selectAll("path").transition().duration(200).style("fill",function(t){return j++,t.color=color(data[j].unmatched_total)})):(j=-1,svg.selectAll("path").transition().duration(200).style("fill",function(t){j++;try{return t.color=color_relative(data[j].unmatched_total_per_1000)}catch(t){console.log(j+":"+t.message)}}))});