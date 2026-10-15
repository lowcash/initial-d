import { VehicleType } from '../objects/traffic/vehicle'

export enum DeviceType { DESKTOP = 0, MOBILE };

export enum GameState { GAME_OVER = 0, PLAY = 1 };

export enum ControlState { NOT_SELECTED = 0, PENDING = 1, SELECTED = 2 };

export class SettingsModel {
    deviceType: DeviceType;
    vehicle: VehicleType;

    constructor(deviceType: DeviceType, vehicle: VehicleType) {
        this.deviceType = deviceType;
        this.vehicle = vehicle;
    }
};
