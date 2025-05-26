/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { expectType, expectError } from "tsd";
import { Comparator, ScalarComparator } from "../../src/utils/comparator";

// Dummy types for testing
interface Foo {
  value: number;
}

declare const fooComparator: Comparator<Foo>;
expectType<(a: Foo, b: Foo) => boolean>(fooComparator.isEqual);

// Should error if isEqual is missing or wrong type
// @ts-expect-error
const badComparator: Comparator<Foo> = {};
// @ts-expect-error
const badComparator2: Comparator<Foo> = { isEqual: (a: Foo, b: Foo) => 123 };

// ScalarComparator

declare const fooScalarComparator: ScalarComparator<Foo>;
expectType<(a: Foo, b: Foo) => boolean>(fooScalarComparator.isEqual);
expectType<(a: Foo, b: Foo) => boolean>(fooScalarComparator.isLessThan);
expectType<(a: Foo, b: Foo) => boolean>(fooScalarComparator.isGreaterThan);

// Should error if isLessThan or isGreaterThan are missing or wrong type
// @ts-expect-error
const badScalarComparator: ScalarComparator<Foo> = { isEqual: (a, b) => true };
// @ts-expect-error
const badScalarComparator2: ScalarComparator<Foo> = {
  isEqual: (a, b) => true,
  isLessThan: (a, b) => true,
};
// @ts-expect-error
const badScalarComparator3: ScalarComparator<Foo> = {
  isEqual: (a, b) => true,
  isLessThan: (a, b) => true,
  isGreaterThan: (a, b) => 123,
};
