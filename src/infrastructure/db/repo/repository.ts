

export default class Repository<TModel> {
    private collectionName: string;
    private fromDocumentFunc: (doc: any) => TModel;
    private transformIdFunc: (id: string) => any;

    constructor(type: Function) {
        this.collectionName = type['collectionName'] || type['name'];
        this.fromDocumentFunc = type['fromDocument'];
        this.transformIdFunc = type['transformId'] || (id => id);

        if (typeof this.fromDocumentFunc !== 'function') {
            throw new Error('Repository type constructor is missing the fromDocument function');
        }

        if (typeof this.collectionName !== 'string') {
            throw new Error('Could not determine repository collection name from type constructor');
        }
    }

    create(model: TModel): Promise<TModel> {
        var dfd = Q.defer<TModel>(),
            document = Repository.toDocument(model);

        this.getCollection()
            .then(collection => {
                collection.insert(document, (err, result) => {
                    if (err) dfd.reject(err);
                    else {
                        var inserted = result.ops[0];
                        dfd.resolve(this.createInstance(inserted));
                    }
                });
            })
            .fail(err => dfd.reject(err));

        return dfd.promise;
    }

    createAll(models: TModel[]): Promise<TModel[]> {
        var dfd = Q.defer<TModel[]>(),
            documents = models.map(model => Repository.toDocument(model));

        this.getCollection()
            .then(collection =>
                collection.insert(documents, (err, result) => {
                    if (err) dfd.reject(err);
                    else dfd.resolve(result);
                }))
            .fail(dfd.reject);

        return dfd.promise;
    }

    findById(id: string): Promise<TModel> {
        var dfd = Q.defer<TModel>();

        this.getCollection()
            .then(collection =>
                collection.findOne({ _id: this.transformIdFunc(id) }, (err, result) => {
                    if (err) dfd.reject(err);
                    else dfd.resolve(!result ? null : this.createInstance(result));
                }))
            .fail(dfd.reject);

        return dfd.promise;
    }

    findOne(query: Object): Promise<TModel> {
        var dfd = Q.defer<TModel>();

        this.getCollection()
            .then(collection => collection
                .findOne(query, (err, result) => {
                    if (err) dfd.reject(err);
                    else dfd.resolve(!result ? null : this.createInstance(result));
                }))
            .fail(dfd.reject);

        return dfd.promise;
    }

    findAll(query: Object): FindBuilder<TModel> {
        return new FindBuilder((opts: CollectionFindOptions, hasProjection: boolean) => {
            var dfd = Q.defer<TModel[]>();

            this.getCollection()
                .then(collection => collection
                    .find(query, opts)
                    .toArray((err, documents) => {
                        if (err) dfd.reject(err);
                        else if (hasProjection) {
                            dfd.resolve(documents);
                        }
                        else {
                            var results = documents.map(doc => this.createInstance(doc));
                            dfd.resolve(results);
                        }
                    }))
                .fail(dfd.reject);

            return dfd.promise;
        });
    }

    update(model: TModel): Promise<TModel> {
        var dfd = Q.defer<TModel>(),
            document = model.toDocument();

        this.getCollection()
            .then(collection => collection
                .save(document, (err, result) => {
                    if (err) dfd.reject(err);
                    else dfd.resolve(!result ? null : this.createInstance(result));
                }))
            .fail(dfd.reject);

        return dfd.promise;
    }

    removeDocument(model: TModel): Promise<any> {
        return this.remove({ _id: model.getId() });
    }

    remove(query: Object): Promise<any> {
        var dfd = Q.defer<any>();

        this.getCollection()
            .then(collection => collection
                .remove(query, (err, result) => {
                    if (err) dfd.reject(err);
                    else dfd.resolve(result);
                }))
            .fail(dfd.reject);

        return dfd.promise;
    }

    protected createInstance(document: any): TModel {
        return this.fromDocumentFunc(document);
    }

    protected getCollection(): Promise<Collection> {
        var dfd = Q.defer<Collection>();
        MongoConnection.connect()
            .then(db => dfd.resolve(db.getCollection(this.collectionName)))
            .fail(err => dfd.reject(err));

        return dfd.promise;
    }

    private static toDocument<T extends IEntity>(model: T): any {
        if (!model) {
            throw new Error('Can not insert null value');
        }

        if (typeof model['toDocument'] !== 'function') {
            throw new Error('Model missing toDocument function');
        }

        return model.toDocument();
    }
}

export = Repository;