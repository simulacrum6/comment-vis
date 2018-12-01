const data = [
    { x: 'Pet', y: 3},
    { x: 'Bet', y: 4},
    { x: 'Significosis', y: 9}
]

const colors = d3.scaleOrdinal(d3.schemeAccent);

const config = {
    width: 500 * 1.2,
    height: 500 * 1.2,
    center: 500 / 2,
    radius: 500 / 2,
    innerRadius: 500 / 2 * 0.6,
    padRadius: 500 / 2 * 1.2,
    extension: 500 / 2 * 1.2 - 500 /2
}

// arc generator
const arc = d3.arc()
    .innerRadius(config.innerRadius)
    .padRadius(config.padRadius)

const highlightArc = d3.arc()
    .outerRadius(config.radius * 1.2)
    .innerRadius(config.innerRadius)

// pie generator
const pie = d3.pie()
    .sort(null) // do not sort
    .value(data => data.y) // use property y as values

// graphic
const graphic = d3.select('body').append('svg')
    .attr('width', config.width)
    .attr('height', config.height)
    .append('g')
        .attr('transform', `translate(${config.center},${config.center})`)

const nodeText = graphic.append('text')
    .text('Node')


var slices = graphic.selectAll('.arc')
    .data(pie(data)) // update existing nodes by binding data using pie generator: f(data) -> f(data.y) -> angle
        .attr('class', 'updated')

var newSlice = slices.enter().append('g') // add new node
    .attr('class', 'arc')
    
var entryTransition = d3.transition()
    .ease(d3.easeQuadInOut) // animation function f(t) -> y
    .duration(666)

var afterEntryTransition = d3.transition()
    .ease(d3.easeQuadIn)
    .duration(133)

newSlice.append('path') // add slice
    .attr('d', arc) // set angle, using arc generator: f(data) -> path 
    .each(slice => slice.outerRadius =  config.radius)
    .style('fill', (slice, i) => colors(i))
    .on('mouseenter', (d) => {
        d3.select(d3.event.target)
        .style('fill', 'blue')
        .transition()
        .duration(300)
            .attrTween('d', (d) => {
                var interpolator = d3.interpolate(d.outerRadius, config.padRadius);
                return (t) => { d.outerRadius = interpolator(t); return arc(d); };
            });    
    })
    .on('mouseleave', (d,i) => {
        d3.select(d3.event.target)
        .style('fill', colors(i))
        .transition()
        .duration(300)
        .delay(150)
        .attrTween("d", (d) => {
            var interpolator = d3.interpolate(d.outerRadius, config.radius);
            return (t) => { d.outerRadius = interpolator(t); return arc(d); };
        });
    })
    .transition(entryTransition)
        .attrTween('d', (slice) => { // modifies the path during animation f(arc,t) -> partialArc
            let interpolateArc = d3.interpolate({ startAngle: 0, endAngle: 0 }, slice) // returns an interpolator f(t) -> y, interpolating the width of the arc.
            return (t) => arc(interpolateArc(t)); 
        })

let sliceText = newSlice.append('text') // add label
    .attr('transform', (slice) => `translate(${arc.centroid(slice)})`)
    .text((slice) => slice.data.x);

vectorize(fadeInAnimation)(nodeText, sliceText)



var obsoleteSlice = slices.exit() // remove unnecessary nodes
        .remove()

function fadeInAnimation(selection) {
    return selection
        .style('opacity', 0)
        .transition(entryTransition)
        .transition(afterEntryTransition)
            .style('opacity', 1)
}

/**
 * Returns the composition of the given functions.
 * The the functions are applied in order.
 * @param {function} f
 * @param {function} g 
 */
function compose(f,g) {
    return (...xs) => (g(f(...xs)));
}

/**
 * Returns the composition of the given functions.
 * @param {...function} fs
 */
function pipe(...fs) {
    const f = fs.shift();
    return fs.reduce(compose, f);
}

/**
 * Partially applies the given function with the given arguments.
 * @param {function} f the function
 * @param  {...any} xs arguments to f 
 */
function curry(f, ...xs) {
    return (...ys) => f(...xs.concat(ys))
}

function vectorize(f) {
    return (...xs) => xs.map(x => f(x));
}
