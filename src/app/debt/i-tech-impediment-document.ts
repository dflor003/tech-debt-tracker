/// <reference path="../../../typings/libs.d.ts" />

import mongodb = require('mongodb');
import ObjectId = mongodb.ObjectID;

interface ITechnicalImpedimentDocument {
    amount: string;
    jira: string;
    reason: string;
    reportedBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export = ITechnicalImpedimentDocument;