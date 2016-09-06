import {expect} from 'chai';
import {Model, FromDocument, ToDocument} from '../../src/infrastructure/db/repo/decorators';
import manager from '../../src/infrastructure/db/repo/metadata-manager';

describe('Mongo configuration decorators', () => {
    beforeEach(() => manager().clear());

    describe('@Model', () => {
        describe('when collection name passed', () => {
            it('should set collection name on metadata', () => {
                // Arrange
                @Model('stuffs')
                class MyClass {
                }

                // Act
                const metadata = manager().metadataFor(MyClass);

                // Assert
                expect(metadata.collection).to.equal('stuffs');
            });
        });

        describe('when no collection name passed', () => {
            it('should use class name', () => {
                // Arrange
                @Model()
                class MyClass {
                }

                // Act
                const metadata = manager().metadataFor(MyClass);

                // Assert
                expect(metadata.collection).to.equal('MyClass');
            });
        });
    });

    describe('@FromDocument', () => {
        describe('when applied to a static function', () => {
            it('should set static function as document to model transform', () => {
                // Arrange
                @Model()
                class MyClass {
                    state: string;

                    @FromDocument()
                    static create(doc) {
                        const result = new MyClass();
                        result.state = doc.state;
                        return result;
                    }
                }

                // Act
                const metadata = manager().metadataFor(MyClass);
                const instance = metadata.fromDocument({ state: 'Created from create!' });

                // Assert
                expect(instance.state).to.equal('Created from create!');
            });
        });

        describe('when applied to an instance function', () => {
            it('should throw', () => {
                // Arrange
                let creator = () => {
                    @Model()
                    class MyClass {
                        state: string;

                        @FromDocument()
                        create() {
                            this.state = 'Created from create!';
                            return this;
                        }
                    }
                };

                // Act / Assert
                expect(creator).to.throw('@FromDocument() can only be used on static functions');
            });
        });

    });

    describe('@ToDocument', () => {
        describe('when applied to an instance function', () => {
            it('should set instance function as model to document transform', () => {
                // Arrange
                @Model()
                class Point {
                    private x: number;
                    private y: number;

                    constructor(x: number, y: number) {
                        this.x = x;
                        this.y = y;
                    }

                    @ToDocument()
                    getData() {
                        return {
                            id: 'Foo',
                            x: this.x,
                            y: this.y
                        }
                    }
                }

                // Act
                const metadata = manager().metadataFor(Point);
                const instance = new Point(42, 100);
                const document = metadata.toDocument(instance);

                // Assert
                expect(document.id).to.equal('Foo');
                expect(document.x).to.equal(42);
                expect(document.y).to.equal(100);
            });
        });
    });
});