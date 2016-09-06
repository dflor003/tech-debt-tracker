interface IProjection<TModel, TProjection> {
    include?: string[];
    exclude?: string[];
    select: (model: any) => TProjection;
}

class FindBuilder<TModel> {
    private options: CollectionFindOptions;
    private callback: (opts: CollectionFindOptions, hasProjection: boolean) => Promise<TModel[]>;
    private projection: (model: any) => any;

    constructor(callback: (opts: CollectionFindOptions, hasProjection: boolean) => Promise<TModel[]>) {
        this.callback = callback;
        this.options = {};
    }

    select<TProjection>(project: IProjection<TModel, TProjection>): FindBuilder<TProjection> {
        this.addProjection(project.include || [], true);
        this.addProjection(project.exclude || [], false);

        var result = new FindBuilder<TProjection>(<any>this.callback);
        result.options = this.options;
        result.projection = project.select;

        return result;
    }

    skip(count: number): FindBuilder<TModel> {
        this.options.skip = count;
        return this;
    }

    take(count: number): FindBuilder<TModel> {
        this.options.limit = count;
        return this;
    }

    orderBy(fieldName: string): FindBuilder<TModel> {
        return this.addOrderBy(fieldName, true);
    }

    orderByDescending(fieldName: string): FindBuilder<TModel> {
        return this.addOrderBy(fieldName, false);
    }

    execute(): Promise<TModel[]> {
        if (!this.projection) {
            return this.callback(this.options, false);
        }

        var dfd = Q.defer<TModel[]>();
        this.callback(this.options, true)
            .then((results: any[]) => {
                var transformed = results.map(result => this.projection(result));
                dfd.resolve(transformed);
            })
            .fail(dfd.reject);

        return dfd.promise;
    }

    private addProjection(fields: string[], include: boolean): FindBuilder<TModel> {
        var projection = this.options.fields || (this.options.fields = {});
        fields.forEach(field => projection[field] = include);
        return this;
    }

    private addOrderBy(field: string, ascending: boolean): FindBuilder<TModel> {
        var sort = this.options.sort || (this.options.sort = []);
        sort.push([
            field,
            ascending ? 'asc' : 'desc'
        ]);

        return this;
    }
}