import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import supikiImage from '@/assets/supiki.png'
import styles from './index.module.css'
import { PlaygroundScene } from './PlaygroundScene'
import { PlayIcon, type PlayIconName } from './PlayIcon'
import { PlaygroundSound } from './sound'
import {
  type Discovery,
  discoveries,
  type Gimmick,
  type PlaygroundState,
  type ThemeId,
  type ToyAction,
  themeById,
  themes,
} from './types'

type Preferences = { sound: boolean; night: boolean; discoveries: Discovery[]; theme: ThemeId }
const STORAGE_KEY = 'supiki-playground:v1'
const initialPreferences = (): Preferences => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return {
      sound: typeof saved?.sound === 'boolean' ? saved.sound : true,
      night: saved?.night === true,
      theme: themes.some((theme) => theme.id === saved?.theme) ? saved.theme : 'garden',
      discoveries: Array.isArray(saved?.discoveries)
        ? discoveries.filter((item) => saved.discoveries.includes(item.id)).map((item) => item.id)
        : [],
    }
  } catch {
    return { sound: true, night: false, discoveries: [], theme: 'garden' }
  }
}

const savePreferences = (preferences: Preferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Preferences are optional. Playing never depends on storage being available.
  }
}

const tools: {
  action: ToyAction
  icon: PlayIconName
  label: string
  short?: string
  key: string
}[] = [
  { action: 'add', icon: 'add', label: 'ふやす', key: '1' },
  { action: 'snack', icon: 'snack', label: 'おやつ', key: '2' },
  { action: 'jump', icon: 'jump', label: 'みんなで跳ぶ', short: 'ジャンプ', key: '3' },
  { action: 'float', icon: 'float', label: 'ふわふわ', key: '4' },
  { action: 'radio', icon: 'radio', label: 'ラジオ', key: 'M' },
]

const gimmickIcons: Record<Gimmick, PlayIconName> = {
  wind: 'float',
  sprinkler: 'jump',
  bell: 'sound',
  bait: 'snack',
  hammer: 'hand',
  conveyor: 'back',
  fan: 'float',
  trap: 'download',
  syrup: 'snack',
  teacup: 'radio',
  popcorn: 'jump',
  balloon: 'float',
  ufo: 'float',
  portal: 'reset',
  reverse: 'reset',
  meteor: 'star',
}

const discoveryIcons: PlayIconName[] = ['hand', 'jump', 'snack', 'radio', 'float', 'camera']

export const SupikiPlayground = () => {
  const [preferences] = useState(initialPreferences)
  const preferencesRef = useRef(preferences)
  const [game, setGame] = useState<PlaygroundState>({
    count: 4,
    floating: false,
    radio: false,
    night: preferences.night,
    discoveries: preferences.discoveries,
    theme: preferences.theme,
    changing: false,
    placingCandy: false,
    activeGimmicks: [],
  })
  const [soundEnabled, setSoundEnabled] = useState(preferences.sound)
  const [loading, setLoading] = useState(true)
  const [failure, setFailure] = useState('')
  const [message, setMessage] = useState('今日は、なにしてあそぶ？')
  const [panel, setPanel] = useState<'help' | 'photo' | 'notebook' | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [restart, setRestart] = useState(0)
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<PlaygroundScene | null>(null)
  const soundRef = useRef<PlaygroundSound | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const ready = !loading && !failure && !game.changing
  const currentTheme = themeById(game.theme)
  const themeIndex = themes.findIndex((theme) => theme.id === game.theme)
  const candyGestureRef = useRef<{ pointer: number; x: number; y: number; moved: boolean } | null>(
    null
  )
  const ignoreCandyClick = useRef(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: restart explicitly retries the WebGL context after cleaning up the failed scene.
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let active = true
    let scene: PlaygroundScene | null = null
    const sound = new PlaygroundSound()
    sound.setMuted(!preferencesRef.current.sound)
    soundRef.current = sound
    const previousTitle = document.title
    document.title = 'ｽﾋﾟｷのあそびば — つまんで、ぽーん。'
    try {
      scene = new PlaygroundScene(
        mount,
        sound,
        {
          onState: (state) => {
            if (!active) return
            setGame(state)
            preferencesRef.current = {
              ...preferencesRef.current,
              night: state.night,
              theme: state.theme,
              discoveries: state.discoveries,
            }
            savePreferences(preferencesRef.current)
          },
          onMessage: (text) => {
            if (active) setMessage(text)
          },
          onReady: () => {
            if (active) setLoading(false)
          },
          onError: (text) => {
            if (!active) return
            sceneRef.current?.setPaused(true)
            setFailure(text)
            setLoading(false)
          },
        },
        preferencesRef.current
      )
      sceneRef.current = scene
    } catch {
      setLoading(false)
      setFailure(
        'このブラウザでは3Dのあそびばを開けませんでした。WebGLを利用できるか確認してみてください。'
      )
    }
    return () => {
      active = false
      sceneRef.current = null
      soundRef.current = null
      scene?.dispose()
      sound.dispose()
      document.title = previousTitle
    }
  }, [restart])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    sceneRef.current?.setPaused(panel !== null)
    if (panel && !dialog.open) dialog.showModal()
    else if (!panel && dialog.open) dialog.close()
  }, [panel])

  const act = (action: ToyAction) => {
    if (action === 'snack' && ignoreCandyClick.current) {
      ignoreCandyClick.current = false
      return
    }
    sceneRef.current?.act(action)
  }
  const candyGesture = {
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!ready || event.button !== 0) return
      ignoreCandyClick.current = false
      candyGestureRef.current = {
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        moved: false,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = candyGestureRef.current
      if (!drag || drag.pointer !== event.pointerId) return
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 6) drag.moved = true
      if (drag.moved) sceneRef.current?.previewCandyAt(event.clientX, event.clientY)
    },
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = candyGestureRef.current
      if (!drag || drag.pointer !== event.pointerId) return
      ignoreCandyClick.current = drag.moved
      if (drag.moved) sceneRef.current?.commitCandyAt(event.clientX, event.clientY)
      candyGestureRef.current = null
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId)
    },
    onPointerCancel: () => {
      candyGestureRef.current = null
      ignoreCandyClick.current = true
      sceneRef.current?.cancelCandyPreview()
    },
  }

  const toggleSound = () => {
    const enabled = !soundEnabled
    setSoundEnabled(enabled)
    soundRef.current?.setMuted(!enabled)
    preferencesRef.current = { ...preferencesRef.current, sound: enabled }
    savePreferences(preferencesRef.current)
  }

  const takePhoto = () => {
    try {
      const result = sceneRef.current?.takePhoto()
      if (result) {
        setPhoto(result)
        setPanel('photo')
      }
    } catch {
      setMessage('写真を撮れませんでした。もう一度ためしてみてね。')
    }
  }

  return (
    <main
      data-playground-theme={game.theme}
      className={`${styles.playground} ${game.night ? styles.night : ''}`}
    >
      <div className={styles.sceneFrame}>
        <div className={styles.scene} ref={mountRef} />
        <nav className={styles.anchors} aria-label="あそびばのおもちゃ" hidden={!ready}>
          <button
            type="button"
            data-toy="jump"
            className={`${styles.toyLabel} ${styles.pinkLabel}`}
            onClick={() => act('jump')}
            aria-label="トランポリンでみんな跳ぶ"
          >
            ぴょん！<span>↓</span>
          </button>
          <button
            type="button"
            data-toy="radio"
            className={styles.toyLabel}
            onClick={() => act('radio')}
            aria-pressed={game.radio}
          >
            ﾁｮﾜﾖ FM <span className={game.radio ? styles.liveDot : styles.offDot} />
          </button>
          <button
            type="button"
            data-toy="float"
            className={`${styles.toyLabel} ${styles.blueLabel}`}
            onClick={() => act('float')}
            aria-pressed={game.floating}
          >
            重力、ひとやすみ。
          </button>
          <button
            type="button"
            data-toy="snack"
            {...candyGesture}
            className={`${styles.toyLabel} ${styles.yellowLabel} ${styles.candySource}`}
            onClick={() => act('snack')}
          >
            あめをつまんで運ぶ
          </button>
          {currentTheme.gimmicks.map((gimmick) => (
            <button
              key={gimmick.slot}
              type="button"
              data-toy={gimmick.id}
              className={`${styles.toyLabel} ${styles.gimmickLabel}`}
              aria-label={`${gimmick.label}の仕掛け`}
              title={gimmick.hint}
              onClick={() => act(gimmick.id)}
            >
              <PlayIcon name={gimmickIcons[gimmick.id]} />
            </button>
          ))}
        </nav>
      </div>

      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          <PlayIcon name="back" />
          <span>いつものところへ</span>
        </Link>
        <div className={styles.brand}>
          <p className={styles.eyebrow}>
            <span /> 本日も、もちもち。
          </p>
          <h1>
            ｽﾋﾟｷの
            <span>
              あそびば<b>。</b>
            </span>
          </h1>
          <p className={styles.description}>
            つまんで、ぽーん。
            <br />
            たまには、なにもせず。
          </p>
          <svg
            className={styles.scribble}
            width="130"
            height="30"
            viewBox="0 0 130 30"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 16c29-10 74-14 117-8M7 23c35-10 74-13 112-10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </header>

      <nav className={styles.themeSwitch} aria-label="台のテーマ">
        <button
          type="button"
          className={styles.themeArrow}
          disabled={!ready}
          onClick={() => sceneRef.current?.cycleTheme(-1)}
          aria-label="前の台へ"
        >
          <PlayIcon name="back" />
        </button>
        <div className={styles.themeName}>
          <span>あそぶところ / {String(themeIndex + 1).padStart(2, '0')}</span>
          <strong>{currentTheme.name}</strong>
          <div className={styles.themeDots}>
            {themes.map((theme, index) => (
              <button
                key={theme.id}
                type="button"
                disabled={!ready}
                aria-pressed={game.theme === theme.id}
                aria-label={`${theme.name}の台に変更`}
                onClick={() => sceneRef.current?.changeTheme(theme.id, index > themeIndex ? 1 : -1)}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          className={`${styles.themeArrow} ${styles.nextArrow}`}
          disabled={!ready}
          onClick={() => sceneRef.current?.cycleTheme(1)}
          aria-label="次の台へ"
        >
          <PlayIcon name="back" />
        </button>
      </nav>
      <div className={styles.topTools}>
        <button
          type="button"
          className={styles.smallButton}
          onClick={toggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? '音を消す' : '音を出す'}
          title={soundEnabled ? '音を消す' : '音を出す'}
        >
          <PlayIcon name={soundEnabled ? 'sound' : 'muted'} />
          <span>{soundEnabled ? '音あり' : '音なし'}</span>
        </button>
        <button
          type="button"
          className={styles.smallButton}
          disabled={!ready}
          onClick={() => sceneRef.current?.setNight(!game.night)}
          aria-pressed={game.night}
          aria-label={game.night ? '昼にする' : '夜にする'}
          title={game.night ? '昼にする' : '夜にする'}
        >
          <PlayIcon name={game.night ? 'moon' : 'sun'} />
          <span>{game.night ? 'よる' : 'ひる'}</span>
        </button>
        <button
          type="button"
          className={styles.helpButton}
          onClick={() => setPanel('help')}
          aria-label="あそびかた"
        >
          <PlayIcon name="help" />
        </button>
      </div>

      <aside className={styles.memo}>
        <p className={styles.population}>
          ただいま <strong>{game.count}</strong> ﾋﾟｷ
        </p>
        <button
          type="button"
          className={styles.notebookButton}
          onClick={() => setPanel('notebook')}
        >
          <span className={styles.memoTitle}>よりみちのしるし</span>
          <span className={styles.miniStamps} aria-hidden="true">
            {discoveries.slice(0, 3).map((item, index) => (
              <span
                key={item.id}
                className={game.discoveries.includes(item.id) ? styles.stamped : ''}
              >
                <PlayIcon name={discoveryIcons[index]} />
              </span>
            ))}
          </span>
          <span className={styles.memoFoot}>
            {game.discoveries.length} / 6 みつけた <span>↗</span>
          </span>
        </button>
      </aside>

      {ready && !game.discoveries.includes('hello') && !game.discoveries.includes('air') && (
        <div className={styles.firstHint} aria-hidden="true">
          <PlayIcon name="hand" />
          <span>ひとつ、つまんでみて。</span>
          <svg width="50" height="42" viewBox="0 0 50 42" fill="none" aria-hidden="true">
            <path
              d="M4 5c-7 19 16 33 36 23m-9-2 10 2-5 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {loading && (
        <div className={styles.loading} role="status">
          <img src={supikiImage} alt="" />
          <p>あそびば、ひろげてます。</p>
        </div>
      )}
      {failure && (
        <div className={styles.failure} role="alert">
          <img src={supikiImage} alt="スピキ" />
          <p>{failure}</p>
          <button
            type="button"
            onClick={() => {
              setFailure('')
              setLoading(true)
              setRestart((value) => value + 1)
            }}
          >
            もう一度ひらく
          </button>
          <Link to="/">トップに戻る</Link>
        </div>
      )}

      <footer className={styles.footer}>
        <section className={styles.gimmickStrip} aria-label={`${currentTheme.name}のいたずら道具`}>
          {currentTheme.gimmicks.map((gimmick) => (
            <button
              key={gimmick.id}
              type="button"
              disabled={!ready}
              title={gimmick.hint}
              aria-label={gimmick.label}
              aria-pressed={gimmick.toggle ? game.activeGimmicks.includes(gimmick.id) : undefined}
              onClick={() => act(gimmick.id)}
              className={game.activeGimmicks.includes(gimmick.id) ? styles.gimmickActive : ''}
            >
              <PlayIcon name={gimmickIcons[gimmick.id]} />
              <span>{gimmick.label}</span>
            </button>
          ))}
        </section>
        <p className={styles.message} role="status" aria-live="polite">
          <span className={styles.messageDot} />
          {message}
        </p>
        <section className={styles.toolTray} aria-label="あそび道具">
          {tools.map((tool) => {
            const active =
              (tool.action === 'float' && game.floating) || (tool.action === 'radio' && game.radio)
            return (
              <button
                key={tool.action}
                type="button"
                className={`${styles.toolButton} ${active || (tool.action === 'snack' && game.placingCandy) ? styles.activeTool : ''} ${tool.action === 'snack' ? styles.candySource : ''}`}
                {...(tool.action === 'snack' ? candyGesture : {})}
                disabled={!ready || (tool.action === 'add' && game.count >= 20)}
                onClick={() => act(tool.action)}
                aria-pressed={
                  tool.action === 'snack'
                    ? game.placingCandy
                    : tool.action === 'float' || tool.action === 'radio'
                      ? active
                      : undefined
                }
                title={`${tool.label}（${tool.key}）`}
                aria-label={tool.label}
                aria-keyshortcuts={tool.key}
              >
                <PlayIcon name={tool.icon} />
                <span>{tool.short ?? tool.label}</span>
                <kbd>{tool.key}</kbd>
              </button>
            )
          })}
          <span className={styles.trayDivider} />
          <button
            type="button"
            className={`${styles.toolButton} ${styles.photoButton}`}
            disabled={!ready}
            onClick={takePhoto}
          >
            <PlayIcon name="camera" />
            <span>写真をとる</span>
          </button>
          <button
            type="button"
            className={styles.resetButton}
            disabled={!ready}
            onClick={() => act('reset')}
            aria-label="あそびばをおかたづけ"
            title="おかたづけ"
          >
            <PlayIcon name="reset" />
          </button>
        </section>
        <div className={styles.bottomNote}>
          <span>ドラッグでつまむ ・ 余白をドラッグでぐるり</span>
          <span>トリッカル 非公式ファンあそび</span>
        </div>
      </footer>
      <p id="playground-keyboard-help" className={styles.srOnly}>
        キーボードでも遊べます。3Dあそびばにフォーカスして、1でスピキを増やす、2であめの配置モード、3またはスペースでジャンプ、4で重力切り替え、Mでラジオ。左右キーで台を変更し、Shiftと左右キーで視点を回します。下のあそび道具はTabキーとEnterキーでも操作できます。
      </p>

      <dialog
        ref={dialogRef}
        className={`${styles.dialog} ${panel === 'photo' ? styles.photoDialog : ''}`}
        aria-labelledby="playground-dialog-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            setPanel(null)
          }
        }}
        onCancel={(event) => {
          event.preventDefault()
          setPanel(null)
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPanel(null)
        }}
      >
        <div className={styles.dialogInner}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setPanel(null)}
            aria-label="閉じる"
          >
            <PlayIcon name="close" />
          </button>
          {panel === 'help' && (
            <>
              <p className={styles.dialogEyebrow}>あそびのしおり</p>
              <h2 id="playground-dialog-title">だいたい、自由です。</h2>
              <p className={styles.dialogLead}>
                ここは、ｽﾋﾟｷたちのちいさな寄り道。
                <br />
                上手に遊ばなくても、だいじょうぶ。
              </p>
              <ol className={styles.instructions}>
                <li>
                  <PlayIcon name="hand" />
                  <div>
                    <strong>つまむ。はなす。</strong>
                    <p>
                      ｽﾋﾟｷをつまんで、すっと動かして離すと、ぽーん。ちょん、と押すだけでもよろこびます。
                    </p>
                  </div>
                </li>
                <li>
                  <PlayIcon name="snack" />
                  <div>
                    <strong>おやつを置いて、待つ。</strong>
                    <p>
                      「おやつ」を押して置く場所をタップするか、あめのボタンを好きな場所までドラッグ。置いたあめもつまんで動かせます。にせものには、ご注意。
                    </p>
                  </div>
                </li>
                <li>
                  <PlayIcon name="radio" />
                  <div>
                    <strong>おもちゃにも、さわってみる。</strong>
                    <p>
                      トランポリン、ラジオ、ちいさなロケット。画面の中のおもちゃも、ちゃんと動きます。
                    </p>
                  </div>
                </li>
              </ol>
              <div className={styles.keyboard}>
                <span>キーでもあそべます</span>
                <p>
                  <kbd>1</kbd>ふやす <kbd>2</kbd>おやつ <kbd>3</kbd>跳ぶ <kbd>4</kbd>ふわふわ{' '}
                  <kbd>M</kbd>ラジオ
                </p>
                <p>
                  あそびばをクリックしてから <kbd>←</kbd>
                  <kbd>→</kbd> で台をおひっこし。Shiftを押しながらなら視点を回す。<kbd>Space</kbd>{' '}
                  で、もちっ。
                </p>
              </div>
              <p className={styles.credits}>
                <a href="https://trickcal.jp/" target="_blank" rel="noreferrer">
                  トリッカル
                </a>
                の非公式ファン作品です。スピキの画像と3種類の音声は、既存のアプリの素材を使用しています。音楽はこのあそびば用の短いループです。
              </p>
            </>
          )}
          {panel === 'notebook' && (
            <>
              <p className={styles.dialogEyebrow}>あそんだぶんだけ、ぽん。</p>
              <h2 id="playground-dialog-title">よりみちのしるし</h2>
              <p className={styles.dialogLead}>なんでもない日の、ちいさな発見。</p>
              <div className={styles.stampGrid}>
                {discoveries.map((item, index) => {
                  const found = game.discoveries.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`${styles.stampCard} ${found ? styles.foundStamp : ''}`}
                    >
                      <div>
                        <PlayIcon name={discoveryIcons[index]} />
                        <span>{found ? 'もちっ' : '?'}</span>
                      </div>
                      <strong>{item.title}</strong>
                      <p>{item.hint}</p>
                    </div>
                  )
                })}
              </div>
              <p className={styles.notebookFoot}>しるしは、このブラウザにそっと残ります。</p>
            </>
          )}
          {panel === 'photo' && photo && (
            <>
              <p className={styles.dialogEyebrow}>きょうも、よくあそびました。</p>
              <h2 id="playground-dialog-title">きょうの一枚。</h2>
              <div className={styles.postcard}>
                <img src={photo} alt={`スピキ${game.count}匹が遊ぶ、あそびばの記念写真`} />
              </div>
              <a
                className={styles.downloadButton}
                href={photo}
                download={`supiki-${new Date().toLocaleDateString('sv-SE')}.png`}
              >
                <PlayIcon name="download" />
                写真をもちかえる
              </a>
            </>
          )}
        </div>
      </dialog>
    </main>
  )
}
