interface IEntity {
    getId(): string;
    toDocument(): Object;
}

export = IEntity;