import {DirectoryDTO} from './DirectoryDTO';
import {OrientationTypes} from 'ts-exif-parser';
import {MediaDTO, MediaMetadata, MediaDimension} from './MediaDTO';

export interface PhotoDTO extends MediaDTO {
  id: number;
  name: string;
  directory: DirectoryDTO;
  metadata: PhotoMetadata;
  readyThumbnails: Array<number>;
  readyIcon: boolean;
}

export interface PhotoMetadata extends MediaMetadata {
  caption: string;
  keywords: Array<string>;
  cameraData: CameraMetadata;
  positionData: PositionMetaData;
  orientation: OrientationTypes;
  size: MediaDimension;
  creationDate: number;
  fileSize: number;
}


export interface PositionMetaData {
  GPSData?: GPSMetadata;
  country?: string;
  state?: string;
  city?: string;
}

export interface GPSMetadata {
  latitude?: number;
  longitude?: number;
  altitude?: number;
}


export interface CameraMetadata {
  ISO?: number;
  model?: string;
  make?: string;
  fStop?: number;
  exposure?: number;
  focalLength?: number;
  lens?: string;
}
