/// <reference path="../../../typings/libs.d.ts" />

import Q = require('q');
import Repository = require('../../common/persistence/repository');
import TechDebtItem = require('./tech-debt-item');
import Promise = Q.Promise;

class TechDebtRepository extends Repository<TechDebtItem> {
    constructor() {
        super(TechDebtItem);
    }
}

export = TechDebtRepository;