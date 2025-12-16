export interface TranscodeVideoEventDto {
  fileIdentifier: string;
  videoId: string;
}

export interface VideoTranscodedEventDto {
  videoId: string;
  newIdentifier: string;
}
