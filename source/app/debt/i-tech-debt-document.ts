/// <reference path="../../../typings/libs.d.ts" />

import mongodb = require('mongodb');
import ITechnicalImpedimentDocument = require('./i-tech-impediment-document');
import ObjectId = mongodb.ObjectID;

interface ITechDebtDocument {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    productCode: string;
    reportedBy: ObjectId;
    name: string;
    description: string;
    impediments: ITechnicalImpedimentDocument[];
    associatedJiras: string[];
}

export = ITechDebtDocument;