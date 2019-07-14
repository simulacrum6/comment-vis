/**
 * Counts the ocurrences of strings in the given list of strings.
 * Returns a list of value-count tuples. The list can be sorted, using the sort parameter.
 *
 * Example:
 * ```
 * let values = ['foo', 'foo', 'bar', 'baz']
 * let counts = valueCounts(values)
 * console.log(counts)
 * > [
 *     { value: 'foo', count: 2 },
 *     { value: 'bar', count: 1 },
 *     { value: 'baz', count: 1 }
 *  ]
 * ```
 */
export function valueCounts(values: string[], sort?: 'ascending' | 'descending' | void): {value: string, count: number}[] {
    const uniqueValues = new Set(values);
    const countMap: {[key: string]: number} = {};
    uniqueValues.forEach(value => countMap[value] = 0);
    values.forEach(value => countMap[value]++);
    let counts = Object.entries(countMap).map(entry => ({value: entry[0], count: entry[1]}));
    if (sort) {
        counts = counts.sort((a,b) => a.count - b.count);
        counts = sort === 'descending' ? counts.reverse() : counts;
    }
    return counts;
}

export function sum(x: number, y: number): number {
    return x + y;
}

/**
 * Flattens the given two-dimensional array into a one-dimensional one.
 */
export function flatten<T>(xs: T[][]): T[] {
    return [].concat(...xs);
}

/**
 * Interpolates within a certain range of values.
 * (The range is stored usually stored in the closure.)
 * @param step interpolation step, must be between 0 (start) and 1 (end).
 */
export type Interpolator = (step: number) => number;

/**
 * Returns a linear Interpolator function for the given range.
 *
 * Overflow behaviour (when 'step' lies outside of [0,1]) can be defined in the following ways:\
 * 'boundary' returns the boundaries of the interval, i.e. 'start' or end'\
 * 'cycle' forces the 'step' into [0,1], using the modulo.
 * 'scale' just uses the value given to scale the intepolation beyond its interval.
 *
 * @param start  the start of the interpolation interval.
 * @param end  the end of the interpolation interval.
 * @param overflow  how to handle a step value outside the valid interval, defaults to 'scale'.
 */
export function makeInterpolator(start: number, end: number, overflow = 'scale'): Interpolator {
    if (start > end) { throw Error(`"start" must be smaller than "end". start: ${start}, end: ${end}`); }

    const range = end - start;

    if (overflow === 'boundary') {
        return (step: number) => {
            step = Math.max(0, step);
            step = Math.min(1, step);
            return start + range * step;
        };
    }

    if (overflow === 'cycle') {
        return (step: number) => {
            return start + range * (step % 1);
        };
    }

    // default 'scale'
    return (step: number) => {
        return start + range * step;
    };
}
