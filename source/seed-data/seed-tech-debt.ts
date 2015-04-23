import Q = require('q');
import Enumerable = require('linq');
import moment = require('moment');
import Repository = require('../common/persistence/repository');
import UserRepository = require('../app/auth/user-repository');
import TechDebtRepository = require('../app/debt/tech-debt-repository');
import JiraNumber = require('../app/debt/jira-number');
import TechDebtItem = require('../app/debt/tech-debt-item');
import TechnicalImpediment = require('../app/debt/tech-impediment');
import SlowdownAmount = require('../app/debt/slowdown-amount');
import User = require('../app/auth/user');
import Promise = Q.Promise;

function seed(): Promise<any> {
    var dfd = Q.defer<any>(),
        userRepository = new UserRepository(),
        debtRepository = new TechDebtRepository();

    userRepository.findAll({})
        .execute()
        .then((users: User[]) => {
            var usersByUsername = Enumerable.from(users).toObject(user => user.getUsername(), user => user.getId()),
                user1Id = usersByUsername['DanilF'],
                user2Id = usersByUsername['BobB'],
                user3Id = usersByUsername['JoeS'],
                user4Id = usersByUsername['PaulS'],
                user5Id = usersByUsername['DanM'],
                items = [
                    /* Omg */
                    TechDebtItem.create({
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
                    })
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user1Id,
                        jira: new JiraNumber('ULTI-162991'),
                        amount: SlowdownAmount.small(),
                        reason: 'Spent my birthday trying to fix this damn thing!',
                        createdAt: moment('01-17-2015', 'MM-DD-YYYY')
                    })),

                    TechDebtItem.create({
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
                    })
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user1Id,
                        jira: new JiraNumber('ULTI-159920'),
                        amount: SlowdownAmount.medium(),
                        reason: 'Rake failed locally a few times. Finally got that working and then it failed in the build! It was late in the day by the time it finally worked.',
                        createdAt: moment('01-17-2015', 'MM-DD-YYYY')
                    }))
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user3Id,
                        jira: new JiraNumber('ULTI-161265'),
                        amount: SlowdownAmount.large(),
                        reason: 'Build kept failing. No time for this right before beta!!!',
                        createdAt: moment('02-15-2015', 'MM-DD-YYYY')
                    }))
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user2Id,
                        jira: new JiraNumber('ULTI-161226'),
                        amount: SlowdownAmount.medium(),
                        reason: 'Took all day to check something in.',
                        createdAt: moment('02-16-2015', 'MM-DD-YYYY')
                    })),

                    TechDebtItem.create({
                        projectCode: 'omg',
                        name: 'Datastore is not well defined',
                        description: 'When we switched over from in-memory to MongoDB the persistence store was not really ironed out. Because of this, we have this huge "god class" data store that has methods for evey single object we persist. This is causing a lot of trouble while testing, debugging, and refactoring.',
                        createdAt: moment('09-10-2014', 'MM-DD-YYYY'),
                        impediment: TechnicalImpediment.create({
                            reportedBy: user1Id,
                            jira: new JiraNumber('ULTI-154338'),
                            amount: SlowdownAmount.large(),
                            reason: 'Had to refactor some things around DataStore and there were a bunch of dependencies failed.',
                            createdAt: moment('09-10-2014', 'MM-DD-YYYY')
                        })
                    })
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user3Id,
                        jira: new JiraNumber('ULTI-161226'),
                        amount: SlowdownAmount.medium(),
                        reason: 'Spent all day debugging a test that broke after I added some functionality. Debugging was a nightmare.',
                        createdAt: moment('10-01-2014', 'MM-DD-YYYY')
                    }))
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user2Id,
                        jira: new JiraNumber('ULTI-162773'),
                        amount: SlowdownAmount.small(),
                        reason: 'Spent a few hours trying to refactor this in my spare time, but ended up having to revert it... It was a beast.',
                        createdAt: moment('10-31-2014', 'MM-DD-YYYY')
                    })),

                    TechDebtItem.create({
                        projectCode: 'omg',
                        name: 'Build scripts are very fragile and do not have proper logging',
                        description: 'Build scripts could use a look over by someone who knows best practices.',
                        createdAt: moment('11-13-2014', 'MM-DD-YYYY'),
                        impediment: TechnicalImpediment.create({
                            reportedBy: user3Id,
                            jira: new JiraNumber('ULTI-162224'),
                            amount: SlowdownAmount.extraLarge(),
                            reason: 'The backup and restore part of the build pipeline was broken all week due to some obscure errors. Upon examining the log, it provided no information. We had to sit with someone from uCloud and they were finally able to figure out that it was just the backup server file system being full! If we had better logging this would not have happened',
                            createdAt: moment('11-13-2014', 'MM-DD-YYYY')
                        })
                    })
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user1Id,
                        jira: new JiraNumber('ULTI-163173'),
                        amount: SlowdownAmount.small(),
                        reason: 'Upgrade steps keep failing sporadically with dubious error messages. Took a few hours to get a build today.',
                        createdAt: moment('11-24-2014', 'MM-DD-YYYY')
                    })),

                    TechDebtItem.create({
                        projectCode: 'omg',
                        name: 'Hierarchy tree view is causing performance issues',
                        description: 'The hierarchy is implemented different than every other part of our UI. It uses D3 in a giant render loop. This has a very high cyclomatic complexity and even worse... It gets re-run every since time any dependency changes on any property within the tree. We can\'t load up any large clients data.',
                        createdAt: moment('07-08-2014', 'MM-DD-YYYY'),
                        impediment: TechnicalImpediment.create({
                            reportedBy: user1Id,
                            jira: new JiraNumber('ULTI-154331'),
                            amount: SlowdownAmount.small(),
                            reason: 'Tried to do a demo of loading Aetna\'s data and it would not work.',
                            createdAt: moment('07-08-2014', 'MM-DD-YYYY')
                        })
                    })
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user1Id,
                        jira: new JiraNumber('ULTI-161122'),
                        amount: SlowdownAmount.large(),
                        reason: 'Spent all week trying to improve performance on the canvas server side... After I finally found the issue, it turns out it is purely client side.',
                        createdAt: moment('10-31-2014', 'MM-DD-YYYY')
                    }))
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user2Id,
                        jira: new JiraNumber('ULTI-166112'),
                        amount: SlowdownAmount.small(),
                        reason: 'Canvas is loading slower and slower. Time it takes to run UI tests is growing due to canvas performance',
                        createdAt: moment('03-14-2015', 'MM-DD-YYYY')
                    })),

                    /* Healthy Project */
                    TechDebtItem.create({
                        projectCode: 'hel',
                        name: 'Some minor nuisance in the code base, not a big deal.',
                        description: 'The flow of development is not ideal',
                        createdAt: moment('01-01-2015', 'MM-DD-YYYY'),
                        impediment: TechnicalImpediment.create({
                            reportedBy: user4Id,
                            jira: new JiraNumber('ULTI-161023'),
                            amount: SlowdownAmount.small(),
                            reason: 'This one thing was bothering me...',
                            createdAt: moment('01-01-2015', 'MM-DD-YYYY')
                        })
                    })
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user4Id,
                        jira: new JiraNumber('ULTI-162233'),
                        amount: SlowdownAmount.large(),
                        reason: 'It bothered me again',
                        createdAt: moment('01-10-2015', 'MM-DD-YYYY')
                    })),

                    /* Overbudget project */
                    TechDebtItem.create({
                        projectCode: 'ovr',
                        name: 'This thing is bad!',
                        description: 'Our state-of-the-art leaderships enforce our established simplicity. One-to-one ecosystems expediently transfer the stakeholders.',
                        createdAt: moment('12-12-2014', 'MM-DD-YYYY'),
                        impediment: TechnicalImpediment.create({
                            reportedBy: user5Id,
                            jira: new JiraNumber('ULTI-156111'),
                            amount: SlowdownAmount.extraLarge(),
                            reason: 'Our multi-source transformation processes enforce replacement, non-mainstream and forward-looking performance cultures up-front. Our benchmarks generate our time-phases. An operational and collateral blended approach aggregates a low-risk high-yield and/or low-risk high-yield message.',
                            createdAt: moment('12-12-2014', 'MM-DD-YYYY')
                        })
                    })
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user5Id,
                        jira: new JiraNumber('ULTI-161123'),
                        amount: SlowdownAmount.extraLarge(),
                        reason: 'The business leaders innovate an accessible benchmarking.',
                        createdAt: moment('01-10-2015', 'MM-DD-YYYY')
                    }))
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user5Id,
                        jira: new JiraNumber('ULTI-171223'),
                        amount: SlowdownAmount.extraLarge(),
                        reason: 'Our time-phased contents enable the human resources. The established knowledge transfers prioritize an adaptive on-boarding process across the silos; this is why the resources transition an awesome measure.',
                        createdAt: moment('01-11-2015', 'MM-DD-YYYY')
                    })),

                    TechDebtItem.create({
                        projectCode: 'ovr',
                        name: 'Our gut-feeling is that a parallel risk appetite strengthens the clients.',
                        description: 'The stakeholders establish a value-added integration. Our cultural business lines significantly drive the partners reaped from our sustainable yield enhancement; this is why relevant gamifications drive the Senior Chief of Business Planning.',
                        createdAt: moment('12-12-2014', 'MM-DD-YYYY'),
                        impediment: TechnicalImpediment.create({
                            reportedBy: user5Id,
                            jira: new JiraNumber('ULTI-115663'),
                            amount: SlowdownAmount.medium(),
                            reason: 'The unified and present-day best practices generate leading-edge and intelligent branding strategies by expanding boundaries. Our framework seamlessly influences the Chief Visionary Officer because our scaling produces organic improvement. Our gut-feeling is that the group maximizes an outsourced collaboration. A measurable vision drives tolerably expensive, tactical, Balanced Scorecards as a consequence of robust expansion.',
                            createdAt: moment('12-05-2014', 'MM-DD-YYYY')
                        })
                    })
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user5Id,
                        jira: new JiraNumber('ULTI-181282'),
                        amount: SlowdownAmount.large(),
                        reason: 'The resource integrates adequate, in-depth, win-win solutions. The senior support staff adequately improves a sales target by nurturing talent. A cross-industry, structural, granularity strengthens our technologies. The prospective innovations leverage goal-oriented say/do ratios up-front. Our verifiable and sustainable specification quality impacts a planning; this is why an idiosyncrasy adds value. The clients take a bite out of an enhanced on-boarding process 50/50, while the resources conservatively right-size our unprecedented growth.',
                        createdAt: moment('01-12-2015', 'MM-DD-YYYY')
                    }))
                    .addImpediment(TechnicalImpediment.create({
                        reportedBy: user5Id,
                        jira: new JiraNumber('ULTI-128292'),
                        amount: SlowdownAmount.extraLarge(),
                        reason: 'The project manager keeps it on the radar... or it gets the hose again.',
                        createdAt: moment('02-15-2015', 'MM-DD-YYYY')
                    })),
                ];

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