// import * as tapo from 'tp-link-tapo-connect';
import * as tapo from '../api'
import find from 'local-devices'

/* Device list that supports energy usage */
const supportEnergyUsage = [
     "P110"
    ,"P115"
];

export namespace tplinkTapoConnectWrapperType {
    export type tapoConnectResults = {
        result: boolean;
        tapoDeviceInfo?: tapo.TapoDeviceInfo;
        tapoDevice?: tapo.TapoDevice[];
        tapoEnergyUsage?: tapo.TapoDeviceInfo | undefined;
        errorInf?: Error;
    }
}

/**
 *
 *
 * @export
 * @class tplinkTapoConnectWrapper
 */
export class tplinkTapoConnectWrapper {

    readonly currentWorkingDirectory: string = process.cwd();
    private static _instance: tplinkTapoConnectWrapper;

    /**
     *
     *
     * @static
     * @returns {tplinkTapoConnectWrapper}
     * @memberof tplinkTapoConnectWrapper
     */
    public static getInstance(): tplinkTapoConnectWrapper {
        if (!this._instance)
            this._instance = new tplinkTapoConnectWrapper();
        return this._instance;
    }

    /**
     *Creates an instance of tplinkTapoConnectWrapper.
    * @memberof tplinkTapoConnectWrapper
    */
    constructor() {

    }

    /**
     *
     *
     * @private
     * @param {string} _macAddress
     * @returns {string}
     * @memberof tplinkTapoConnectWrapper
     */
    private replaceMacAddress(_macAddress: string): string {
        return _macAddress.replace(/[:-]/g, '').toUpperCase();
    }

    /**
     *
     *
     * @private
     * @param {object} obj
     * @returns {boolean}
     * @memberof tplinkTapoConnectWrapper
     */
    private isEmpty(obj: object): boolean {
        return !Object.keys(obj).length;
    }

    /**
     *
     *
     * @private
     * @param {string} _email
     * @param {string} _password
     * @param {string} _alias
     * @param {string} _rangeOfIp
     * @returns
     * @memberof tplinkTapoConnectWrapper
     */
    private async getDeviceIpFromAlias(_email: string, _password: string, _alias: string, _rangeOfIp: string) {
        let _deviceIp: string = "";
        const _devices: tapo.TapoDevice[] | undefined = await this.getTapoDevicesList(_email, _password) || undefined;
        if (_devices !== undefined) {
            for (const _items of _devices) {
                if (_items.alias === _alias) {
                    const _discover = await find({ address: _rangeOfIp });
                    _deviceIp = _discover?.find((_device) =>
                        this.replaceMacAddress(_device.mac) === this.replaceMacAddress(_items.deviceMac))?.ip || "";
                    break;
                }
            }
        } else {
            throw new Error("Failed to get tapo device list.");
        }
        return _deviceIp;
    }

    /**
     * getDeviceIp
     *
     * @private
     * @param {string} _email
     * @param {string} _password
     * @param {string} _alias
     * @param {string} _rangeOfIp
     * @returns
     * @memberof tplinkTapoConnectWrapper
     */
    private async getDeviceIp(_email: string, _password: string, _alias: string, _rangeOfIp: string) {
        const _targetIp: string = await this.getDeviceIpFromAlias(_email, _password, _alias, _rangeOfIp) || "";
        if (_targetIp === "") {
            throw new Error("Failed to get tapo ip address.");
        }
        return _targetIp;
    }

    /**
     *
     *
     * @param {string} [_email=process.env.TAPO_USERNAME || ""]
     * @param {string} _password
     * @returns {(Promise< tapo.TapoDevice[] | undefined >)}
     * @memberof tplinkTapoConnectWrapper
     */
    public async getTapoDevicesList(_email: string = process.env.TAPO_USERNAME || "", _password: string): Promise<tapo.TapoDevice[] | undefined> {

        const _cloudToken = await tapo.cloudLogin(_email, _password);
        if (!_cloudToken) throw new Error("Failed to get tapo cloud token.");

        const _devices: tapo.TapoDevice[] | undefined = await _cloudToken.listDevicesByType('SMART.TAPOPLUG') || undefined;
        if (undefined === _devices) throw new Error("Failed to get tapo device list.");

        return _devices;
    }

    /**
     *
     *
     * @param {string} _email
     * @param {string} _password
     * @param {string} _alias
     * @param {string} _rangeOfIp
     * @returns {Promise< tplinkTapoConnectWrapperType.tapoConnectResults >}
     * @memberof tplinkTapoConnectWrapper
     */
    public async setTapoTurnOnAlias(_email: string, _password: string, _alias: string, _rangeOfIp: string): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            const _targetIp: string = await this.getDeviceIp(_email, _password, _alias, _rangeOfIp) || ""
            if (_targetIp === "") {
                throw new Error("Failed to get tapo ip address.");
            }
            // login device by ip
            const _deviceToken = await tapo.loginDeviceByIp(_email, _password, _targetIp);
            if (this.isEmpty(_deviceToken)) {
                throw new Error("tapo device token not found.");
            }
            // turn on
            await _deviceToken.turnOn();
            return { result: true };
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }

    /**
     *
     *
     * @param {string} _email
     * @param {string} _password
     * @param {string} _alias
     * @param {string} _rangeOfIp
     * @returns {Promise< tplinkTapoConnectWrapperType.tapoConnectResults >}
     * @memberof tplinkTapoConnectWrapper
     */
    public async setTapoTurnOffAlias(_email: string, _password: string, _alias: string, _rangeOfIp: string): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            const _targetIp: string = await this.getDeviceIp(_email, _password, _alias, _rangeOfIp);
            const _deviceToken = await tapo.loginDeviceByIp(_email, _password, _targetIp);
            if (this.isEmpty(_deviceToken)) {
                throw new Error("tapo device token not found.");
            }
            // turn off
            await _deviceToken.turnOff();
            return { result: true };
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }

    /**
     *
     *
     * @param {string} _email
     * @param {string} _password
     * @param {string} _alias
     * @param {string} _rangeOfIp
     * @param {number} _brightness
     * @returns {Promise< tplinkTapoConnectWrapperType.tapoConnectResults >}
     * @memberof tplinkTapoConnectWrapper
     */
    public async setTapoBrightnessAlias(_email: string, _password: string, _alias: string, _rangeOfIp: string, _brightness: number): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            if (_brightness < 0 || _brightness > 100) {
                throw "brightness out of range";
            }
            const _targetIp: string = await this.getDeviceIp(_email, _password, _alias, _rangeOfIp);
            if (_targetIp === "") {
                throw new Error("Failed to get tapo ip address.");
            }
            // login device by ip
            const _deviceToken = await tapo.loginDeviceByIp(_email, _password, _targetIp);
            if (this.isEmpty(_deviceToken)) {
                throw new Error("tapo device token not found.");
            }
            // set brightness
            await _deviceToken.setBrightness(_brightness);
            return { result: true };
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }

    /**
     * 
     *
     * @param {string} _email
     * @param {string} _password
     * @param {string} _alias
     * @param {string} _rangeOfIp
     * @param {string} _colour
     * @returns {Promise< tplinkTapoConnectWrapperType.tapoConnectResults >}
     * @memberof tplinkTapoConnectWrapper
     */
    public async setTapoColourAlias(_email: string, _password: string, _alias: string, _rangeOfIp: string, _colour: string): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            if (_colour === "") {
                throw "Incorrect colour value";
            }
            const _targetIp: string = await this.getDeviceIp(_email, _password, _alias, _rangeOfIp);
            await this.setTapoColour(_email, _password, _targetIp, _colour);
            return { result: true };
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }

    /**
     *
     *
     * @param {string} _email
     * @param {string} _password
     * @param {string} _alias
     * @returns {Promise< tplinkTapoConnectWrapperType.tapoConnectResults >}
     * @memberof tplinkTapoConnectWrapper
     */
    public async getTapoDeviceInfoAlias(_email: string, _password: string, _alias: string): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            const _cloudToken = await tapo.cloudLogin(_email, _password);
            const _devices = await _cloudToken.listDevicesByType('SMART.TAPOPLUG');
            for (const _items of _devices) {
                if (_items.alias === _alias) {
                    let _deviceToken = await tapo.loginDevice(_email, _password, _items);
                    if (this.isEmpty(_deviceToken)) {
                        throw new Error("tapo device token not found.");
                    }
                    // get DeviceInfo
                    let _tapoDeviceInfo: tapo.TapoDeviceInfo = await _deviceToken.getDeviceInfo();
                    if (this.isEmpty(_tapoDeviceInfo)) {
                        throw new Error("tapo device info not found.");
                    }
                    return { result: true, tapoDeviceInfo: _tapoDeviceInfo };
                }
            }
            throw new Error("tapo device info not found.");
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }

    /**
     *
     *
     * @param {string} _email
     * @param {string} _password
     * @param {string} _targetIp
     * @returns {Promise< tplinkTapoConnectWrapperType.tapoConnectResults >}
     * @memberof tplinkTapoConnectWrapper
     */
    public async getTapoDeviceInfo(_email: string, _password: string, _targetIp: string): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            let _tapoConnectResults: tplinkTapoConnectWrapperType.tapoConnectResults = { result: false };
            const _deviceToken = await tapo.loginDeviceByIp(_email, _password, _targetIp);
            if (this.isEmpty(_deviceToken)) {
                throw new Error("tapo device token not found.");
            }
            // get DeviceInfo
            const _tapoDeviceInfo: tapo.TapoDeviceInfo = await _deviceToken.getDeviceInfo();
            if (this.isEmpty(_tapoDeviceInfo)) {
                throw new Error("tapo device info not found.");
            }
            _tapoConnectResults.tapoDeviceInfo = _tapoDeviceInfo;
            // get EnergyUsage
            if ( supportEnergyUsage.includes(_tapoDeviceInfo.model )) {
                const _tapoEnergyUsage = await _deviceToken.getEnergyUsage();
                if (this.isEmpty(_tapoEnergyUsage)) {
                    throw new Error("tapo device energy not found.");
                }
                _tapoConnectResults.tapoEnergyUsage = _tapoEnergyUsage;
            }
            _tapoConnectResults.result = true;
            return _tapoConnectResults;
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }

    /**
     *
     *
     * @param {string} _email
     * @param {string} _password
     * @param {string} _targetIp
     * @return {*}  {Promise<tplinkTapoConnectWrapperType.tapoConnectResults>}
     * @memberof tplinkTapoConnectWrapper
     */
    public async getTapoEnergyUsage(_email: string, _password: string, _targetIp: string): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            const _deviceToken = await tapo.loginDeviceByIp(_email, _password, _targetIp);
            if (this.isEmpty(_deviceToken)) {
                throw new Error("tapo device token not found.");
            }
            // get EnergyUsage
           	const _tapoEnergyUsage: tapo.TapoDeviceInfo = await _deviceToken.getEnergyUsage();
            if (this.isEmpty(_tapoEnergyUsage)) {
                throw new Error("tapo device energy not found.");
            }
            return { result: true, tapoDeviceInfo: _tapoEnergyUsage };
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }

    /**
     *
     *
     * @param {string} _targetIp
     * @returns {Promise< object >}
     * @memberof tplinkTapoConnectWrapper
     */
    public async setTapoTurnOn(_email: string, _password: string, _targetIp: string): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            const _deviceToken = await tapo.loginDeviceByIp(_email, _password, _targetIp);
            if (this.isEmpty(_deviceToken)) {
                throw new Error("tapo device token not found.");
            }
            // turn on
            await _deviceToken.turnOn();
            return { result: true };
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }

    /**
     * set turn off
     *
     * @param {string} _email
     * @param {string} _password
     * @param {string} _targetIp
     * @returns {Promise< tplinkTapoConnectWrapperType.tapoConnectResults >}
     * @memberof tplinkTapoConnectWrapper
     */
    public async setTapoTurnOff(_email: string, _password: string, _targetIp: string): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            const _deviceToken = await tapo.loginDeviceByIp(_email, _password, _targetIp);
            if (this.isEmpty(_deviceToken)) {
                throw new Error("tapo device token not found.");
            }
            // turn off
            await _deviceToken.turnOff();
            return { result: true };
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }

    /**
     * set brightness
     *
     * @param {string} _email
     * @param {string} _password
     * @param {string} _targetIp
     * @param {number} _brightness
     * @returns {Promise< tplinkTapoConnectWrapperType.tapoConnectResults >}
     * @memberof tplinkTapoConnectWrapper
     */
    public async setTapoBrightness(_email: string, _password: string, _targetIp: string, _brightness: number): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            if (_brightness < 0 || _brightness > 100) {
                throw "brightness out of range";
            }
            const _deviceToken = await tapo.loginDeviceByIp(_email, _password, _targetIp);
            if (this.isEmpty(_deviceToken)) {
                throw new Error("tapo device token not found.");
            }
            // set brightness
            await _deviceToken.setBrightness(_brightness);
            return { result: true };
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }

    /**
     * 
     *
     * @param {string} _email
     * @param {string} _password
     * @param {string} _targetIp
     * @param {string} _colour
     * @returns {Promise< tplinkTapoConnectWrapperType.tapoConnectResults >}
     * @memberof tplinkTapoConnectWrapper
     */
    public async setTapoColour(_email: string, _password: string, _targetIp: string, _colour: string): Promise<tplinkTapoConnectWrapperType.tapoConnectResults> {
        try {
            if (_colour === "") {
                throw "Incorrect colour value";
            }
            const _deviceToken = await tapo.loginDeviceByIp(_email, _password, _targetIp);
            if (this.isEmpty(_deviceToken)) {
                throw new Error("tapo device token not found.");
            }
            // set colour
            await _deviceToken.setColour(_colour);
            return { result: true };
        } catch (error: any) {
            return { result: false, errorInf: error };
        }
    }
}

// type.ts
// export { tplinkTapoConnectWrapperType } from './type'

/* E.O.F */