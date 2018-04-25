export interface IConfiguration {
    server: string;
    apiUrl: string;
    userName: string,
    userPwd: string,
    domain?: string,
    signalRLog?: boolean,
    notificarConexionLenta?: boolean
};

export class Configuration implements IConfiguration {
    constructor(public server: string,
        public apiUrl: string,
        public userName: string,
        public userPwd: string,
        public domain?: string,
        public signalrLogging?: boolean,
        public notificarConexionLenta?: boolean
    ) {
    }
}