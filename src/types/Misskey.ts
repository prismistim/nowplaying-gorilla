// ----------------------------------------------------------------
// ルートオブジェクト (スキーマ全体)
// ----------------------------------------------------------------
export type MisskeyPage = {
  id: string
  createdAt: string // date-time
  updatedAt: string // date-time
  userId: string
  user: User
  content: ContentItem[]
  variables: Record<string, any>[]
  title: string
  name: string
  summary: string | null
  hideTitleWhenPinned: boolean
  alignCenter: boolean
  font: string
  script: string
  eyeCatchingImageId: string | null
  eyeCatchingImage: DriveFile | null
  attachedFiles: DriveFile[]
  likedCount: number
  isLiked?: boolean // 'required' リストにないためオプショナル
}

// ----------------------------------------------------------------
// ユーザー関連 (root.user)
// ----------------------------------------------------------------
type User = {
  id: string
  name: string | null
  username: string
  host: string | null
  avatarUrl: string
  avatarBlurhash: string | null
  avatarDecorations: AvatarDecoration[]
  emojis: Record<string, string>
  onlineStatus: 'unknown' | 'online' | 'active' | 'offline'
  isBot?: boolean
  isCat?: boolean
  requireSigninToViewContents?: boolean
  makeNotesFollowersOnlyBefore?: number | null
  makeNotesHiddenBefore?: number | null
  instance?: Instance
  badgeRoles?: BadgeRole[]
}

// ユーザーのアバター装飾 (user.avatarDecorations.items)
type AvatarDecoration = {
  id: string
  url: string
  angle?: number
  flipH?: boolean
  offsetX?: number
  offsetY?: number
}

// ユーザーのインスタンス情報 (user.instance)
type Instance = {
  name: string | null
  softwareName: string | null
  softwareVersion: string | null
  iconUrl: string | null
  faviconUrl: string | null
  themeColor: string | null
}

// ユーザーのバッジ (user.badgeRoles.items)
type BadgeRole = {
  name: string
  iconUrl: string | null
  displayOrder: number
}

// ----------------------------------------------------------------
// ページコンテント (root.content.items)
// ----------------------------------------------------------------

// コンテント: テキストブロック
type ContentText = {
  id: string
  type: 'text'
  text: string
}

// コンテント: セクション
type ContentSection = {
  id: string
  type: 'section'
  title: string
  children: Record<string, ContentItem>[] // スキーマの定義が 'object' と曖昧なため
}

// コンテント: 画像
type ContentImage = {
  id: string
  type: 'image'
  fileId: string | null
}

// コンテント: ノート埋め込み
type ContentNote = {
  id: string
  type: 'note'
  detailed: boolean
  note: string | null
}

// ページの content 配列の要素 (oneOf)
type ContentItem = ContentText | ContentSection | ContentImage | ContentNote

// ----------------------------------------------------------------
// Misskey ドライブファイル関連 (root.eyeCatchingImage, root.attachedFiles.items)
// ----------------------------------------------------------------

// ファイルのプロパティ (DriveFile.properties)
type FileProperties = {
  width?: number
  height?: number
  orientation?: number
  avgColor?: string
}

// ドライブフォルダ (DriveFile.folder)
// 'parent' で自己参照（循環）するため interface で定義
interface DriveFolder {
  id: string
  createdAt: string // date-time
  name: string
  parentId: string | null
  foldersCount?: number
  filesCount?: number
  parent?: DriveFolder | null // 循環参照
}

// ドライブファイル
type DriveFile = {
  id: string
  createdAt: string // date-time
  name: string
  type: string
  md5: string
  size: number
  isSensitive: boolean
  blurhash: string | null
  properties: FileProperties
  url: string
  thumbnailUrl: string | null
  comment: string | null
  folderId: string | null
  userId: string | null
  folder?: DriveFolder | null
  user?: User | null
}
