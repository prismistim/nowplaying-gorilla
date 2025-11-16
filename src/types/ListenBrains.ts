export interface ListenBrainsResponse {
  payload: Payload
}

interface Payload {
  count: number
  listens: Listen[]
  playing_now: boolean
  user_id: string
}

interface Listen {
  playing_now: boolean
  track_metadata: Trackmetadata
}

interface Trackmetadata {
  additional_info: Additionalinfo
  artist_name: string
  release_name: string
  track_name: string
}

interface Additionalinfo {
  music_service_name?: string
  origin_url?: string
  duration_ms: number
  submission_client: string
  submission_client_version: string
}
