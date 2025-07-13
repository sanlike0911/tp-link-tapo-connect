// import * as tapo from 'tp-link-tapo-connect';
import * as tapo from './tplink_tapo_connect_wrapper';

import * as dotenv from 'dotenv';

// 環境変数を取得。存在しない場合は空文字をデフォルト値とする
dotenv.config();
const TAPO_EMAIL = process.env.TAPO_EMAIL || '';
const TAPO_PASSWORD = process.env.TAPO_PASSWORD || '';
const DEVICE_IP = process.env.DEVICE_IP || '';

// 必要な環境変数が設定されているか確認
if (!TAPO_EMAIL || !TAPO_PASSWORD || !DEVICE_IP) {
    console.error(
        'Error: Required environment variables are not set.'
    );
    console.error(
        'Please create a .env file or set TAPO_EMAIL, TAPO_PASSWORD, and DEVICE_IP as environment variables.'
    );
    process.exit(1); // Exit with an error code
}

/**
 * Tapoスマートプラグを操作するメイン関数
 */
async function controlPlug() {

    try {
        let result;

        const deviceInfo = await tapo.tplinkTapoConnectWrapper.getInstance()
            .getTapoDeviceInfo(TAPO_EMAIL, TAPO_PASSWORD, DEVICE_IP);
        console.log(deviceInfo);

        result = await tapo.tplinkTapoConnectWrapper.getInstance()
            .setTapoTurnOn(TAPO_EMAIL, TAPO_PASSWORD, DEVICE_IP);
        console.log(result);

        // await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒待機

        result = await tapo.tplinkTapoConnectWrapper.getInstance()
            .setTapoTurnOff(TAPO_EMAIL, TAPO_PASSWORD, DEVICE_IP);
        console.log(result);

        await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒待機

        // result = await tapo.tplinkTapoConnectWrapper.getInstance()
        //     .setTapoTurnOn(TAPO_EMAIL, TAPO_PASSWORD, DEVICE_IP);
        // console.log(result);

    } catch (error) {
        console.error(error);
    }
}

controlPlug();
