import { Mapping } from '../objects/_common/mappingHelper'

function assetPath(rel: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const clean = rel.replace(/^\//, '')
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`
}

export interface SourceMapping extends Mapping {
  sourcePath: string
  sourceMapperPath?: string
  frameWidth?: number
  frameHeight?: number
}

class SourceModel {
  font!: SourceMapping
  imageLogo!: SourceMapping
  imageCity!: SourceMapping
  imageHill!: SourceMapping
  imageClouds!: SourceMapping
  imageForest!: SourceMapping
  spriteArrowsPlay!: SourceMapping
  spriteStart!: SourceMapping
  spriteAgain!: SourceMapping
  spriteMenu!: SourceMapping
  imageGameOver!: SourceMapping
  spriteMute!: SourceMapping
  soundButton!: SourceMapping
  soundBgm!: SourceMapping
  imageRoadStraight0!: SourceMapping
  imageRoadStraight1!: SourceMapping
  atlasVehicle!: SourceMapping
  spriteExplosion!: SourceMapping
  soundExplosion!: SourceMapping
  spriteCoin!: SourceMapping
  soundCoin!: SourceMapping
}

export const sourceModel: SourceModel = {
  font: {
    mappingKey: 'font',
    sourcePath: assetPath('assets/img/font.png'),
    sourceMapperPath: assetPath('assets/img/font.xml'),
  },
  imageLogo: {
    mappingKey: 'image_logo',
    sourcePath: assetPath('assets/img/logo.png'),
  },
  imageCity: {
    mappingKey: 'image_city',
    sourcePath: assetPath('assets/img/background/city.webp'),
  },
  imageHill: {
    mappingKey: 'image_hill',
    sourcePath: assetPath('assets/img/background/hills.png'),
  },
  imageClouds: {
    mappingKey: 'image_clouds',
    sourcePath: assetPath('assets/img/background/clouds.png'),
  },
  imageForest: {
    mappingKey: 'image_forest',
    sourcePath: assetPath('assets/img/background/forest.png'),
  },
  spriteArrowsPlay: {
    mappingKey: 'sprite_arrows_play',
    sourcePath: assetPath('assets/img/buttons/arrows_play.png'),
    frameWidth: 84,
    frameHeight: 76,
  },
  spriteStart: {
    mappingKey: 'sprite_sheet_start',
    sourcePath: assetPath('assets/img/buttons/start.png'),
    frameWidth: 191,
    frameHeight: 69,
  },
  spriteAgain: {
    mappingKey: 'sprite_sheet_again',
    sourcePath: assetPath('assets/img/buttons/again.png'),
    frameWidth: 608,
    frameHeight: 228,
  },
  spriteMenu: {
    mappingKey: 'sprite_sheet_menu',
    sourcePath: assetPath('assets/img/buttons/menu.png'),
    frameWidth: 602,
    frameHeight: 228,
  },
  imageGameOver: {
    mappingKey: 'image_game_over',
    sourcePath: assetPath('assets/img/buttons/game_over.png'),
  },
  spriteMute: {
    // 2-frame sheet (188×206 each, equalized + centered): 0 = sound on, 1 = muted
    mappingKey: 'sprite_sheet_mute',
    sourcePath: assetPath('assets/img/buttons/sound.png'),
    frameWidth: 188,
    frameHeight: 206,
  },
  soundButton: {
    mappingKey: 'sound_button',
    sourcePath: assetPath('assets/sound/button.ogg'),
  },
  soundBgm: {
    // CC0 eurobeat climax loop (Fever Stadium Climax BPM180 by MintoDog / OpenGameArt).
    mappingKey: 'sound_bgm',
    sourcePath: assetPath('assets/sound/bgm.ogg'),
  },
  imageRoadStraight0: {
    mappingKey: 'image_road_straight_0',
    sourcePath: assetPath('assets/img/map/road_straight_0.png'),
  },
  imageRoadStraight1: {
    mappingKey: 'image_road_straight_1',
    sourcePath: assetPath('assets/img/map/road_straight_1.png'),
  },
  atlasVehicle: {
    mappingKey: 'atlas_vehicles',
    sourcePath: assetPath('assets/img/vehicles/atlas_vehicles.png'),
    sourceMapperPath: assetPath('assets/img/vehicles/atlas_vehicles.json'),
  },
  spriteExplosion: {
    mappingKey: 'sprite_explosion',
    sourcePath: assetPath('assets/img/vehicles/explosion.png'),
    frameWidth: 17,
    frameHeight: 17,
  },
  soundExplosion: {
    mappingKey: 'sound_explosion',
    sourcePath: assetPath('assets/sound/explosion.ogg'),
  },
  spriteCoin: {
    mappingKey: 'sprite_coin',
    sourcePath: assetPath('assets/img/reward/coin.png'),
    frameWidth: 32,
    frameHeight: 32,
  },
  soundCoin: {
    mappingKey: 'sound_coin',
    sourcePath: assetPath('assets/sound/coin.ogg'),
  },
}
