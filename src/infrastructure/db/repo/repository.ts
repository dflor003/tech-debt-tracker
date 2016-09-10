import metadataManager from './metadata-manager';
import {IMongoTypeMetadata} from './metadata-manager';
import {Collection} from 'mongodb';
import {getConnection, getLogger} from '../connection/connect';
import {ILogger} from '../util/default-logger';


export default class Repository<TModel, TDocument> {
    private log: ILogger;
    private metadata: IMongoTypeMetadata<TModel, TDocument>;
    private transformIdFunc: (id: string) => any;

    constructor(type: Function) {
        if (typeof type !== 'function') {
            throw new Error('Type must be a valid class');
        }

        this.metadata = metadataManager().metadataFor(type);
        if (!this.metadata) {
            throw new Error(`Could not find collection name for '${type.name}'`);
        }
        this.log = getLogger();
    }

    async create(model: TModel): Promise<TModel> {
        // Transform document
        const document = this.toDocument(model);

        // Do the write
        const collection = this.getCollection();
        const writeResult = await collection.insertOne(document);
        if (!writeResult.insertedCount) {
            throw new Error(`Failed to do a mongo insert into collection '${collection.collectionName}'`);
        }

        // Transform back to model
        const insertedDocument = writeResult.ops[0];
        if (!insertedDocument) {
            throw new Error(`Inserted document into '${collection.collectionName}' but did not get back result`);
        }
        return this.fromDocument(insertedDocument);
    }

    async createAll(...models: TModel[]): Promise<TModel[]> {
        // Error checks
        if (!models) {
            throw new Error('Must pass models');
        }

        if (!models.length) {
            return [];
        }

        // Transform to documents
        const documents = models.map(model => this.toDocument(model));

        // Do the writes
        const collection = this.getCollection();
        const writeResult = await collection.insertMany(documents);
        if (writeResult.insertedCount !== models.length) {
            throw new Error(`One or more insert operations failed for collection '${collection.collectionName}'. Expected ${models.length} but got ${writeResult.insertedCount}`);
        }

        // Transform back to models
        const insertedDocuments = writeResult.ops || [];
        if (!insertedDocuments || insertedDocuments.length !== models.length) {
            throw new Error(`Inserted document into '${collection.collectionName}' but did not get back result`);
        }
        return insertedDocuments.map(doc => this.fromDocument(doc));
    }

    findById(id: any): Promise<TModel> {
        var dfd = Q.defer<TModel>();

        this.getCollection()
            .then(collection =>
                collection.findOne({ _id: this.transformIdFunc(id) }, (err, result) => {
                    if (err) dfd.reject(err);
                    else dfd.resolve(!result ? null : this.fromDocument(result));
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
                    else dfd.resolve(!result ? null : this.fromDocument(result));
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
                            var results = documents.map(doc => this.fromDocument(doc));
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
                    else dfd.resolve(!result ? null : this.fromDocument(result));
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

    protected getCollection(): Collection {
        return getConnection().getCollection(this.metadata.collection);
    }

    protected fromDocument(document: TDocument): TModel {
        if (!document) {
            throw new Error('Can not convert a null document to instance');
        }

        return this.metadata.fromDocument(document);
    }

    private toDocument(model: TModel): TDocument {
        if (!model) {
            throw new Error('Can not insert null value');
        }

        return this.metadata.toDocument(model);
    }
}