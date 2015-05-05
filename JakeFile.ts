/// <reference path="typings/jake/jake.d.ts" />
/// <reference path="typings/q/q.d.ts" />

import Q = require('q');
import Promise = Q.Promise;
import seed = require('./source/seed-data/seed');
import iis = require('iis');
import path = require('path');

/* Tasks */
desc('Default task');
task('default', ['compile']);

desc('Compiles All TypeScript Files');
task('compile', ['compile-server', 'compile-client']);

desc('Compiles Server-side NodeJS TypeScript files');
task('compile-server', [], () => {
    var files = [
        './source/**/*.ts',
        './server.ts'
    ];

    console.log('Compiling server-side TypeScript files...');
    compileTypeScript({
        files: files,
        moduleType: TsModuleType.CommonJS
    })
        .then(() => console.log('Done compiling server-side TypeScript files!'))
        .catch(() => console.error('Failed to compile server-side TypeScript files!'))
        .finally(() => complete());

}, {async: true});

desc('Compiles Client-side NodeJS TypeScript files');
task('compile-client', [], () => {
    var files = [
        './public/scripts/**/*.ts'
    ];

    console.log('Compiling client-side TypeScript files...');
    compileTypeScript({
        files: files,
        moduleType: TsModuleType.None
    })
        .then(() => console.log('Done compiling client-side TypeScript files!'))
        .catch(() => console.error('Failed to compile client-side TypeScript files!'))
        .finally(() => complete());

}, {async: true});

desc('Seeds test data');
task('seed', [], () => {
    seed()
        .then(() => console.log('Seeding complete!'))
        .catch(err => console.error(`Error occurred seeding: ${err}\n${err.stack}`))
        .finally(() => complete());

}, {async: true});

namespace('mongo', () => {
    desc('Starts up local MongoDB instance');
    task('start', [], () => {
        run('net', 'start', 'MongoDB')
            .then(() => console.log('MongoDB service started'))
            .catch((error) => console.error(`Error starting MongoDB service! - ${error}`))
            .finally(() => complete());
    }, {async: true});

    desc('Stops local MongoDB instance');
    task('stop', [], () => {
        run('net', 'stop', 'MongoDB')
            .then(() => console.log('MongoDB service stopped'))
            .catch((error) => console.error(`Error stopping MongoDB service! - ${error}`))
            .finally(() => complete());
    }, {async: true});
});

namespace('iis', () => {
    desc('Installs app into local IIS');
    task('install', () => {
        var defaultWebsite = 'Default Web Site',
            appName = 'TeTra',
            fullPath = path.resolve(__dirname);

        createIisEntry(defaultWebsite, appName, fullPath)
            .then(() => console.log(`Created IIS app '${appName}' successfully!`))
            .catch((error) => console.error(`Error creating IIS app - ${error}`))
            .finally(() => complete());

    }, { async: true });
});

/* Helpers */
enum TsModuleType {
    None = 0,
    CommonJS = 1,
    Amd = 2
}

interface ITypeScriptCompileOptions {
    files: string[];
    moduleType?: TsModuleType;
    generateSourceMaps?: boolean;
}

function compileTypeScript(args: ITypeScriptCompileOptions): Promise<string[]> {
    // Error checks
    if (!args) {
        throw new Error('No args passed');
    }

    var commandParts = ['--target ES5'];
    if (args.moduleType) {
        commandParts.push(`--module ${TsModuleType[args.moduleType].toLowerCase()}`);
    }

    if (args.generateSourceMaps === true) {
        commandParts.push('--sourceMap');
    }

    // Resolve file list
    var fileList = new jake.FileList();
    fileList.include(args.files);

    // Create actual command
    var deferred = Q.defer<string[]>(),
        files = fileList.toArray(),
        command = commandParts.concat(files).join(' '),
        exec = jake.createExec([command]),
        appDataPath = process.env['APPDATA'],
        tsc = appDataPath + '\\npm\\tsc';

    return run(tsc, commandParts.concat(files));
}

function run(cmd: string, args: string[]): Promise<any>;
function run(cmd: string, ...args: string[]): Promise<any>;
function run(cmd: string, args: any): Promise<any> {
    args = arguments.length === 2 && arguments[1] instanceof Array ? arguments[1] : Array.prototype.slice.call(arguments, 1);
    var command = [cmd].concat(args).join(' '),
        exec = jake.createExec([command]),
        deferred = Q.defer<any>();

    exec
        .addListener('stdout', output => process.stdout.write(output))
        .addListener('stderr', output => process.stderr.write(output))
        .addListener('cmdEnd', () => deferred.resolve(undefined))
        .addListener('error', error => deferred.reject(error));

    exec.run();
    return deferred.promise;
}

function createIisEntry(site: string, appName: string, physicalPath: string): Promise<string> {
    var dfd = Q.defer<string>(),
        appPath = `${site}/${appName}`;

    iis.exists('site', site, (err, exists) => {
        if (err) return dfd.reject(err);
        if (!exists) return dfd.reject(`Site ${site} does not exist`);

        iis.exists('app', appPath, (err, exists) => {
            if (err) return dfd.reject(err);
            if (exists) return dfd.reject(`Application ${appPath} already exists`);

            iis.createAppFolder({
                site:site,
                virtual_path:appName,
                physical_path: physicalPath
            }, (err, out) => {
                if (err) return dfd.reject(err);
                else dfd.resolve(out);
            });
        });
    });

    return dfd.promise;
}