/**
 * Returns a list of value-count tuples.
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
