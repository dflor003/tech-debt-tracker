/// <reference path="../express/express.d.ts" />

declare module "serve-favicon" {
    import express = require('express');

    function favicon(path: string): express.Handler;

    export = favicon;
}