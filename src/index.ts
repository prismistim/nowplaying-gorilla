/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your Worker in action
 * - Run `npm run deploy` to publish your Worker
 *
 * Bind resources to your Worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import type { ListenBrainsResponse } from './types/ListenBrains'
import type { MisskeyPage } from './types/Misskey'

const KV_KEY = 'lastPostedText'

const randomString = (n = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(n)
  crypto.getRandomValues(array)
  return Array.from(array, (v) => chars[v % chars.length]).join('')
}

export default {
  async fetch(req) {
    const url = new URL(req.url)
    url.pathname = '/__scheduled'
    url.searchParams.append('cron', '* * * * *')
    return new Response(
      `To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`
    )
  },

  // The scheduled handler is invoked at the interval set in our wrangler.jsonc's
  // [[triggers]] configuration.
  async scheduled(_event, env, _ctx): Promise<void> {
    const playingStatusRes = await fetch(
      `https://api.listenbrainz.org/1/user/${env.LISTEN_BRAINZ_USER_NAME}/playing-now`
    )

    if (!playingStatusRes.ok) {
      console.error(`cannot fetch playing status: ${playingStatusRes.status}`)
      return
    }

    const playingStatus =
      (await playingStatusRes.json()) as ListenBrainsResponse
    console.log(JSON.stringify(playingStatus))

    const metadata =
      playingStatus.payload.listens.length > 0
        ? playingStatus.payload.listens[0].track_metadata
        : null
    let postText = metadata
      ? `${metadata.artist_name} - ${metadata.track_name} ${
          metadata.release_name ? `(from: ${metadata.release_name})` : ''
        }`
      : 'nothing playing!'

    if ((await env.nowplaying_gorilla.get(KV_KEY)) === postText) {
      console.log('nothing update. exit.')
      return
    }

    env.nowplaying_gorilla.put(KV_KEY, postText)

    if (metadata?.additional_info.origin_url)
      postText += `\n${metadata.additional_info.origin_url}`

    const pageRes = await fetch(`https://${env.MISSKEY_HOST}/api/pages/show`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pageId: env.MISSKEY_PAGE_ID
      })
    })

    if (!pageRes.ok) {
      console.error(
        `cannot fetch page!: ${JSON.stringify(await pageRes.json())}`
      )
      return
    }

    const pageData = (await pageRes.json()) as MisskeyPage

    const payload = {
      pageId: env.MISSKEY_PAGE_ID,
      title: pageData.title,
      summary: pageData.summary,
      name: pageData.name,
      eyeCatchingImageId: pageData.eyeCatchingImageId,
      alignCenter: false,
      hideTitleWhenPinned: false,
      font: pageData.font,
      script: pageData.script,
      variables: [],
      content: [
        {
          id: randomString(),
          type: 'text',
          text: postText
        }
      ]
    }

    try {
      const postRes = await fetch(
        `https://${env.MISSKEY_HOST}/api/pages/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.MISSKEY_TOKEN}`
          },
          body: JSON.stringify(payload)
        }
      )

      if (!postRes.ok) {
        console.error(await postRes.json())
      }
    } catch (err) {
      console.log(err)
    }
  }
} satisfies ExportedHandler<Env>
