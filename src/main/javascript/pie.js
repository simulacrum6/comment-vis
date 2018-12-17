d3.select('*').__proto__.pipe = selectionPipe;

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

const DEFAULTS = {
  radius: 500,
  cutout: 0.6,
  extension: 1.05,
  pallette: d3.scaleOrdinal(d3.schemePaired)
};

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
  console.log('growAnimation called')
  selection
    .transition(growTransition)
    .attrTween('d', (slice) => {
      console.log(`\tgrowing from ${slice.outerRadius} to ${radius}`)
      var interpolator = d3.interpolate(slice.outerRadius, radius);
      return (t) => {
        slice.outerRadius = interpolator(t);
        console.log('\t' + slice.outerRadius);
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

  constructor(data, container, id, options) {
    this.data = data || [];
    this.container = container || 'body';
    this.options = options || {};
    this._constructing = true;

    this.id = id;

    const donut = this;

    // graphic
    const graphic = d3.select(container).append('svg')
      .attr('width', options.width)
      .attr('height', options.height)
      .attr('id', id)
      .append('g')
      .attr('class', 'center')
      .attr('transform', `translate(${options.center},${options.center})`)

    const centerCircle = graphic.append('g')
        .attr('class', 'center-circle')
        
    const circle = centerCircle.append('circle')
        .attr('r', this.options.innerRadius)
        .style('fill', 'white')

    const centerLabel = centerCircle.append('text')
        .text(this.options.aspect)
        .attr('text-anchor', 'middle');

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

  update(d) {
    const donut = this;

    const arc = d3.arc()
      .innerRadius(donut.options.innerRadius)
      .padRadius(donut.options.padRadius)

    const pie = d3.pie()
      .sort(null) // do not sort
      .value(data => data.y) // use property y as values
    
    // update old elements
    const segments = donut.getSegments().data(pie(d));

    const updatedSlices = segments.select('path')
      .attr('d', arc)
      .each(slice => slice.outerRadius = donut.options.radius);

    const updatedLabels = donut.getLabels()
      .attr('transform', (slice) => `translate(${arc.centroid(slice)})`)
      .text((slice) => slice.data.x);

    // handle new elements
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
      .on('mousemove', (slice, i) => console.log(d3.mouse(d3.event.target)))
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
    vectorize(fadeInAnimation)(updatedLabels, newSliceLabels);
    if (donut._constructing) {
      fadeInAnimation(donut.getCenterLabel());
      donut._constructing = false;
    }

    donut.data = d;
  }
}

class DonutFactory {

  static create(data, container, options) {

    options = options || {
      aspect: "Node",
      width: 500 * 1.2,
      height: 500 * 1.2,
      center: 500 / 2 * 1.2,
      radius: 500 / 2,
      innerRadius: 500 / 2 * 0.6,
      padRadius: 500 / 2 * 1.2,
      extension: 500 / 2 * 1.2 - 500 / 2,
      colors: DEFAULTS.pallette
    }

    let id = generateId();

    container = container || 'body';

    return new Donut(data, container, id, options);
  }

  static bake(data, container, id, options) {
    return DonutFactory.create(data, container, id, options);
  }
}


let donut = DonutFactory.create(data);
let other = DonutFactory.create(newData);
setTimeout(() => donut.update(newData), 1500)


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
