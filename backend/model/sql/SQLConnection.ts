import 'reflect-metadata';
import {Connection, ConnectionOptions, createConnection, getConnection} from 'typeorm';
import {UserEntity} from './enitites/UserEntity';
import {UserRoles} from '../../../common/entities/UserDTO';
import {PhotoEntity} from './enitites/PhotoEntity';
import {DirectoryEntity} from './enitites/DirectoryEntity';
import {Config} from '../../../common/config/private/Config';
import {SharingEntity} from './enitites/SharingEntity';
import {DataBaseConfig, DatabaseType} from '../../../common/config/private/IPrivateConfig';
import {PasswordHelper} from '../PasswordHelper';
import {ProjectPath} from '../../ProjectPath';
import {VersionEntity} from './enitites/VersionEntity';
import {Logger} from '../../Logger';
import {MediaEntity} from './enitites/MediaEntity';
import {VideoEntity} from './enitites/VideoEntity';
import {DataStructureVersion} from '../../../common/DataStructureVersion';
import {FileEntity} from './enitites/FileEntity';


export class SQLConnection {


  constructor() {
  }

  private static connection: Connection = null;

  public static async getConnection(): Promise<Connection> {
    if (this.connection == null) {
      const options: any = this.getDriver(Config.Server.database);
   //   options.name = 'main';
      options.entities = [
        UserEntity,
        FileEntity,
        MediaEntity,
        PhotoEntity,
        VideoEntity,
        DirectoryEntity,
        SharingEntity,
        VersionEntity
      ];
      options.synchronize = false;
      // options.logging = 'all';
      this.connection = await createConnection(options);
      await SQLConnection.schemeSync(this.connection);
    }
    return this.connection;
  }

  public static async tryConnection(config: DataBaseConfig) {
    try {
      await getConnection('test').close();
    } catch (err) {
    }
    const options: any = this.getDriver(config);
    options.name = 'test';
    options.entities = [
      UserEntity,
      FileEntity,
      MediaEntity,
      PhotoEntity,
      VideoEntity,
      DirectoryEntity,
      SharingEntity,
      VersionEntity
    ];
    options.synchronize = false;
    // options.logging = "all";
    const conn = await createConnection(options);
    await SQLConnection.schemeSync(conn);
    await conn.close();
    return true;
  }

  public static async init(): Promise<void> {
    const connection = await this.getConnection();
    const userRepository = connection.getRepository(UserEntity);
    const admins = await userRepository.find({role: UserRoles.Admin});
    if (admins.length === 0) {
      const a = new UserEntity();
      a.name = 'admin';
      a.password = PasswordHelper.cryptPassword('admin');
      a.role = UserRoles.Admin;
      await userRepository.save(a);
    }

  }

  private static async schemeSync(connection: Connection) {
    let version = null;
    try {
      version = await connection.getRepository(VersionEntity).findOne();
    } catch (ex) {
    }
    if (version && version.version === DataStructureVersion) {
      return;
    }
    Logger.info('Updating database scheme');
    if (!version) {
      version = new VersionEntity();
    }
    version.version = DataStructureVersion;


    await connection.dropDatabase();
    await connection.synchronize();
    await connection.getRepository(VersionEntity).save(version);
  }

  private static getDriver(config: DataBaseConfig): ConnectionOptions {
    let driver: ConnectionOptions = null;
    if (config.type === DatabaseType.mysql) {
      driver = {
        type: 'mysql',
        host: config.mysql.host,
        port: 3306,
        username: config.mysql.username,
        password: config.mysql.password,
        database: config.mysql.database
      };
    } else if (config.type === DatabaseType.sqlite) {
      driver = {
        type: 'sqlite',
        database: ProjectPath.getAbsolutePath(config.sqlite.storage)
      };
    }
    return driver;
  }

  public static async close() {
    try {
      if (this.connection != null) {
        await this.connection.close();
        this.connection = null;
      }
    } catch (err) {
      console.error(err);
    }
  }


}
