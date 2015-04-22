/// <reference path="../../../typings/libs.d.ts" />

import mongodb = require('mongodb');

interface IProjectDocument {
    _id: string;
    name: string;
    description: string;
    costPerDeveloperHour: number;
}

export = IProjectDocument;