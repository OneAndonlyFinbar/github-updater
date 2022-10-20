"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepoWatcher = void 0;
var express = require("express");
var shell = require("shelljs");
var crypto = require("crypto");
var RepoWatcher = /** @class */ (function () {
    function RepoWatcher(options) {
        this.express = express();
        this.webhookSecret = options.webhookSecret;
        this.branch = options.branch;
        this.port = options.port;
        this.directory = options.directory;
        this.pullScript = options.pullScript || "git pull origin ".concat(this.branch);
        this.express.use(express.json());
        this._initializeRoutes();
        this._start();
    }
    RepoWatcher.prototype._initializeRoutes = function () {
        var _this = this;
        this.express.post('/', function (req, res) {
            var signature = req.headers['x-hub-signature-256'];
            var hmac = crypto.createHmac('sha256', _this.webhookSecret);
            var digest = Buffer.from('sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
            var checksum = Buffer.from(signature, 'utf8');
            if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum))
                return res.status(400).send('Bad Request');
            if (req.body.ref !== "refs/heads/".concat(_this.branch))
                return res.status(200).send('OK');
            _this.pull();
            res.status(200).send('OK');
        });
    };
    RepoWatcher.prototype._start = function () {
        var _this = this;
        this.express.listen(this.port, function () {
            console.log("Watching for changes in ".concat(_this.branch, "."));
        });
    };
    RepoWatcher.prototype.pull = function () {
        shell.cd(this.directory);
        shell.exec(this.pullScript);
    };
    return RepoWatcher;
}());
exports.RepoWatcher = RepoWatcher;
