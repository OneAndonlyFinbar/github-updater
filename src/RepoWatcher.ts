import * as express from 'express';
import * as shell from 'shelljs';
import * as crypto from 'crypto';
import type { Application, Request, Response } from 'express';
interface IConstructorOptions{
  webhookSecret: string;
  branch: string;
  directory: string;
  port: number;
  pullScript?: string;
}

export class RepoWatcher {
  public readonly webhookSecret;
  public readonly branch;
  public readonly port;
  public readonly directory;
  public readonly express: Application = express();
  public pullScript;
  constructor(options: IConstructorOptions) {
    this.webhookSecret = options.webhookSecret;
    this.branch = options.branch;
    this.port = options.port;
    this.directory = options.directory;
    this.pullScript = options.pullScript || `git pull origin ${this.branch}`;
    this.express.use(express.json());
    this._initializeRoutes();
    this._start();
  }
  private _initializeRoutes(){
    this.express.post('/', (req: Request, res: Response) => {
      const signature = req.headers['x-hub-signature-256'];
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      const digest = Buffer.from('sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
      const checksum = Buffer.from(signature as string, 'utf8');
      if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) return res.status(400).send('Bad Request');
      if (req.body.ref !== `refs/heads/${this.branch}`) return res.status(200).send('OK');
      this.pull();
      res.status(200).send('OK');
    });
  }
  private _start(){
    this.express.listen(this.port, () => {
      console.log(`Watching for changes in ${this.branch}.`);
    });
  }
  public pull(){
    shell.cd(this.directory);
    shell.exec(this.pullScript);
  }
}