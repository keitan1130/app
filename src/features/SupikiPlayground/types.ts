export type ThemeId = 'garden' | 'factory' | 'cafe' | 'moon'
export type Gimmick =
  | 'wind'
  | 'sprinkler'
  | 'bell'
  | 'bait'
  | 'hammer'
  | 'conveyor'
  | 'fan'
  | 'trap'
  | 'syrup'
  | 'teacup'
  | 'popcorn'
  | 'balloon'
  | 'ufo'
  | 'portal'
  | 'reverse'
  | 'meteor'
export type ToyAction = 'add' | 'snack' | 'jump' | 'float' | 'radio' | 'reset' | Gimmick

export type GimmickSpec = {
  id: Gimmick
  slot: string
  label: string
  hint: string
  toggle?: boolean
  position: [number, number]
}
export const themes: {
  id: ThemeId
  name: string
  note: string
  ground: string
  checks: [string, string]
  wood: string
  gimmicks: GimmickSpec[]
}[] = [
  {
    id: 'garden',
    name: 'もちもち広場',
    note: 'お庭で、ちょっといたずら。',
    ground: '#f3eada',
    checks: ['#b7cc94', '#afc68b'],
    wood: '#d5a778',
    gimmicks: [
      {
        id: 'wind',
        slot: 'a',
        label: 'つよい風',
        hint: 'びゅーん。みんなまとめて、風まかせ。',
        position: [-1.7, -2.5],
      },
      {
        id: 'sprinkler',
        slot: 'b',
        label: '水あそび',
        hint: 'お花よりもｽﾋﾟｷがぬれます。',
        position: [4.9, 0],
      },
      {
        id: 'bell',
        slot: 'c',
        label: 'だるまさん',
        hint: 'ベルを鳴らすと、しばらくピタッ。',
        position: [-1.7, 2.5],
      },
      {
        id: 'bait',
        slot: 'd',
        label: 'にせもののあめ',
        hint: '追いかけたのに……ない？',
        position: [1.2, -0.6],
      },
    ],
  },
  {
    id: 'factory',
    name: 'いたずら工作室',
    note: 'たたいて、流して、ひっくり返す。',
    ground: '#e3e8e5',
    checks: ['#aebfbb', '#a4b8b5'],
    wood: '#78918d',
    gimmicks: [
      {
        id: 'hammer',
        slot: 'a',
        label: 'ぺたんこハンマー',
        hint: 'ぺたんこになっても、ちゃんと戻ります。',
        position: [-1.7, -2.5],
      },
      {
        id: 'conveyor',
        slot: 'b',
        label: 'ベルトコンベア',
        hint: '床が勝手に進みます。逆らっても、もちっ。',
        toggle: true,
        position: [-1.7, 2.5],
      },
      {
        id: 'fan',
        slot: 'c',
        label: '巨大せんぷうき',
        hint: '近くのｽﾋﾟｷをふき上げます。',
        toggle: true,
        position: [4.9, 0],
      },
      {
        id: 'trap',
        slot: 'd',
        label: 'おとしあな',
        hint: '落ちても、上から帰ってきます。',
        toggle: true,
        position: [1.2, -0.6],
      },
    ],
  },
  {
    id: 'cafe',
    name: 'おやつ喫茶もち',
    note: '甘いだけでは、ありません。',
    ground: '#f3e4dc',
    checks: ['#e6bcba', '#edcfbf'],
    wood: '#bc8f83',
    gimmicks: [
      {
        id: 'syrup',
        slot: 'a',
        label: 'べたべたシロップ',
        hint: '通りかかると、あしが進まない。',
        toggle: true,
        position: [-1.7, 2.5],
      },
      {
        id: 'teacup',
        slot: 'b',
        label: 'ぐるぐるカップ',
        hint: 'みんなで回る。ちょっと回りすぎ。',
        toggle: true,
        position: [1.2, -0.6],
      },
      {
        id: 'popcorn',
        slot: 'c',
        label: 'おやつ大噴火',
        hint: 'あめが上から、ぽんぽんぽん。',
        position: [-1.7, -2.5],
      },
      {
        id: 'balloon',
        slot: 'd',
        label: 'ふうせん便',
        hint: 'ふうせんを結んで、空へお届け。',
        position: [4.9, 0],
      },
    ],
  },
  {
    id: 'moon',
    name: '月面もち基地',
    note: '宇宙でも、たぶんだいじょうぶ。',
    ground: '#353f56',
    checks: ['#8190a5', '#77889e'],
    wood: '#586e84',
    gimmicks: [
      {
        id: 'ufo',
        slot: 'a',
        label: 'UFOおむかえ',
        hint: '吸い上げて、別の場所にぽん。',
        toggle: true,
        position: [1.2, -0.6],
      },
      {
        id: 'portal',
        slot: 'b',
        label: 'ワープの輪',
        hint: '左に入ると、右から出ます。',
        toggle: true,
        position: [-1.7, 2.5],
      },
      {
        id: 'reverse',
        slot: 'c',
        label: 'さかさま重力',
        hint: '天井が床。スピキもさかさま。',
        toggle: true,
        position: [4.9, 0],
      },
      {
        id: 'meteor',
        slot: 'd',
        label: '流れ星シャワー',
        hint: 'ちいさな隕石で、みんなあわてます。',
        position: [-1.7, -2.5],
      },
    ],
  },
]

export const themeById = (id: ThemeId) => themes.find((theme) => theme.id === id) ?? themes[0]

export type Discovery = 'hello' | 'air' | 'snack' | 'party' | 'float' | 'photo'

export const discoveries: { id: Discovery; title: string; hint: string }[] = [
  { id: 'hello', title: 'はじめまして', hint: 'ｽﾋﾟｷをちょん、とさわる' },
  { id: 'air', title: 'とんでった', hint: 'つまんで、すっと投げる' },
  { id: 'snack', title: 'おやつのじかん', hint: 'あめをひとつ、どうぞ' },
  { id: 'party', title: 'ﾁｮﾜﾖ楽団', hint: 'ラジオをつける' },
  { id: 'float', title: 'もち、宇宙へ', hint: 'ふわふわスイッチを押す' },
  { id: 'photo', title: 'きょうの一枚', hint: 'あそびばを写真に残す' },
]

export type PlaygroundState = {
  count: number
  floating: boolean
  radio: boolean
  night: boolean
  discoveries: Discovery[]
  theme: ThemeId
  changing: boolean
  placingCandy: boolean
  activeGimmicks: Gimmick[]
}

export type SceneCallbacks = {
  onState: (state: PlaygroundState) => void
  onMessage: (message: string) => void
  onReady: () => void
  onError: (message: string) => void
}
