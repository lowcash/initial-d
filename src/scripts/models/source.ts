import { Mapping } from '../objects/_common/mappingHelper'

interface SourceMapping extends Mapping {
    sourcePath: string;
    sourceMapperPath?: string;
};

class SourceModel {
    font: SourceMapping;
    imageLogo: SourceMapping;
    imageCity: SourceMapping;
    imageHill: SourceMapping;
    imageClouds: SourceMapping;
    imageForest: SourceMapping;
    spriteArrowsPlay: SourceMapping;
    spriteStart: SourceMapping;
    spriteAgain: SourceMapping;
    spriteMenu: SourceMapping;
    imageGameOver: SourceMapping;
    spriteMute: SourceMapping;
    soundButton: SourceMapping;
    soundBgm: SourceMapping;
    imageRoadStraight0: SourceMapping;
    imageRoadStraight1: SourceMapping;
    atlasVehicle: SourceMapping;
    spriteExplosion: SourceMapping;
    soundExplosion: SourceMapping;
    spriteCoin: SourceMapping;
    soundCoin: SourceMapping;
};

export const sourceModel: SourceModel = {
    font: {
        mappingKey: 'font',
        sourcePath: 'assets/img/font.png',
        sourceMapperPath: 'assets/img/font.xml'
    },
    imageLogo: {
        mappingKey: 'image_logo',
        sourcePath: 'assets/img/logo.png'
    },
    imageCity: {
        mappingKey: 'image_city',
        sourcePath: 'assets/img/background/city.png'
    },
    imageHill: {
        mappingKey: 'image_hill',
        sourcePath: 'assets/img/background/hills.png'
    },
    imageClouds: {
        mappingKey: 'image_clouds',
        sourcePath: 'assets/img/background/clouds.png'
    },
    imageForest: {
        mappingKey: 'image_forest',
        sourcePath: 'assets/img/background/forest.png'
    },
    spriteArrowsPlay: {
        mappingKey: 'sprite_arrows_play',
        sourcePath: 'assets/img/buttons/arrows_play.png'
    },
    spriteStart: {
        mappingKey: 'sprite_sheet_start',
        sourcePath: 'assets/img/buttons/start.png'
    },
    spriteAgain: {
        mappingKey: 'sprite_sheet_again',
        sourcePath: 'assets/img/buttons/again.png'
    },
    spriteMenu: {
        mappingKey: 'sprite_sheet_menu',
        sourcePath: 'assets/img/buttons/menu.png'
    },
    imageGameOver: {
        mappingKey: 'image_game_over',
        sourcePath: 'assets/img/buttons/game_over.png'
    },
    spriteMute: {
        // 2-frame sheet (188×206 each, equalized + centered): 0 = sound on, 1 = muted
        mappingKey: 'sprite_sheet_mute',
        sourcePath: 'assets/img/buttons/sound.png'
    },
    soundButton: {
        mappingKey: 'sound_button',
        sourcePath: 'assets/sound/button.wav'
    },
    soundBgm: {
        // CC0 eurobeat climax loop (Fever Stadium Climax BPM180 by MintoDog / OpenGameArt).
        // Not the copyrighted Initial D soundtrack — closest legal eurobeat energy we can ship.
        mappingKey: 'sound_bgm',
        sourcePath: 'assets/sound/bgm.ogg'
    },
    imageRoadStraight0: {
        mappingKey: 'image_road_straight_0',
        sourcePath: 'assets/img/map/road_straight_0.png'
    },
    imageRoadStraight1: {
        mappingKey: 'image_road_straight_1',
        sourcePath: 'assets/img/map/road_straight_1.png'
    },
    atlasVehicle: {
        mappingKey: 'atlas_vehicles',
        sourcePath: 'assets/img/vehicles/atlas_vehicles.png',
        sourceMapperPath: 'assets/img/vehicles/atlas_vehicles.json'
    },
    spriteExplosion: {
        mappingKey: 'sprite_explosion',
        sourcePath: 'assets/img/vehicles/explosion.png'
    },
    soundExplosion: {
        mappingKey: 'sound_explosion',
        sourcePath: 'assets/sound/explosion.wav'
    },
    spriteCoin: {
        mappingKey: 'sprite_coin',
        sourcePath: 'assets/img/reward/coin.png'
    },
    soundCoin: {
        mappingKey: 'sound_coin',
        sourcePath: 'assets/sound/coin.wav'
    }
};
