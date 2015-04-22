/// <reference path="../../../typings/libs.d.ts" />

import moment = require('moment');
import Duration = moment.Duration;

class SlowdownAmount {
    private static workDayHours = 8;

    static small(): Duration {
        return moment.duration(SlowdownAmount.workDayHours / 2, 'hours');
    }

    static medium(): Duration {
        return moment.duration(SlowdownAmount.workDayHours, 'hours');
    }

    static large(): Duration {
        return moment.duration(SlowdownAmount.workDayHours * 2, 'hours');
    }

    static extraLarge(): Duration {
        return moment.duration(SlowdownAmount.workDayHours * 5, 'hours');
    }
}

export = SlowdownAmount;