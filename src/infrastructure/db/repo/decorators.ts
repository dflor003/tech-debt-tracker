import metadataManager from './metadata-manager';

export function Model(collectionName?: string): ClassDecorator {
    return target => {
        const metadata = metadataManager().metadataFor(target);
        metadata.collection = typeof collectionName === 'string'
            ? collectionName
            : target.name;
    };
}

export function FromDocument(clazz?: FunctionConstructor): MethodDecorator {
    return (target, property) => {
        // Ensure you can only call it on static functions
        const isStatic = typeof target === 'function';
        if (!isStatic || typeof property !== 'string') {
            throw new Error(`@FromDocument() can only be used on static functions`);
        }

        // Store that function for creation time
        const metadata = metadataManager().metadataFor(target || clazz);
        const functionRef = target[property];
        metadata.fromDocument = document => functionRef.call(null, document);
    };
}

export function ToDocument(clazz?: FunctionConstructor): MethodDecorator {
    return (target, property) => {
        const metadata = metadataManager().metadataFor(target || clazz);
        metadata.toDocument = instance => {
            if (typeof target === 'function') {
                return target.call(null, instance);
            }

            return instance[property].call(instance);
        };
    };
}

export interface IIdOptions {
    type?: 'objectid' | 'uuid';
}

export function Id(opts?: IIdOptions): PropertyDecorator {
    return (target, property) => {
        // Error checks
        if (typeof target !== 'object' || typeof property !== 'string') {
            throw new Error('Must be called on instance field');
        }

        // Set which member is the id
        const metadata = metadataManager().metadataFor(target);
        metadata.idMember = property;

        // Setup transformations if passed
        opts = opts || {};
        if (typeof opts.type === 'string') {
            metadata.idType = <any>opts.type.toLowerCase();
        }
    };
}