

var palette = {
    "lightgray": "#E5E8E8",
    "gray": "#777777",
    "white": "#FFFFFF",
    "blue": "#3B757F"
}

var color = d3.scale.category20();

var graph = getData();
graph.nodes.forEach(function(d) {
    d.size = 0.75 * d.size;
})
graph.links.forEach(function(l) {
    l.source = graph.nodes.map(function(e) {  return e.id; }).indexOf(l.source);
    l.target = graph.nodes.map(function(e) { return e.id; }).indexOf(l.target);
});


var width = window.innerWidth,
height = window.innerHeight;

console.log(width + " " + height);

var svg = d3.select("svg")
.attr("preserveAspectRatio", "xMinYMin meet")
.attr("viewBox", "0 0 " + width + " " + height)
.classed("svg-content-responsive", true);

var tip = d3.tip()
.attr('class', 'd3-tip')
.offset([-9, 0])
.html(function (d) {
    return  d.data + "";
})
svg.call(tip);


var force = d3.layout.force()
.nodes(graph.nodes)
.links(graph.links)
.charge(-2400)
.linkDistance(20)
.size([width,height]);

var link = svg.selectAll('line')
.data(graph.links).enter().append('line')
.attr("class", "link")
.attr('stroke', palette.lightgray)
.style("stroke-width", function(l) { return l.weight * 0.5 });


var node =  svg.selectAll('circle')
.data(graph.nodes).enter()
.append('g')
.call(force.drag)
.on('dblclick', connectedNodes)
.on('mouseover', tip.show) //Added
.on('mouseout', tip.hide); //Added
;

force.on('tick', function(e){
    graph.nodes[0].x = width / 2;
    graph.nodes[0].y = height / 2;
    
    node.attr('transform', function(d, i){
        return 'translate(' + d.x + ','+ d.y + ')'
    })
    
    link
    .attr('x1', function(d){ return d.source.x; })
    .attr('y1', function(d){ return d.source.y; })
    .attr('x2', function(d){ return d.target.x; })
    .attr('y2', function(d){ return d.target.y; })
});

node.append("clipPath")
.attr("id",function(d,i){ return "node_clip"+i })
.append("circle")
.attr("r",function(d) {
    return d.size-2; //-2 to see a small border line
});

node.append("circle")
.attr("r", function(d) {
    return d.size;
})
.style("fill", function(d){
    return palette.white
});

node.append('text')
.attr('text-anchor', 'middle')
.attr('dominant-baseline', 'central')
.attr('font-family', 'FontAwesome')
.attr('font-size', function(d) {return (d.size * 1.2) + "px";})
.style('fill', function(d) { return palette.gray})
.text(function(d) { return d.fa ? d.fa : "";})
.attr("clip-path",function(d,i){ return "url(#node_clip"+i+")" });
;

node.append("svg:image")
.attr("xlink:href", function(d) {
    if (d.img) return d.img;
    else return ""
    })
.attr("x", function(d) { return -d.size;})
.attr("y", function(d) { return -d.size;})
.attr("height", function(d) { return 2 * d.size;})
.attr("width", function(d) { return 2 * d.size;})
.attr("clip-path",function(d,i){ return "url(#node_clip"+i+")" })
.on("click", click);
function click(d) {
    if(d.group == 4){
        window.open(d.url, '_blank');
        window.focus();
    }
}
;

//Toggle stores whether the highlighting is on
var toggle = 0;
//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < graph.nodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
};
graph.links.forEach(function (d) {
    linkedByIndex[d.source + "," + d.target] = 1;
    linkedByIndex[d.target + "," + d.source] = 1;
});


//This function looks up whether a pair are neighbours
function neighboring(a, b) {
    return linkedByIndex[a.index + "," + b.index];
}
function connectedNodes() {
    if (toggle == 0) {
        //Reduce the opacity of all but the neighbouring nodes
        d = d3.select(this).node().__data__;
        console.log(d);
        node.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });
        link.style("opacity", function (o) {
            console.log(o);
            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
        });
        //Reduce the op
        toggle = 1;
    } else {
        //Put them back to opacity=1
        node.style("opacity", 1);
        link.style("opacity", 1);
        toggle = 0;
    }
}



force.start();

function getData() {
    return {
        "nodes": [
        {"id": "me", "data": "Rohit Ravishankar", "group": 1, "size": 120, "img": "img/rohit.jpeg"},
        
        {"id": "work", "data": "Work", "group": 2, "size": 40, "fa": '\uf0b1'},
        {"id": "w1", "data": "Gain Theory", "group": 2, "size": 50, "img": "img/GainTheory.jpg"},
        {"id": "w2", "data": "Tesco", "group": 2, "size": 50, "img": "img/Tesco.png"},
	{"id": "w3", "data": "Apple", "group": 2, "size": 50, "img": "img/Apple.png"},
        {"id": "w4", "data": "Accenture", "group": 2, "size": 50, "img": "img/Accenture.png"},
        
        {"id": "education", "data": "Education", "group": 3, "size": 40, "fa": '\uf19c'},
        {"id": "e1", "data": "Lilavatibai Podar Senior Secondary School", "group": 3, "size": 50, "img": "img/podar.jpg"},
        {"id": "e2", "data": "P.E.S. Institute of Technology", "group": 3, "size": 50, "img": "img/pesit.jpg"},
        {"id": "e3", "data": "Rochester Institute of Technology", "group": 3, "size": 50, "img": "img/rit.png"},
        
        {"id": "links", "data": "Links", "group": 4, "size": 40, "fa": '\uf007'},
        {"id": "l1", "data": "Github", "group": 4, "size": 30, "fa": '\uf09b', "url" : "https://github.com/rohitravishankar/"},
            {"id": "l2", "data": "LinkedIn", "group": 4, "size": 30, "fa": '\uf0e1', "url" : "https://www.linkedin.com/in/rohit-ravishankar/"},
                {"id": "l3", "data": "StackOverflow", "group": 4, "size": 30, "fa": '\uf16c', "url" : "https://stackoverflow.com/users/5924566/rohitravishankar"},
                    
                    {"id": "skills", "data": "Skills", "group": 5, "size": 40, "fa": '\uf109'},
                    {"id": "s1", "data": "Java", "group": 5, "size": 30, "img": "img/java.png"},
                    {"id": "s2", "data": "Python", "group": 5, "size": 30, "img": "img/python.png"},
		    {"id": "s3", "data": "R", "group": 5, "size": 30, "img": "img/Rlogo.svg"},
                    
                    {"id": "publications", "data": "Publications", "group": 7, "size": 40, "fa": '\uf1ea', "url" : "https://drive.google.com/open?id=0B1CTCo2mIyOSVnVwVXhJVjFVSHM"},
                    {"id": "p1", "data": "ViLeT Automatic Summarization", "group": 7, "size": 50, "img": "img/video-to-text.png", "url" : "https://drive.google.com/open?id=0B1CTCo2mIyOSVnVwVXhJVjFVSHM"}
                    ],
                    "links": [
                    {"source": "me", "target": "work", "weight": 10},
                    {"source": "me", "target": "education", "weight": 10},
                    {"source": "me", "target": "links", "weight": 10},
                    {"source": "me", "target": "skills", "weight": 10},
                    {"source": "me", "target": "publications", "weight": 10},
                    
                    {"source": "work", "target": "w1", "weight": 4},
                    {"source": "work", "target": "w2", "weight": 4},
                    {"source": "work", "target": "w3", "weight": 4},
		    {"source": "work", "target": "w4", "weight": 4},
                    
                    {"source": "education", "target": "e1", "weight": 4},
                    {"source": "education", "target": "e2", "weight": 4},
                    {"source": "education", "target": "e3", "weight": 4},
                    
                    {"source": "links", "target": "l1", "weight": 4},
                    {"source": "links", "target": "l2", "weight": 4},
                    {"source": "links", "target": "l3", "weight": 4},
                    
                    {"source": "skills", "target": "s1", "weight": 4},
                    {"source": "skills", "target": "s2", "weight": 4},
		    {"source": "skills", "target": "s3", "weight": 4},
                    
                    {"source": "publications", "target": "p1", "weight": 4}
                    
                    ]
                }
            }
