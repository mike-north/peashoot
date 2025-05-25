import { describe, it, expect } from "vitest";
import { temperatureComparator } from '../../src/values/temperature';

describe('temperatureComparator', () => {
  it('should consider equal temperatures in same unit', () => {
    expect(temperatureComparator.isEqual([0, 'C'], [0, 'C'])).toBe(true);
    expect(temperatureComparator.isEqual([32, 'F'], [32, 'F'])).toBe(true);
  });

  it('should consider equal temperatures in different units', () => {
    expect(temperatureComparator.isEqual([0, 'C'], [32, 'F'])).toBe(true);
    expect(temperatureComparator.isEqual([100, 'C'], [212, 'F'])).toBe(true);
  });

  it('should compare less than and greater than correctly', () => {
    expect(temperatureComparator.isLessThan([0, 'C'], [1, 'C'])).toBe(true);
    expect(temperatureComparator.isGreaterThan([1, 'C'], [0, 'C'])).toBe(true);
    expect(temperatureComparator.isLessThan([32, 'F'], [33, 'F'])).toBe(true);
    expect(temperatureComparator.isGreaterThan([33, 'F'], [32, 'F'])).toBe(true);
    expect(temperatureComparator.isLessThan([0, 'C'], [33.8, 'F'])).toBe(true);
    expect(temperatureComparator.isGreaterThan([1, 'C'], [32, 'F'])).toBe(true);
  });

  it('should treat temperatures within 0.01C as equal', () => {
    expect(temperatureComparator.isEqual([0, 'C'], [0.009, 'C'])).toBe(true);
    expect(temperatureComparator.isEqual([32, 'F'], [32.016, 'F'])).toBe(true);
  });
}); 