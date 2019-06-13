export type NamedId = {
    id: string,
    name: string
}

export type ObjectStats = {
    type: NamedId
    count: number,
    lastAddedTimestamp: string,
    lastSeenTimestamp: string,
}

export type ActObject = {
    id: string,
    type: NamedId,
    value: string,
    statistics?: Array<ObjectStats>
}

export type ActFact = {
    id: string,
    type: NamedId,
    value?: string,
    inReferenceTo?: NamedId,
    organization: NamedId,
    source: NamedId,
    accessMode: string,
    timestamp: string,
    lastSeenTimestamp: string,
    sourceObject?: ActObject,
    destinationObject?: ActObject,
    bidirectionalBinding: boolean,
    // Client side
    retracted?: Boolean,
    retraction?: ActFact
}

export type FactType = {
    id: string,
    name: string,
    namespace: NamedId,
    relevantObjectBindings: Array<{
        bidirectionalBinding: boolean,
        sourceObjectType: NamedId,
        destinationObjectType: NamedId
    }>,
    validator: string,
    validatorParameter: string
};

export type QueryResult = {
    facts: { [id: string]: ActFact },
    objects: { [id: string]: ActObject }
}

export type SingleFactSearch = {
    id: string,
    factTypeName: string
}

export type ObjectFactsSearch = {
    objectType: string,
    objectValue: string,
    query?: string,
    factTypes?: Array<string>
}

export type Search = SingleFactSearch | ObjectFactsSearch

export type Query = {
    id: string,
    result: QueryResult,
    search: Search
}

export const searchId = (search : Search )=> {
    if (isObjectSearch(search)) {
        return [search.objectType, search.objectValue, search.query, search.factTypes]
            .filter(x => x)
            .join(":");
    } else {
        return search.id;
    }
};

export const isObjectSearch = (search : Search) : search is ObjectFactsSearch => {
    return (<ObjectFactsSearch>search).objectType !== undefined;
};

export const isFactSearch = (search : Search) : search is SingleFactSearch => {
    return (<SingleFactSearch>search).factTypeName !== undefined;
};
