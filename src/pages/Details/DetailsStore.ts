import MainPageStore from "../MainPageStore";


class DetailsStore {
    root: MainPageStore;

    constructor(root: MainPageStore) {
        this.root = root;
    }
}


export default DetailsStore;