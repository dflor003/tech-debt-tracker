import * as uuid from 'node-uuid';
import {ObjectID} from 'mongodb';
export type TransformFunc<TSource, TTarget> = (source: TSource) => TTarget;

export interface IMongoTypeMetadata<TModel, TDocument> {
    type: Object;
    collection?: string;
    fromDocument?: TransformFunc<TDocument, TModel>;
    toDocument?: TransformFunc<TModel, TDocument>;
    idMember?: string|Symbol;
}

class MongoTypeMetadata<TModel, TDocument> {
    type: Object;
    collection: string;
    fromDocument: TransformFunc<TDocument, TModel>;
    toDocument: TransformFunc<TModel, TDocument>;
    idMember: string|Symbol;
    idType: 'objectid' | 'uuid';

    constructor(type: any) {
        this.type = type;
        this.fromDocument = document => new type.constructor(document);
        this.toDocument = <any>(() => {
            throw new Error('Please specify a toDocument function using @ToDocument or @Model')
        });
    }

    newIdForModel(): any {
        switch (this.idType || '') {
            case 'uuid': return uuid.v4();
            case 'objectid': return new ObjectID();
            default: throw new Error(`Could not generate id for type: ${this.type}`)
        }
    }
}

export class MetadataManager {
    private metadataMap = new WeakMap<FunctionConstructor, MongoTypeMetadata<any, any>>();

    clear(): this {
        this.metadataMap = new WeakMap<FunctionConstructor, MongoTypeMetadata<any, any>>();
        return this;
    }

    metadataFor(type: any): MongoTypeMetadata<any, any> {
        // Error check
        if (!type) {
            throw new Error(`Can not get metadata for non-function: '${type}'`);
        }

        // Resolve what the actual target should be
        let target = typeof type === 'function'
            ? type.prototype
            : type;

        // Create it if it doesn't exist
        const map = this.metadataMap;
        if (!map.has(target)) {
            map.set(target, new MongoTypeMetadata(target));
        }

        // Otherwise return it
        return map.get(target) as MongoTypeMetadata<any, any>;
    }
}

let instance: MetadataManager = null;
export default function metadataManager() {
    return instance || (instance = new MetadataManager());
}