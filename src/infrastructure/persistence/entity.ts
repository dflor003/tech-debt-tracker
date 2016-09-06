interface IEntity {
    getId(): string;
    toDocument(): Object;
}

export default IEntity;