import { workingHistoryToPath } from './WorkingHistory';
import { WorkingHistoryItem } from '../../core/types';

const searchItem = (args: { [key: string]: any }): WorkingHistoryItem => {
  const defaults = {
    id: 'defaultId',
    result: { facts: {}, objects: {} },
    search: {
      kind: 'objectFacts' as 'objectFacts',
      objectType: '',
      objectValue: ''
    }
  };

  return { ...defaults, ...args };
};

it('can convert working history to path', () => {
  expect(workingHistoryToPath([searchItem({})])).toEqual('');
  expect(
    workingHistoryToPath([
      searchItem({ search: { kind: 'objectFacts', objectType: 'threatActor', objectValue: 'Axiom' } })
    ])
  ).toEqual('/object-fact-query/threatActor/Axiom');

  expect(
    workingHistoryToPath([
      searchItem({
        search: {
          kind: 'objectTraverse',
          objectType: 'threatActor',
          objectValue: 'Axiom',
          query:
            "g.optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).repeat(inE('attributedTo').otherV()).times(2).inE('observedIn').otherV().hasLabel('content').outE('classifiedAs').otherV().where(outE().has('value','malware')).where(inE('classifiedAs').otherV().outE('observedIn').otherV().repeat(outE('attributedTo').otherV()).times(2).count().is(eq(1L))).optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).inE('classifiedAs').otherV().outE().hasLabel(within('at','connectsTo')).otherV().inE('componentOf').otherV().hasLabel(within('fqdn','ipv4','ipv6')).not(where(outE().has('value','sinkhole'))).path().unfold()"
        }
      })
    ])
  ).toEqual(
    "/graph-query/threatActor/Axiom/g.optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).repeat(inE('attributedTo').otherV()).times(2).inE('observedIn').otherV().hasLabel('content').outE('classifiedAs').otherV().where(outE().has('value'%2C'malware')).where(inE('classifiedAs').otherV().outE('observedIn').otherV().repeat(outE('attributedTo').otherV()).times(2).count().is(eq(1L))).optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).inE('classifiedAs').otherV().outE().hasLabel(within('at'%2C'connectsTo')).otherV().inE('componentOf').otherV().hasLabel(within('fqdn'%2C'ipv4'%2C'ipv6')).not(where(outE().has('value'%2C'sinkhole'))).path().unfold()"
  );
});
