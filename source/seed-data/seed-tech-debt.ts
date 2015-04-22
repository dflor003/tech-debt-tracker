import Q = require('q');
import Enumerable = require('linq');
import moment = require('moment');
import Repository = require('../common/persistence/repository');
import JiraNumber = require('../app/debt/jira-number');
import TechDebtItem = require('../app/debt/tech-debt-item');
import TechnicalImpediment = require('../app/debt/tech-impediment');
import SlowdownAmount = require('../app/debt/slowdown-amount');
import User = require('../app/auth/user');
import Promise = Q.Promise;

function seed(): Promise<any> {
    var dfd = Q.defer<any>(),
        userRepository = new Repository<User>(User),
        debtRepository = new Repository<TechDebtItem>(TechDebtItem);

    userRepository.findAll({})
        .execute()
        .then((users: User[]) => {
            var usersByUsername = Enumerable.from(users).toObject(user => user.getUsername(), user => user.getId()),
                user1Id = usersByUsername['DanilF'],
                user2Id = usersByUsername['BobB'],
                user3Id = usersByUsername['JoeS'],
                item1 = TechDebtItem.create({
                    projectCode: 'omg',
                    name: 'Our ids are ints and not GUIDs',
                    description: 'Right now our ids are ints instead of guids. This is causing issues since it becomes a nightmare to maintain and we have to jump through all these hoops to get ids sequential.',
                    createdAt: moment('11-03-2014', 'MM-DD-YYYY'),
                    impediment: TechnicalImpediment.create({
                        reportedBy: user1Id,
                        jira: new JiraNumber('ULTI-159173'),
                        amount: SlowdownAmount.medium(),
                        reason: 'Had to convert back and forth between different ID formats when going to/from the UI. Spent half a day at least fixing tests around this as well.'
                    })
                }),
                item2 = TechDebtItem.create({
                    projectCode: 'omg',
                    name: 'Sporadically failing tests',
                    description: 'These two or three tests keep failing in the build and/or locally during rake.',
                    createdAt: moment('12-14-2014', 'MM-DD-YYYY'),
                    impediment: TechnicalImpediment.create({
                        reportedBy: user2Id,
                        jira: new JiraNumber('ULTI-160589'),
                        amount: SlowdownAmount.small(),
                        reason: 'Build failed on UI tests 3 times before it passed',
                        createdAt: moment('12-14-2014', 'MM-DD-YYYY')
                    })
                });

            item2.addImpediment(TechnicalImpediment.create({
                reportedBy: user1Id,
                jira: new JiraNumber('ULTI-159920'),
                amount: SlowdownAmount.medium(),
                reason: 'Rake failed locally a few times. Finally got that working and then it failed in the build! It was late in the day by the time it finally worked.',
                createdAt: moment('01-17-2015', 'MM-DD-YYYY')
            }));

            item2.addImpediment(TechnicalImpediment.create({
                reportedBy: user3Id,
                jira: new JiraNumber('ULTI-161265'),
                amount: SlowdownAmount.large(),
                reason: 'Build kept failing. No time for this right before beta!!!',
                createdAt: moment('02-15-2015', 'MM-DD-YYYY')
            }));

            var items = [item1, item2];
            debtRepository
                .createAll(items)
                .then(results => {
                    console.log(`Created ${items.length} tech debt items!`);
                    dfd.resolve(results);
                })
                .fail(dfd.reject);
        })
        .fail(dfd.reject);

    return dfd.promise;
}

export = seed;