declare module iis {

    interface IISOptions {
        drive?: string;
    }

    interface CreateSiteOptions {
        name: string;
        path: string;
        protocol: string;
        port: number;
        host: string;
    }

    interface CreateAppPoolOptions {
        name: string;
        identity: string;
    }

    interface CreateAppFolderOptions {
        site?: string;
        virtual_path: string;
        physical_path: string;
    }

    interface IISStatic {
        setDefaults(opts: IISOptions): void;

        createSite(opts: CreateSiteOptions, callback: (err: Error, stdout: string) => void): void;
        startSite(name: string, callback: (err: Error, stdout: string) => void): void;
        stopSite(name: string, callback: (err: Error, stdout: string) => void): void;
        deleteSite(name: string, callback: (err: Error, stdout: string) => void): void;

        createAppPool(name: string, callback: (err: Error, stdout: string) => void): void;
        createAppPool(opts: CreateAppPoolOptions, callback: (err: Error, stdout: string) => void): void;
        recycleAppPool(name: string, callback: (err: Error, stdout: string) => void): void;
        deleteAppPool(name: string, callback: (err: Error, stdout: string) => void): void;
        stopAppPool(name: string, callback: (err: Error, stdout: string) => void): void;
        mapAppPool(appName: string, poolName: string, callback: (err: Error, stdout: string) => void): void;
        setAppPoolIdentity(poolName: string, identity: string, callback: (err: Error, stdout: string) => void): void;

        createAppFolder(opts: CreateAppFolderOptions, callback: (err: Error, stdout: string) => void): void;

        unlockSection(section: string, callback: (err: Error, stdout: string) => void): void;

        setWindowsAuthentication(appPath: string, isEnabled: boolean, callback: (err: Error, stdout: string) => void): void;
        setAnonymousAuthentication(appPath: string, isEnabled: boolean, callback: (err: Error, stdout: string) => void): void;

        exists(type: string, name: string, callback: (err: Error, exists: boolean) => void): void;
        list(type: string, callback: (err: Error, stdout: string) => void): void;
        setFilePermissions(path: string, account: string, callback: (err: Error, stdout: string) => void): void;
        setPhysicalPath(siteName: string, path: string, callback: (err: Error, stdout: string) => void): void;
        getPhysicalPath(siteName: string, callback: (err: Error, stdout: string) => void): void;
    }
}

declare module "iis" {
    var IIS: iis.IISStatic;
    export = IIS;
}
