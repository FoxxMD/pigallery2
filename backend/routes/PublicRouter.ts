///<reference path="../../typings/main.d.ts"/>


import * as _express from 'express';
import * as _path from 'path';


import {Utils} from "../../common/Utils";

import {NextFunction, Request, Response} from "express";

export class PublicRouter{
    constructor(private app){
        this.app.use((req:Request, res:Response, next:NextFunction) => {
            res.tpl = {};

            res.tpl.user = null;
            if(req.session.user) {
                let user = Utils.clone(req.session.user);
                delete user.password;
                res.tpl.user = user;
            }

            return next();
        });
        
        this.app.use(_express.static(_path.resolve(__dirname, './../../frontend')));
        this.app.use('/node_modules',_express.static(_path.resolve(__dirname, './../../node_modules')));

        var renderIndex = (req: Request, res: Response) => {
            res.render(_path.resolve(__dirname, './../../frontend/index.ejs'),res.tpl);
        };
        
        this.app.get(['/','/login',"/gallery*"], renderIndex);


    }
    
}