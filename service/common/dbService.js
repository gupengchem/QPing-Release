/**
 * Created by wangshuyi on 2017/1/13.
 */

'use strict';
const extend = require('extend');
const logger = require('log4js').getLogger("sys");
const config = require("../../config/config");

const defaultParams = {
    model: null
};

class CommonService {
    constructor(param) {
        this.opts = extend(true, {}, this.opts, defaultParams, param);
        this._name = "CommonService";
    }

    /**
     * 查询
     * @param condition
     * @param populate
     * @param sort
     * @param fields
     * @returns {Promise}
     */
    find(curUser = null, condition = {}, populate = "", sort = {updateTime: -1}, fields = null) {
        let thisService = this, promise;
        condition = extend({}, condition, {state:1});

        promise = new Promise(function (resolve, reject) {
            let exec = thisService.opts.model
                .find(condition);

            if(populate instanceof Array){
                populate.forEach(p => {
                    exec.populate(p);
                })
            }else{
                exec.populate(populate);
            }

            if(fields){
                exec.select(fields);
            }

            exec.sort(sort)
                .exec(function (err, result) {
                    if (err) {
                        logger.error(thisService._name, "find fail", err);
                        reject(err);
                    } else {
                        logger.info(thisService._name, "find success", condition);
                        resolve(result);
                    }
                })
        });

        return promise;
    }

    /**
     * 分页查询
     * @param pageSize
     * @param pageNumber
     * @param condition
     * @param populate
     * @param sort
     * @param fields
     * @returns {Promise}
     */
    findForPage(curUser = null, pageSize = 10, pageNumber = 0, condition = {}, populate = "", sort = {updateTime: -1}, fields = null) {
        const thisService = this;
        let skip, size, promise;

        skip = pageSize * pageNumber;
        size = Number(pageSize);
        condition = extend({}, condition, {state:1});

        promise = new Promise(function (resolve, reject) {
            thisService.opts.model.count(condition).exec(function (err, count) {
                if (err) {
                    logger.error(thisService._name, "findByPage count fail", err);
                    reject(err);
                } else {
                    let exec = thisService.opts.model
                        .find(condition)
                        .skip(skip)
                        .limit(size);

                    if(populate instanceof Array){
                        populate.forEach(p => {
                            exec.populate(p);
                        })
                    }else{
                        exec.populate(populate);
                    }

                    if(fields){
                        exec.select(fields);
                    }

                    exec.sort(sort)
                        .exec(function (err, data) {
                            if (err) {
                                logger.error(thisService._name, "findByPage find fail", err);
                                reject(err);
                            } else {
                                logger.info(thisService._name, "findByPage find success", condition);
                                resolve({total: count, rows: data});
                            }
                        })
                }
            });
        });
        return promise;
    }

    /**
     * 根据id查询
     * @param id
     * @param populate
     * @param fields
     * @returns {Promise}
     */
    findById(curUser = null, id = "", populate = "", fields = null) {
        let thisService = this, promise;

        promise = new Promise(function (resolve, reject) {
            let exec = thisService.opts.model.findById(id);

            if(populate instanceof Array){
                populate.forEach(p => {
                    exec.populate(p);
                })
            }else{
                exec.populate(populate);
            }

            if(fields){
                exec.select(fields);
            }

            exec.exec(function (err, result) {
                if (err) {
                    logger.error(thisService._name, "findById fail", err);
                    reject(err);
                } else {
                    logger.info(thisService._name, "findById success", id);
                    resolve(result);
                }
            })
        });

        return promise;
    }

    /**
     * 根据条件查询一条
     * @param condition
     * @param populate
     * @param fields
     * @returns {Promise}
     */
    findOne(curUser = null, condition = {}, populate = "", fields = null) {
        let thisService = this, promise;

        promise = new Promise(function (resolve, reject) {
            let exec = thisService.opts.model.findOne(condition);

            if(populate instanceof Array){
                populate.forEach(p => {
                    exec.populate(p);
                })
            }else{
                exec.populate(populate);
            }

            if(fields){
                exec.select(fields);
            }

            exec.exec(function (err, result) {
                if (err) {
                    logger.error(thisService._name, "findOne fail", err);
                    reject(err);
                } else {
                    logger.info(thisService._name, "findOne success", condition);
                    resolve(result);
                }
            })
        });

        return promise;
    }

    /**
     * 新建
     * @param data
     * @returns {Promise}
     */
    save(curUser = null, data = {}) {
        const thisService = this;
        let model, promise;
        if(curUser){
            data.creater = curUser._id;
            data.updater = curUser._id;
        }

        model = new thisService.opts.model(data);

        promise = new Promise(function (resolve, reject) {
            model.save(function (err, result) {
                if (err) {
                    logger.error(thisService._name, "create fail", err);
                    reject(err);
                }
                else {
                    logger.info(thisService._name, "create success", result);
                    resolve(result)
                }
            });
        });

        return promise;
    }

    /**
     * 批量新建
     * @param data
     * @returns {Promise}
     */
    create(curUser = null, data = []) {
        const thisService = this;
        let model, promise;
        promise = new Promise(function (resolve, reject) {
            thisService.opts.model.create(data, function (err, result) {
                if (err) {
                    logger.error(thisService._name, "create fail", err);
                    reject(err);
                }
                else {
                    logger.info(thisService._name, "create success", result);
                    resolve(result)
                }
            });
        });

        return promise;
    }

    /**
     * 删除
     * @param condition
     * @returns {Promise}
     */
    remove(curUser = null, condition = {}) {
        const thisService = this;
        let promise;
        promise = new Promise(function (resolve, reject) {
            thisService.opts.model.remove(condition, function (err, result) {
                if (err) {
                    logger.error(thisService._name, "remove fail", err);
                    reject(err);
                }
                else {
                    logger.info(thisService._name, "remove success", result);
                    resolve(result)
                }
            });
        });

        return promise;
    }

    /**
     * 根据id删除
     * @param id
     * @returns {Promise}
     */
    removeById(curUser = null, id = "") {
        const thisService = this;
        let promise;
        promise = new Promise(function (resolve, reject) {
            thisService.opts.model.findByIdAndRemove(id, function (err, result) {
                if (err) {
                    logger.error(thisService._name, "removeById fail", err);
                    reject(err);
                }
                else {
                    logger.info(thisService._name, "removeById success", result);
                    resolve(result)
                }
            });
        });

        return promise;
    }

    /**
     * 修改
     * @param condition
     * @param data
     * @returns {Promise}
     */
    update(curUser = null, condition = {}, data = {}) {
        const thisService = this;
        let promise;

        if(curUser){
            data.updater = curUser._id || config.dbUser.robot._id;
        }
        data.updateTime = new Date();

        promise = new Promise(function (resolve, reject) {
            thisService.opts.model.update(condition, data, function (err, result) {
                if (err) {
                    logger.error(thisService._name, "update fail", err);
                    reject(err);
                }
                else {
                    logger.info(thisService._name, "update success", result);
                    resolve(result)
                }

            });
        });

        return promise;
    }

    /**
     * 根据id修改
     * @param id
     * @param data
     * @returns {Promise}
     */
    updateById(curUser = null, id = "", data = {}) {
        const thisService = this;
        let promise;

        if(curUser){
            data.updater = curUser._id || config.dbUser.robot._id;
        }
        data.updateTime = new Date();

        promise = new Promise(function (resolve, reject) {
            thisService.opts.model.findByIdAndUpdate(id, data, function (err, result) {
                if (err) {
                    logger.error(thisService._name, "updateById fail", err);
                    reject(err);
                }
                else {
                    logger.info(thisService._name, "updateById success", result);
                    resolve(result)
                }
            });
        });

        return promise;
    }

    /**
     * 计数
     * @param condition
     * @returns {Promise}
     */
    count(curUser = null, condition = {}) {
        let thisService = this, promise;
        condition = extend({}, condition, {state:1});

        promise = new Promise(function (resolve, reject) {
            thisService.opts.model.count(condition).exec(function (err, result) {
                if (err) {
                    logger.error(thisService._name, "count fail", err);
                    reject(err);
                } else {
                    logger.info(thisService._name, "count success", condition);
                    resolve(result);
                }
            })
        });

        return promise;
    }
}

module.exports = CommonService;