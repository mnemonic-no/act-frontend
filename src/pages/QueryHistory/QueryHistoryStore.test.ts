import {parseQueryHistoryExport, queryHistoryExport} from "./QueryHistoryStore";
import {Query} from "../types";

const query = (args: { [key: string]: any }): Query => {
    return {
        ...{
            id: "123",
            result: {facts: {}, objects: {}},
            search: {id: 'Axiom', factTypeName: 'alias'}
        },
        ...args
    }
};

it('can export query history', () => {
    expect(
        queryHistoryExport([(query({id: 'Axiom', factTypeName: 'alias'}))]))
        .toEqual({version: '1.0.0', queries: []});

    const objectTypeQuery = {objectType: 'threatActor', objectValue: 'Axiom'};
    const graphQuery = {
        objectType: 'threatActor',
        objectValue: 'Sofacy',
        query: "g.optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).repeat(inE('attributedTo').otherV()).times(2).inE('observedIn').otherV().hasLabel('content').outE('classifiedAs').otherV().where(outE().has('value','malware')).where(inE('classifiedAs').otherV().outE('observedIn').otherV().repeat(outE('attributedTo').otherV()).times(2).count().is(eq(1L))).optional(emit().repeat(outE('alias').otherV()).until(cyclicPath())).inE('classifiedAs').otherV().outE().hasLabel(within('at','connectsTo')).otherV().inE('componentOf').otherV().hasLabel(within('fqdn','ipv4','ipv6')).not(where(outE().has('value','sinkhole'))).path().unfold()"
    };
    const filteredQuery = {
        objectType: "report",
        objectValue: "abcdef",
        factTypes: ["mentions"]
    };

    expect(
        queryHistoryExport([
            query({search: objectTypeQuery}),
            query({search: graphQuery}),
            query({search: filteredQuery}),]
        ))
        .toEqual({version: '1.0.0', queries: [objectTypeQuery, graphQuery, filteredQuery]});
});

it('can import query history', () => {
   expect(() => parseQueryHistoryExport(JSON.stringify({version: '1.0.0', queries: []})))
       .toThrow("Validation failed: query history export has no 'queries'");

    expect(() => parseQueryHistoryExport(JSON.stringify({version: '1.0.0', queries: [{bad: "data"}]})))
        .toThrow("Queries must have objectType and objectValue: {\"bad\":\"data\"}");

    expect(parseQueryHistoryExport(JSON.stringify({version: '1.0.0', queries: [{objectType: 'threatActor', objectValue: 'Axiom'}]})))
        .toEqual({version: '1.0.0', queries: [{objectType: 'threatActor', objectValue: 'Axiom'}]})
});