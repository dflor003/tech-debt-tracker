export type TransformFunc<TSource, TTarget> = (source: TSource) => TTarget;

export interface IMongoTypeMetadata<TModel, TDocument> {
    type: Object;
    collection?: string;
    fromDocument?: TransformFunc<TDocument, TModel>;
    toDocument?: TransformFunc<TModel, TDocument>;
}

export class MetadataManager {
    private metadataMap = new WeakMap<FunctionConstructor, IMongoTypeMetadata<any, any>>();

    clear(): this {
        this.metadataMap = new WeakMap<FunctionConstructor, IMongoTypeMetadata<any, any>>();
        return this;
    }

    metadataFor(type: any): IMongoTypeMetadata<any, any> {
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
            map.set(target, {
                type: target,
                fromDocument: document => new target.constructor(document),
                toDocument: () => {
                    throw new Error('Please specify a toDocument function using @ToDocument or @Model')
                }
            });
        }

        // Otherwise return it
        return map.get(target) as IMongoTypeMetadata<any, any>;
    }
}

let instance: MetadataManager = null;
export default function metadataManager() {
    return instance || (instance = new MetadataManager());
}