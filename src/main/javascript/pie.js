// TODO: write javadoc

d3.select('*').__proto__.pipe = selectionPipe;

// TODO: harmonize 
const DEFAULTS = {
  radius: 500,
  cutout: 0.6,
  extension: 1.05,
  palette: d3.scaleOrdinal(d3.schemePaired),
  colors: {
    positive: d3.schemeGreens,
    negative: d3.schemeReds
  }
};

const DEFAULT_CONFIG = {
  aspect: "Node",
  width: 500 * 1.2,
  height: 500 * 1.2,
  center: 500 / 2 * 1.2,
  radius: 500 / 2,
  innerRadius: 500 / 2 * 0.6,
  padRadius: 500 / 2 * 1.2,
  extension: 500 / 2 * 1.2 - 500 / 2,
  colors: DEFAULTS.palette
}

const generateId = (length) => {
  length = length || 8;
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  while (text.length < length)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const colors = d3.scaleOrdinal(d3.schemeAccent);

const entryTransition = d3.transition()
  .ease(d3.easeQuadInOut) // animation function f(t) -> y
  .duration(666)

const afterEntryTransition = d3.transition()
  .ease(d3.easeQuadIn)
  .duration(133)

const growTransition = d3.transition()
  .duration(300);

const shrinkTransition = d3.transition()
  .duration(300);

const fitTransition = d3.transition()
  .duration(333)
  .ease(d3.easeQuadInOut);

const fadeInAnimation = (selection) => {
  return selection
    .style('opacity', 0)
    .transition(entryTransition)
    .delay(150)
    .style('opacity', 1)
}

const spinInAnimation = (selection, arc, spinRight = true) => {
  let startPoint = spinRight ? { startAngle: 0, endAngle: 0 } : { startAngle: (Math.PI * 2), endAngle: (Math.PI * 2) };
  return selection
    .transition(entryTransition)
    .attrTween('d', (slice) => {
      let interpolateArc = d3.interpolate(startPoint, slice);
      return (t) => arc(interpolateArc(t));
    })
}

const fitToNewSizeAnimation = (selection, arc, oldSlices) => {
  selection
    .transition(entryTransition)
    .attrTween('d', (slice, i) => {
      let interpolateArc = d3.interpolate({ startAngle: oldSlices[i].startAngle, endAngle: oldSlices[i].endAngle }, slice)
      return (t) => arc(interpolateArc(t));
    })
}

const growAnimation = (selection, arc, radius) => {
  selection
    .transition(growTransition)
    .attrTween('d', (slice) => {
      var interpolator = d3.interpolate(slice.outerRadius, radius);
      return (t) => {
        slice.outerRadius = interpolator(t);
        return arc(slice);
      };
    });
}

const shrinkAnimation = (selection, arc, radius) => {
  selection
    .transition(shrinkTransition)
    .attrTween('d', (slice) => {
      var interpolator = d3.interpolate(slice.outerRadius, radius);
      return (t) => { slice.outerRadius = interpolator(t); return arc(slice); };
    });
}

class Donut {

  constructor(data = [], container = 'body', options = DEFAULT_CONFIG) {
    // initialize all fields
    this.data = data;
    this.container = container;
    this.options = { ...DEFAULT_CONFIG, ...options };
    this.id = this.options.id || generateId();
    this._constructing = true;

    const donut = this;

    // create svg in container element
    const graphic = d3.select(container).append('svg')
      .attr('width', donut.options.width)
      .attr('height', donut.options.height)
      .attr('id', donut.id)
      .append('g')
        .attr('class', 'center')
        .attr('transform', `translate(${donut.options.center},${donut.options.center})`)

    // create center circle and label
    const centerCircle = graphic.append('g')
      .attr('class', 'center-circle')

    const circle = centerCircle.append('circle')
      .attr('r', donut.options.innerRadius)
      .style('fill', 'white')

    const centerLabel = centerCircle.append('text')
      .text(donut.options.aspect)
      .attr('text-anchor', 'middle');

    // create slices around center
    this.update(data);
  }

  getContainerElement() {
    return d3.select(this.container);
  }

  getSvgElement() {
    return d3.select(`#${this.id}`);
  }

  getElement() {
    return this.getSvgElement();
  }

  getCenter() {
    return this.getElement().select('.center')
  }

  getCenterCircle() {
    return this.getCenter().select('.center-circle');
  }

  getCenterLabel() {
    return this.getCenterCircle().select('text');
  }

  getSegments() {
    return this.getCenter().selectAll('.segment')
  }

  getSlices() {
    return this.getSegments().select('path');
  }

  getLabels() {
    return this.getSegments().select('text');
  }

  update(data) {
    const donut = this;

    // generators for pie charts
    const arc = d3.arc()
      .innerRadius(donut.options.innerRadius)
      .padRadius(donut.options.padRadius)

    const pie = d3.pie()
      .sort(null)
      .value(data => data.y) // property y determines size of pie slice

    // update existing elements
    const segments = donut.getSegments().data(pie(data));

    const updatedSlices = segments.select('path')
      .attr('d', arc)
      .each(slice => slice.outerRadius = donut.options.radius);

    const updatedLabels = donut.getLabels()
      .attr('transform', (slice) => `translate(${arc.centroid(slice)})`)
      .text((slice) => slice.data.x);

    // add new elements
    const newSegments = segments.enter()
      .append('g')
      .attr('class', 'segment')

    const newSlices = newSegments.append('path')
      .attr('d', arc)
      .each(slice => slice.outerRadius = donut.options.radius)
      .style('fill', (slice, i) => colors(i))
      .on('mouseenter', (slice, i) => {
        const segment = d3.select(d3.event.target);
        growAnimation(segment, arc, donut.options.padRadius);
      })
      .on('mouseleave', (slice, i) => {
        const segment = d3.select(d3.event.target)
        shrinkAnimation(segment, arc, donut.options.radius);
      })

    const newSliceLabels = newSegments.append('text') // add label
      .attr('transform', (slice) => `translate(${arc.centroid(slice)})`)
      .text((slice) => slice.data.x);

    // delete obsolete elements
    const obsoleteSegments = segments.exit().remove();

    // animations
    const oldSlices = pie(donut.data);

    fitToNewSizeAnimation(updatedSlices, arc, oldSlices);
    spinInAnimation(newSlices, arc, donut._constructing);
    fadeInAnimation(updatedLabels);
    fadeInAnimation(newSliceLabels);
    
    // animate center label if changed
    if (donut._constructing) {
      fadeInAnimation(donut.getCenterLabel());
      donut._constructing = false;
    }

    // update data
    donut.data = data;
  }
}

class DonutFactory {

  static create(data) {
    return new Donut(data);
  }

  static bake(data) {
    return DonutFactory.create(data);
  }
}

/**
 * Returns the composition of the given functions.
 * The the functions are applied in order.
 * @param {function} f
 * @param {function} g 
 */
function compose(f, g) {
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
 * Applies the given selectionOperations to a selection.
 * @param {...function} selectionOperations a number of higher order functions, returning a function that takes a selection and returns it after applying the given selectionOperations 
 */
function selectionPipe(...selectionOperations) {
  return pipe(...selectionOperations)(this)
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

/**
 * Test Stuff
 */

const data = [
  { x: 'Pet', y: 3 },
  { x: 'Bet', y: 4 },
  { x: 'Mett', y: 9 }
]

const newData = [
  { x: 'Foo', y: 4 },
  { x: 'Bar', y: 9 },
  { x: 'Baz', y: 3 },
  { x: 'lel', y: 6 },
  { x: 'whet', y: 13 },
]

let donut = DonutFactory.bake(data);
let other = DonutFactory.bake(newData);
setTimeout(() => donut.update(newData), 1500)