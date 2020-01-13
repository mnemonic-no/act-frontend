import {
  urlToGraphQueryPage,
  urlToMultiObjectQueryPage,
  urlToObjectFactQueryPage,
  urlToObjectSummaryPage
} from './Routing';
import { actObject, objectTypes } from './core/testHelper';

it('can make url to object summary page', () => {
  expect(urlToObjectSummaryPage(actObject({ type: objectTypes.threatActor, value: 'Sofacy' }))).toEqual(
    '/object-summary/threatActor/Sofacy'
  );

  expect(
    urlToObjectSummaryPage(actObject({ type: objectTypes.uri, value: 'http://this.is.a.test.com/?x=abc&y=123' }))
  ).toEqual('/object-summary/uri/http%3A%2F%2Fthis.is.a.test.com%2F%3Fx%3Dabc%26y%3D123');
});

it('can make url to the object fact query page', () => {
  expect(
    urlToObjectFactQueryPage({
      kind: 'objectFacts',
      objectType: 'uri',
      objectValue: 'http://this.is.a.test.com/?x=abc&y=123'
    })
  ).toEqual('/object-fact-query/uri/http%3A%2F%2Fthis.is.a.test.com%2F%3Fx%3Dabc%26y%3D123');
});

it('can make url to the object traverse search', () => {
  expect(
    urlToGraphQueryPage({
      kind: 'objectTraverse',
      objectType: 'threatActor',
      objectValue: 'Sofacy',
      query:
        "g.outE('componentOf').otherV().hasLabel('uri').optional(inE().hasLabel(within('at','connectsTo'))" +
        ".otherV().outE('classifiedAs').otherV().optional(emit().repeat(outE('alias').otherV()).until(cyclicPath()))" +
        ".inE('classifiedAs').otherV()).outE('observedIn').otherV().repeat(outE('attributedTo').otherV()).times(2)" +
        ".optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).path().unfold()"
    })
  ).toEqual(
    "/graph-query/threatActor/Sofacy/g.outE('componentOf').otherV().hasLabel('uri').optional(inE().hasLabel(" +
      "within('at'%2C'connectsTo')).otherV().outE('classifiedAs').otherV().optional(emit().repeat(outE('alias')" +
      ".otherV()).until(cyclicPath())).inE('classifiedAs').otherV()).outE('observedIn').otherV()" +
      ".repeat(outE('attributedTo').otherV()).times(2).optional(emit().repeat(outE('alias').otherV())" +
      '.until(cyclicPath())).path().unfold()'
  );
});

it('can make url to the multi object traverse search', () => {
  expect(
    urlToMultiObjectQueryPage({
      kind: 'multiObjectTraverse',
      objectType: 'threatActor',
      objectIds: [
        '12345678-aaaa-bbbb-cccc-ddddddddeeee',
        'y2345678-aaaa-bbbb-cccc-ggggggghhhhh',
        'y2345678-aaaa-bbbb-cccc-iiiiiiiiiooo'
      ],
      query:
        "g.outE('componentOf').otherV().hasLabel('uri').optional(inE().hasLabel(within('at','connectsTo'))" +
        ".otherV().outE('classifiedAs').otherV().optional(emit().repeat(outE('alias').otherV()).until(cyclicPath()))" +
        ".inE('classifiedAs').otherV()).outE('observedIn').otherV().repeat(outE('attributedTo').otherV()).times(2)" +
        ".optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).path().unfold()"
    })
  ).toEqual(
    "/multi-object-traverse/threatActor/g.outE('componentOf').otherV().hasLabel('uri').optional(inE().hasLabel(within('at'%2C'connectsTo')).otherV().outE('classifiedAs').otherV().optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).inE('classifiedAs').otherV()).outE('observedIn').otherV().repeat(outE('attributedTo').otherV()).times(2).optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).path().unfold()/12345678-aaaa-bbbb-cccc-ddddddddeeee/y2345678-aaaa-bbbb-cccc-ggggggghhhhh/y2345678-aaaa-bbbb-cccc-iiiiiiiiiooo"
  );
});
