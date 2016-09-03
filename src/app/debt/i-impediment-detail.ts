/// <reference path="../../../typings/libs.d.ts" />

import moment = require('moment');
import Duration = moment.Duration;
import Moment = moment.Moment;

interface IImpedimentDetail {
    reportedById: string;
    reporter: any;
    jira: string;
    amount: string;
    reason: string;
    createdAt: string;
}

export = IImpedimentDetail;