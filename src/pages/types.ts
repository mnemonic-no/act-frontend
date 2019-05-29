export type Search = {
    objectType: string,
    objectValue: string,
    query?: string,
    factTypes?: Array<string>
}

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

export type Query = {
    id: string,
    result: QueryResult,
    search: Search
}

