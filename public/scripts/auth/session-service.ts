/// <reference path="../libs.d.ts" />
/// <reference path="../common/global-vars-service.ts" />
/// <reference path="../common/event-bus.ts" />
/// <reference path="../services/project-service.ts" />
/// <reference path="auth-service.ts" />

module tetra.auth {
    import GlobalVarsService = tetra.common.GlobalVarsService;
    import IProjectSummaryData = tetra.services.IProjectSummaryData;
    import ProjectService = tetra.services.ProjectService;
    import EventBus = tetra.common.EventBus;

    export interface ILoggedInUserData {
        id: string;
        firstName: string;
        lastName: string;
        projects: string[];
        roles: string[];
    }

    export class LoggedInUser  {
        id: string;
        firstName: string;
        lastName: string;
        projects: string[];
        roles: string[];

        constructor(data: ILoggedInUserData) {
            this.id = data.id;
            this.firstName = data.firstName;
            this.lastName = data.lastName;
            this.projects = data.projects || [];
            this.roles = data.roles || [];
        }

        get isMultiProject(): boolean {
            return this.projects.length > 1;
        }
    }

    export class SessionService {
        private $q: ng.IQService;
        private user: LoggedInUser;
        private authService: AuthService;
        private currentProject: IProjectSummaryData;
        private projectService: ProjectService;
        private eventBus: EventBus;

        constructor($q: ng.IQService, globalVars: GlobalVarsService, authService: AuthService, projectService: ProjectService, eventBus: EventBus) {
            this.$q = $q;
            this.authService = authService;
            this.projectService = projectService;
            this.eventBus = eventBus;

            var user = globalVars.user;
            this.user = !!user ? new LoggedInUser(user) : null;
        }

        get currentUser(): LoggedInUser{
            return this.user;
        }

        get isLoggedIn(): boolean {
            return !!this.user;
        }

        get selectedProject(): IProjectSummaryData {
            return this.currentProject;
        }

        get selectedProjectCode(): string {
            if(this.selectedProject) {
                return this.selectedProject.code.toLowerCase();
            }

            if (this.currentUser) {
                var result = Enumerable.from(this.currentUser.projects).firstOrDefault();
                return result ? result.toLowerCase() : null;
            }

            return null;
        }

        loginUser(username: string, password: string): ng.IPromise<LoggedInUser> {
            var dfd = this.$q.defer<any>();

            if (!username || !password) {
                dfd.reject('Please enter a username and password.');
                return dfd.promise;
            }

            this.authService
                .login(username, password)
                .success((loggedInUser: ILoggedInUserData) => {
                    this.user = new LoggedInUser(loggedInUser);

                    var project = Enumerable.from(this.user.projects).first();
                    return this.setCurrentProject(project)
                        .then(() => dfd.resolve(this.user));
                })
                .error(err => {
                    this.user = null;
                    this.currentProject = null;
                    var message = err.message || 'An error occurred';
                    dfd.reject(message);
                });

            return dfd.promise;
        }

        logoutUser(): ng.IPromise<any> {
            var dfd = this.$q.defer<any>();
            if (!this.user) {
                dfd.reject('Not logged in!');
                return dfd.promise;
            }

            this.user = null;
            this.authService
                .logout()
                .success(() => {
                    this.user = null;
                    this.currentProject = null;
                    dfd.resolve();
                })
                .error(dfd.reject);

            return dfd.promise;
        }

        setCurrentProject(projectCode: string): ng.IPromise<IProjectSummaryData> {
            var dfd = this.$q.defer<IProjectSummaryData>();
            this.projectService.getProjectByCode(projectCode)
                .success(result => {
                    this.currentProject = result;
                    this.eventBus.fire('project-changed', this.currentProject);
                    dfd.resolve(this.currentProject);
                })
                .error(dfd.reject);

            return dfd.promise;
        }
    }

    angular.module('app').service('sessionService', SessionService);
}