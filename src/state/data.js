import { extendObservable, observable, transaction } from 'mobx';

import { setUnion, setDifference } from '../util/utils';
import { objectTypesFromObjects, factsToObjects } from '../core/transformers';

export class Data {
  constructor ({
    factsData = [],
    objectsData = [],
    factsSet = new Set(),
    objectsSet = new Set()
  } = {}) {
    // Populate objectsData
    if (objectsData.length === 0 && factsData.length > 0) {
      objectsData = factsToObjects(factsData);
    }

    // Ensure unique and populate sets
    let uniqueFacts = factsData;
    let uniqueObjects = objectsData;
    if (factsData.length !== factsSet.size) {
      uniqueFacts = factsData.filter(({ id }) => {
        if (factsSet.has(id)) return false;
        factsSet.add(id);
        return true;
      });
    }
    if (objectsData.length !== objectsSet.size) {
      uniqueObjects = objectsData.filter(({ id }) => {
        if (objectsSet.has(id)) return false;
        objectsSet.add(id);
        return true;
      });
    }

    this.factsData = uniqueFacts;
    this.objectsData = uniqueObjects;
    this.factsSet = factsSet;
    this.objectsSet = objectsSet;
  }

  merge (otherData) {
    const factsData = this.factsData.concat(
      otherData.factsData.filter(({ id }) => !this.factsSet.has(id))
    );
    const objectsData = this.objectsData.concat(
      otherData.objectsData.filter(({ id }) => !this.objectsSet.has(id))
    );
    return new Data({
      factsData,
      objectsData,
      factsSet: setUnion(this.factsSet, otherData.factsSet),
      objectsSet: setUnion(this.objectsSet, otherData.objectsSet)
    });
  }
}

class RootNode {
  toString () {
    return 'rootNode';
  }
  constructor () {
    const itemData = new Data();
    extendObservable(
      this,
      {
        itemData: itemData,
        data: itemData,
        searchHistory: [],
        objectTypes: [],
        children: []
      },
      {
        itemData: observable.ref,
        data: observable.ref,
        searchHistory: observable.ref,
        objectTypes: observable.ref,
        children: observable.shallow
      }
    );
  }

  removeChild (child) {
    this.children.remove(child);
  }

  addChild (child) {
    this.children.push(child);
  }
}

class DataNode {
  toString () {
    return JSON.stringify(this.search.objectValue);
  }
  constructor ({ itemData, search, parent }) {
    extendObservable(
      this,
      {
        itemData: itemData,
        search: search,

        parent: parent,
        children: [],

        get data () {
          return this.itemData.merge(this.parent.data);
        },

        get searchHistory () {
          return this.parent.searchHistory.concat(this.search);
        },

        get objectTypes () {
          return objectTypesFromObjects(this.data.objectsData);
        },

        get stats () {
          return {
            facts: this.itemData.factsData.length,
            objects: this.itemData.objectsData.length,
            uniqueFacts: setDifference(
              this.itemData.factsSet,
              this.parent.data.factsSet
            ).length,
            uniqueObjects: setDifference(
              this.itemData.objectsSet,
              this.parent.data.objectsSet
            ).length
          };
        }
      },
      {
        itemData: observable.ref,
        search: observable.ref,

        parent: observable.ref,
        children: observable.shallow
      }
    );
  }

  // Actions
  remove () {
    transaction(() => {
      this.parent.removeChild(this);
      this.children.forEach(child => {
        child.updateParent(this.parent);
        this.parent.addChild(child);
      });
    });
  }

  // Remove child reference
  removeChild (child) {
    this.children.remove(child);
  }

  updateParent (newParent) {
    this.parent = newParent;
  }

  addChild (child) {
    // TODO: Treat as list instead tree
    // this.children.push(child);
    if (this.children.length === 0) {
      this.children.push(child);
    } else {
      transaction(() => {
        const existingChild = this.children[0];
        this.children[0] = child;
        child.addChild(existingChild);
        existingChild.updateParent(child);
      });
    }
  }
}

class DataStore {
  constructor () {
    const root = new RootNode();
    extendObservable(
      this,
      {
        root: root,
        current: root,
        get isEmpty () {
          return this.current === this.root;
        },

        // For now we just use a single list
        get dataList () {
          const f = (acc, node) => {
            if (node.children.length === 0) return acc;
            return f(acc.concat(node.children[0]), node.children[0]);
          };
          return f([], this.root);
        },

        // For now we just use a single list
        get searchTree () {
          return this.dataList.map(x => x.search);
        }
      },
      {
        root: observable.ref,
        current: observable.ref
      }
    );
  }

  addNode ({ data, search }) {
    transaction(() => {
      const node = new DataNode({
        itemData: data,
        search,
        parent: this.current
      });
      this.current.addChild(node);
      this.updateCurrent(node);
    });
  }

  updateCurrent (node) {
    this.current = node;
  }

  removeNode (node) {
    transaction(() => {
      if (this.current === node) {
        if (node.parent === this.root && node.children.length > 0) {
          this.updateCurrent(node.children[0]);
        } else {
          this.updateCurrent(node.parent);
        }
      }
      node.remove();
    });
  }

  clear () {
    // TODO: Investigate possible memory leakage
    this.root = new RootNode();
    this.current = this.root;
  }
}

export default new DataStore();
